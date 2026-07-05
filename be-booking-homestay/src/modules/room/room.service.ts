import { BadRequestException, Injectable } from '@nestjs/common';
import { ensureDateRange } from 'src/utils/date.util';
import { sanitizeRoom } from 'src/utils/sanitize/room.sanitize';
import { ACTIVE_BOOKING_STATUSES } from '../booking/booking.constants';
import { RagIndexService } from '../chatbot/rag-index.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomFilterDto } from './dto/filter-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

const SORT_BY = new Set(['price', 'rating', 'createdAt', 'id']);
const SORT_ORDER = new Set(['asc', 'desc']);

@Injectable()
export class RoomService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ragIndexService: RagIndexService,
  ) {}

  async findAll(query: RoomFilterDto) {
    let {
      search,
      minPrice,
      maxPrice,
      adults,
      children,
      minRating,
      checkIn,
      checkOut,
      sortBy = 'id',
      sortOrder = 'desc',
      page = 1,
      pageSize = 12,
      provinceId,
    } = query;

    search = search?.trim();
    sortBy = SORT_BY.has(sortBy ?? '') ? sortBy! : 'id';
    sortOrder = SORT_ORDER.has(sortOrder ?? '') ? sortOrder! : 'desc';
    page = Math.max(1, Number(page) || 1);
    pageSize = Math.max(1, Number(pageSize) || 12);

    if (minPrice && maxPrice && minPrice > maxPrice)
      throw new BadRequestException(
        'Giá tối thiểu không được lớn hơn giá tối đa',
      );

    let inDate: Date | undefined;
    let outDate: Date | undefined;
    if (checkIn || checkOut) {
      if (!checkIn || !checkOut)
        throw new BadRequestException('Cần truyền đủ cả checkIn và checkOut');
      const r = ensureDateRange(checkIn, checkOut);
      inDate = r.inDate;
      outDate = r.outDate;
    }

    const where: any = { isDeleted: false };
    if (provinceId) {
      where.provinceId = Number(provinceId);
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { location_provinces: { name: { contains: search } } },
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = minPrice;
      if (maxPrice) where.price.lte = maxPrice;
    }

    if (adults) where.adultCapacity = { gte: adults };
    if (children !== undefined) where.childCapacity = { gte: children };
    if (minRating) where.rating = { gte: minRating };

    if (inDate && outDate) {
      where.bookings = {
        none: {
          status: { in: ACTIVE_BOOKING_STATUSES },
          AND: [{ checkOut: { gt: inDate } }, { checkIn: { lt: outDate } }],
        },
      };
      where.room_availability = {
        none: {
          date: { gte: inDate, lt: outDate },
          isAvailable: false,
        },
      };
    }

    const skip = (page - 1) * pageSize;
    const orderBy = { [sortBy]: sortOrder };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.rooms.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        include: {
          room_images: true,
          room_amenities: { include: { amenities: true } },
          room_beds: true,
          location_countries: true,
          location_provinces: true,
          location_wards: true,
          users: true,
        },
      }),
      this.prisma.rooms.count({ where }),
    ]);

    return {
      message: 'Lấy danh sách phòng thành công',
      page,
      pageSize,
      total,
      items: sanitizeRoom(items),
    };
  }

  async findOne(id: number) {
    const room = await this.prisma.rooms.findFirst({
      where: {
        id,
        isDeleted: false,
        users: {
          isActive: true,
          isDeleted: false,
        },
      },
      include: {
        location_countries: true,
        location_provinces: true,
        location_wards: true,
        room_images: true,
        room_amenities: {
          include: { amenities: true },
        },
        room_beds: true,
        users: true,
      },
    });

    if (!room) {
      throw new BadRequestException('Phòng không tồn tại');
    }

    return sanitizeRoom(room);
  }

  async create(hostId: number = 1, dto: CreateRoomDto) {
    const fullAddress = await this.getFullAddress(
      dto.street,
      dto.wardId,
      dto.provinceId,
      1, // Default countryId to 1 (Việt Nam)
    );
    const room = await this.prisma.rooms.create({
      data: { ...dto, hostId, fullAddress },
    });
    // Kích hoạt đồng bộ vector ngầm
    this.ragIndexService
      .indexRoom(room.id)
      .catch((e) => console.error('[RAG] Failed to index room:', e));
    return room;
  }

  async update(id: number, dto: UpdateRoomDto) {
    const existing = await this.findOne(id);

    const street = dto.street !== undefined ? dto.street : existing.street;
    const wardId = dto.wardId !== undefined ? dto.wardId : existing.wardId;
    const provinceId =
      dto.provinceId !== undefined ? dto.provinceId : existing.provinceId;
    const countryId = existing.countryId;

    const fullAddress = await this.getFullAddress(
      street,
      wardId,
      provinceId,
      countryId,
    );

    const room = await this.prisma.rooms.update({
      where: { id },
      data: { ...dto, fullAddress },
    });
    // Kích hoạt đồng bộ vector ngầm
    this.ragIndexService
      .indexRoom(id)
      .catch((e) => console.error('[RAG] Failed to index room:', e));
    return room;
  }

  async remove(id: number) {
    const roomExist = await this.prisma.rooms.findFirst({
      where: { id, isDeleted: false },
      select: { id: true },
    });

    if (!roomExist) {
      throw new BadRequestException('Phòng không tồn tại hoặc đã bị xoá');
    }

    const activeBookings = await this.prisma.bookings.count({
      where: {
        roomId: id,
        status: { in: ACTIVE_BOOKING_STATUSES },
      },
    });

    if (activeBookings > 0) {
      throw new BadRequestException(
        'Không thể xoá phòng đang có booking chưa hoàn thành',
      );
    }

    await this.prisma.rooms.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    // Xoá vector khi phòng bị xoá
    await this.prisma.room_embeddings
      .delete({ where: { roomId: id } })
      .catch(() => {});
  }

  async getFullAddress(
    street?: string | null,
    wardId?: number | null,
    provinceId?: number | null,
    countryId?: number | null,
  ): Promise<string> {
    const parts: string[] = [];
    if (street) parts.push(street);

    if (wardId) {
      const ward = await this.prisma.location_wards.findUnique({
        where: { id: wardId },
        select: { name: true },
      });
      if (ward) parts.push(ward.name);
    }

    if (provinceId) {
      const province = await this.prisma.location_provinces.findUnique({
        where: { id: provinceId },
        select: { name: true },
      });
      if (province) parts.push(province.name);
    }

    if (countryId) {
      const country = await this.prisma.location_countries.findUnique({
        where: { id: countryId },
        select: { name: true },
      });
      if (country) parts.push(country.name);
    }

    return parts.join(', ');
  }
}
