import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RagEmbeddingService } from './rag-embedding.service';

@Injectable()
export class RagIndexService {
  private readonly logger = new Logger(RagIndexService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly embedding: RagEmbeddingService,
  ) { }

  /**
   * Tạo văn bản đại diện cho 1 phòng (dùng để embed)
   */
  private buildRoomContent(room: any): string {
    const parts: string[] = [];

    parts.push(`Tên phòng: ${room.name}`);

    if (room.description) {
      parts.push(`Mô tả: ${room.description.slice(0, 300)}`);
    }

    const province = room.location_provinces?.name;
    const ward = room.location_wards?.name;
    const street = room.street;
    const fullAddress = room.fullAddress;

    if (fullAddress) parts.push(`Địa chỉ: ${fullAddress}`);
    else {
      const addr = [street, ward, province].filter(Boolean).join(', ');
      if (addr) parts.push(`Địa chỉ: ${addr}`);
    }

    if (province) parts.push(`Tỉnh/Thành phố: ${province}`);

    parts.push(`Giá: ${Number(room.price).toLocaleString('vi-VN')} VND/đêm`);
    parts.push(
      `Sức chứa: ${room.adultCapacity} người lớn, ${room.childCapacity} trẻ em`,
    );

    if (room.rating) parts.push(`Đánh giá: ${room.rating}/5`);

    const amenities = room.room_amenities
      ?.map((ra: any) => ra.amenities?.name)
      .filter(Boolean);
    if (amenities?.length) {
      parts.push(`Tiện nghi: ${amenities.join(', ')}`);
    }

    const beds = room.room_beds
      ?.map((b: any) => `${b.quantity} ${b.type}`)
      .filter(Boolean);
    if (beds?.length) {
      parts.push(`Giường: ${beds.join(', ')}`);
    }

    return parts.join('. ');
  }

  /**
   * Index (tạo + lưu embedding) cho 1 phòng
   */
  async indexRoom(roomId: number): Promise<void> {
    const room = await this.prisma.rooms.findUnique({
      where: { id: roomId, isDeleted: false },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        adultCapacity: true,
        childCapacity: true,
        rating: true,
        street: true,
        fullAddress: true,
        location_provinces: { select: { name: true } },
        location_wards: { select: { name: true } },
        room_amenities: {
          select: { amenities: { select: { name: true } } },
        },
        room_beds: { select: { type: true, quantity: true } },
      },
    });

    if (!room) {
      this.logger.warn(`Room ${roomId} not found, skipping index.`);
      return;
    }

    const content = this.buildRoomContent(room);
    const vector = await this.embedding.embedText(content);

    await this.prisma.room_embeddings.upsert({
      where: { roomId },
      create: { roomId, content, embedding: vector },
      update: { content, embedding: vector },
    });

    this.logger.log(`Indexed room ${roomId}: "${room.name}"`);
  }

  /**
   * Index toàn bộ phòng active (dùng khi seed hoặc re-index)
   */
  async indexAllRooms(): Promise<{ indexed: number; failed: number }> {
    const rooms = await this.prisma.rooms.findMany({
      where: {
        isDeleted: false,
        users: { isActive: true, isDeleted: false },
      },
      select: { id: true },
    });

    let indexed = 0;
    let failed = 0;

    for (const room of rooms) {
      try {
        await this.indexRoom(room.id);
        indexed++;
        // Tránh rate limit Gemini Embeddings API
        await new Promise((r) => setTimeout(r, 200));
      } catch (err) {
        this.logger.error(`Failed to index room ${room.id}: ${err}`);
        failed++;
      }
    }

    this.logger.log(`Index complete: ${indexed} indexed, ${failed} failed`);
    return { indexed, failed };
  }

  /**
   * Tìm phòng tương đồng nhất với query bằng cosine similarity
   * @param query câu hỏi từ người dùng
   * @param topK số phòng trả về (mặc định 5)
   * @param threshold ngưỡng similarity tối thiểu (mặc định 0.3)
   */
  async searchSimilarRooms(
    query: string,
    topK = 5,
    threshold = 0.3,
  ): Promise<number[]> {
    // 1. Embed query
    const queryVector = await this.embedding.embedText(query);

    // 2. Fetch tất cả embeddings đã lưu
    const allEmbeddings = await this.prisma.room_embeddings.findMany({
      select: { roomId: true, embedding: true },
    });

    if (allEmbeddings.length === 0) return [];

    // 3. Tính cosine similarity
    const scored = allEmbeddings
      .map((row) => {
        const vector = Array.isArray(row.embedding)
          ? (row.embedding as number[])
          : [];
        const score = this.embedding.cosineSimilarity(queryVector, vector);
        return { roomId: row.roomId, score };
      })
      .filter((r) => r.score >= threshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    return scored.map((r) => r.roomId);
  }

  /**
   * Lấy thông tin đầy đủ của các phòng theo ID (đã qua RAG filter)
   */
  async getRoomsByIds(roomIds: number[]) {
    if (roomIds.length === 0) return [];

    const rooms = await this.prisma.rooms.findMany({
      where: {
        id: { in: roomIds },
        isDeleted: false,
        status: 'AVAILABLE',
        users: { isActive: true, isDeleted: false },
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        adultCapacity: true,
        childCapacity: true,
        status: true,
        rating: true,
        reviewCount: true,
        street: true,
        fullAddress: true,
        location_countries: { select: { name: true } },
        location_provinces: { select: { name: true } },
        location_wards: { select: { name: true } },
        room_amenities: {
          take: 8,
          select: {
            amenities: { select: { name: true, category: true } },
          },
        },
        room_beds: { select: { type: true, quantity: true } },
      },
    });

    // Giữ nguyên thứ tự theo score (roomIds đã sort)
    const roomMap = new Map(rooms.map((r) => [r.id, r]));
    return roomIds
      .map((id) => roomMap.get(id))
      .filter(Boolean)
      .map((room) => ({
        id: room!.id,
        name: room!.name,
        description: room!.description
          ? room!.description.slice(0, 200) + (room!.description.length > 200 ? '...' : '')
          : null,
        pricePerNight: Number(room!.price),
        capacity: {
          adults: room!.adultCapacity,
          children: room!.childCapacity,
        },
        status: room!.status,
        rating: Number(room!.rating || 0),
        reviewCount: room!.reviewCount || 0,
        address: {
          country: room!.location_countries?.name || null,
          province: room!.location_provinces?.name || null,
          ward: room!.location_wards?.name || null,
          street: room!.street || null,
          fullAddress: room!.fullAddress || null,
        },
        amenities: room!.room_amenities
          .map((ra) => ra.amenities?.name)
          .filter(Boolean),
        beds: room!.room_beds.map((b) => ({ type: b.type, quantity: b.quantity })),
      }));
  }
}
