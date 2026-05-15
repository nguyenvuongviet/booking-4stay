import { Injectable, Logger } from '@nestjs/common';
import { sanitizeRoom } from 'src/utils/sanitize/room.sanitize';
import { PrismaService } from '../prisma/prisma.service';

const ROOM_INCLUDE = {
  room_images: true,
  room_amenities: { include: { amenities: true } },
  room_beds: true,
  location_countries: true,
  location_provinces: true,
  location_wards: true,
  users: true,
};

/**
 * Collaborative Filtering Strategy (Đơn giản — Item-based)
 *
 * Logic: Tìm users khác cũng đã book cùng phòng với user hiện tại
 *        → lấy phòng họ đã book mà user hiện tại chưa book.
 *
 * Ý nghĩa: "Khách đặt phòng giống bạn cũng thích những phòng này"
 */
@Injectable()
export class CollaborativeService {
  private readonly logger = new Logger(CollaborativeService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Gợi ý Collaborative Filtering cho 1 user.
   * Yêu cầu: User phải có ≥2 bookings.
   */
  async getCollaborativeRecommendations(
    userId: number,
    limit = 6,
  ): Promise<any[]> {
    // 1. Lấy danh sách phòng user đã book
    const userBookings = await this.prisma.bookings.findMany({
      where: {
        userId,
        status: { in: ['CHECKED_OUT', 'CONFIRMED', 'CHECKED_IN'] },
        isDeleted: false,
      },
      select: { roomId: true },
      distinct: ['roomId'],
    });

    const userRoomIds = userBookings.map((b) => b.roomId);

    if (userRoomIds.length < 2) {
      return []; // Cần ít nhất 2 bookings để có dữ liệu collaborative
    }

    // 2. Tìm users khác cũng đã book cùng phòng (similar users)
    const similarUserBookings = await this.prisma.bookings.findMany({
      where: {
        roomId: { in: userRoomIds },
        userId: { not: userId },
        status: { in: ['CHECKED_OUT', 'CONFIRMED', 'CHECKED_IN'] },
        isDeleted: false,
      },
      select: { userId: true, roomId: true },
    });

    // Đếm mức độ "giống nhau" — user nào book nhiều phòng trùng nhất = giống nhất
    const similarityMap: Record<number, number> = {};
    for (const sb of similarUserBookings) {
      similarityMap[sb.userId] = (similarityMap[sb.userId] || 0) + 1;
    }

    // Sort by similarity DESC, lấy top 10 similar users
    const topSimilarUserIds = Object.entries(similarityMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([id]) => Number(id));

    if (topSimilarUserIds.length === 0) {
      return [];
    }

    // 3. Lấy phòng mà similar users đã book MÀ user hiện tại CHƯA book
    const candidateBookings = await this.prisma.bookings.findMany({
      where: {
        userId: { in: topSimilarUserIds },
        roomId: { notIn: userRoomIds },
        status: { in: ['CHECKED_OUT', 'CONFIRMED', 'CHECKED_IN'] },
        isDeleted: false,
      },
      select: { roomId: true, userId: true },
    });

    // Đếm mỗi phòng được bao nhiêu similar users book → điểm cao hơn
    const roomScoreMap: Record<number, number> = {};
    for (const cb of candidateBookings) {
      const similarity = similarityMap[cb.userId] || 1;
      roomScoreMap[cb.roomId] = (roomScoreMap[cb.roomId] || 0) + similarity;
    }

    // Sort rooms by score DESC
    const topRoomIds = Object.entries(roomScoreMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([id]) => Number(id));

    if (topRoomIds.length === 0) {
      return [];
    }

    // 4. Lấy full room data
    const rooms = await this.prisma.rooms.findMany({
      where: {
        id: { in: topRoomIds },
        isDeleted: false,
      },
      include: ROOM_INCLUDE,
    });

    // Giữ thứ tự theo score
    const roomMap = new Map(rooms.map((r) => [r.id, r]));
    return topRoomIds
      .map((id) => roomMap.get(id))
      .filter(Boolean)
      .map((r) => sanitizeRoom(r));
  }
}
