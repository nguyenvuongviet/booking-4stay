import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { rooms_status } from '@prisma/client';
import { eachDayOfInterval, format, startOfDay, subDays } from 'date-fns';
import { AvailabilityHelper } from 'src/helpers/availability.helper';
import { PricingHelper } from 'src/helpers/pricing.helper';
import { ensureDateRange } from 'src/utils/date.util';
import { sanitizeBooking } from 'src/utils/sanitize/booking.sanitize';
import { AppConfigsService } from '../app-configs/app-configs.service';
import { AppConfigKey } from '../app-configs/constants/app-config.constant';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../user/dto/enum.dto';
import { ACTIVE_BOOKING_STATUSES } from './booking.constants';
import { ListBookingQuery } from './dto/list-booking.query';
import { RoomAvailabilityDto } from './dto/room-availability.dto';

@Injectable()
export class BookingQueryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly appConfigsService: AppConfigsService,
    private readonly availability: AvailabilityHelper,
    private readonly pricing: PricingHelper,
  ) {}

  /**
   * Lấy danh sách lịch sử đặt phòng của user đang đăng nhập (có phân trang).
   */
  async listMine(userId: number, q: ListBookingQuery) {
    const { page = 1, pageSize = 12, sortOrder = 'desc' } = q;

    const where = { userId };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.bookings.findMany({
        where,
        orderBy: { createdAt: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          rooms: {
            include: {
              location_provinces: true,
              location_wards: true,
              room_images: true,
              room_amenities: { include: { amenities: true } },
              room_beds: true,
              users: true,
            },
          },
          users: true,
          reviews: true,
        },
      }),
      this.prisma.bookings.count({ where }),
    ]);

    const expiryMinutes = await this.appConfigsService.getConfigValue<number>(
      AppConfigKey.BOOKING_EXPIRY_MINUTES,
      15,
    );
    return {
      page,
      pageSize,
      total,
      items: sanitizeBooking(items.map((i) => ({ ...i, expiryMinutes }))),
    };
  }

  /**
   * Xem chi tiết một đơn đặt phòng cụ thể. Yêu cầu quyền truy cập của chính user đó hoặc Admin.
   */
  async detail(id: number, requesterId?: number | null, role?: string | null) {
    const booking = await this.prisma.bookings.findUnique({
      where: { id },
      include: {
        rooms: { include: { room_images: true, users: true } },
        users: true,
        reviews: true,
        logs: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!booking) throw new NotFoundException('Không tìm thấy booking');
    if (role !== Role.ADMIN && requesterId && booking.userId !== requesterId) {
      throw new ForbiddenException('Bạn không có quyền xem booking này');
    }
    const expiryMinutes = await this.appConfigsService.getConfigValue<number>(
      AppConfigKey.BOOKING_EXPIRY_MINUTES,
      15,
    );
    return sanitizeBooking({ ...booking, expiryMinutes });
  }

  /**
   * Dành cho Admin: Lấy toàn bộ danh sách booking trên hệ thống (có phân trang).
   */
  async listAll(q: ListBookingQuery) {
    const { page = 1, pageSize = 12, sortOrder = 'desc' } = q;
    const skip = (page - 1) * pageSize;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.bookings.findMany({
        where: {},
        orderBy: { updatedAt: sortOrder },
        skip,
        take: pageSize,
        include: {
          rooms: { include: { room_images: true, users: true } },
          users: true,
        },
      }),
      this.prisma.bookings.count(),
    ]);

    return { page, pageSize, total, items: sanitizeBooking(items) };
  }

  /**
   * Lấy danh sách các đơn đặt phòng thuộc về một phòng (Room) cụ thể.
   */
  async listByRoom(roomId: number) {
    const items = await this.prisma.bookings.findMany({
      where: { roomId },
      orderBy: { createdAt: 'desc' },
      include: { users: true },
    });
    return sanitizeBooking(items);
  }

  /**
   * Lấy toàn bộ danh sách đơn đặt phòng của một user cụ thể (Admin dùng để check lịch sử).
   */
  async listByUser(userId: number) {
    const items = await this.prisma.bookings.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: { rooms: { include: { room_images: true } }, users: true },
    });
    return sanitizeBooking(items);
  }

  /**
   * Kiểm tra phòng có trống trong một khoảng ngày cụ thể không và báo trước tổng giá tiền ước tính.
   */
  async roomAvailability(roomId: number, q: RoomAvailabilityDto) {
    const { inDate, outDate } = ensureDateRange(q.checkIn, q.checkOut);

    const room = await this.prisma.rooms.findFirst({
      where: { id: roomId, isDeleted: false },
      select: { id: true, price: true, status: true },
    });
    if (!room)
      throw new NotFoundException('Phòng không tồn tại hoặc đã bị xóa');

    if (room.status === rooms_status.MAINTENANCE) {
      return { roomId, available: false, totalAmount: null };
    }

    const isOccupied = await this.availability.hasOverlap(
      roomId,
      inDate,
      outDate,
    );

    let totalAmount: number | null = null;
    if (!isOccupied) {
      totalAmount = await this.pricing.priceForRange(
        roomId,
        Number(room.price),
        inDate,
        outDate,
      );
    }

    return { roomId, available: !isOccupied, totalAmount };
  }

  /**
   * Lấy danh sách tất cả các ngày mà phòng không khả dụng (đã có khách đặt hoặc bị Host khóa lại).
   * Hàm này dùng để frontend chặn chọn ngày trên Calendar.
   */
  async getUnavailableDays(roomId: number, excludeBookingId?: number) {
    if (!roomId) throw new BadRequestException('Thiếu roomId');

    const today = startOfDay(new Date());

    const [bookings, blocked] = await Promise.all([
      this.prisma.bookings.findMany({
        where: {
          roomId,
          isDeleted: false,
          status: { in: ACTIVE_BOOKING_STATUSES },
          checkOut: { gt: today },
          ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
        },
        select: { checkIn: true, checkOut: true },
      }),
      this.prisma.room_availability.findMany({
        where: { roomId, isAvailable: false, date: { gte: today } },
        select: { date: true },
      }),
    ]);

    const unavailableSet = new Set<string>();

    for (const b of bookings) {
      const start = b.checkIn < today ? today : startOfDay(b.checkIn);
      const end = startOfDay(subDays(b.checkOut, 1));
      if (start <= end) {
        eachDayOfInterval({ start, end }).forEach((d) => {
          unavailableSet.add(format(d, 'yyyy-MM-dd'));
        });
      }
    }

    blocked.forEach((b) => unavailableSet.add(format(b.date, 'yyyy-MM-dd')));

    const sortedDays = Array.from(unavailableSet).sort();

    return {
      message: 'Danh sách ngày không khả dụng của phòng',
      roomId,
      total: sortedDays.length,
      days: sortedDays,
    };
  }
}
