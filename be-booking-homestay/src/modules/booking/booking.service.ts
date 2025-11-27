import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { bookings_status } from '@prisma/client';
import { AvailabilityHelper } from 'src/helpers/availability.helper';
import { LoyaltyProgram } from 'src/helpers/loyalty.helper';
import { PricingHelper } from 'src/helpers/pricing.helper';
import { ensureDateRange } from 'src/utils/date.util';
import { sanitizeBooking } from 'src/utils/sanitize/booking.sanitize';
import { PrismaService } from '../prisma/prisma.service';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ListBookingQuery } from './dto/list-booking.query';
import { RoomAvailabilityDto } from './dto/room-availability.dto';

@Injectable()
export class BookingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pricing: PricingHelper,
    private readonly availability: AvailabilityHelper,
    private readonly loyaltyProgram: LoyaltyProgram,
  ) {}

  async create(userId: number, dto: CreateBookingDto) {
    const {
      roomId,
      checkIn,
      checkOut,
      adults = 1,
      children = 0,
      guestFullName,
      guestEmail,
      guestPhoneNumber,
      specialRequest,
    } = dto;

    const { inDate, outDate } = ensureDateRange(checkIn, checkOut);

    const room = await this.prisma.rooms.findFirst({
      where: { id: roomId, isDeleted: false },
      select: {
        id: true,
        price: true,
        adultCapacity: true,
        childCapacity: true,
      },
    });
    if (!room) throw new BadRequestException('Phòng không tồn tại');
    if (adults > room.adultCapacity || children > room.childCapacity)
      throw new BadRequestException('Vượt quá sức chứa phòng');

    const hasOverlap = await this.availability.hasOverlap(
      roomId,
      inDate,
      outDate,
    );
    if (hasOverlap)
      throw new BadRequestException('Khoảng ngày đã có người giữ hoặc bị khóa');

    const totalPrice = await this.pricing.priceForRange(
      roomId,
      Number(room.price),
      inDate,
      outDate,
    );

    const booking = await this.prisma.bookings.create({
      data: {
        userId,
        roomId,
        guestFullName,
        guestEmail,
        guestPhoneNumber,
        specialRequest: specialRequest ?? null,
        checkIn: inDate,
        checkOut: outDate,
        adults,
        children,
        totalPrice,
        status: 'PENDING',
      },
      include: {
        rooms: { include: { room_images: true } },
      },
    });

    return {
      message: 'Tạo đơn đặt thành công',
      booking: sanitizeBooking(booking),
    };
  }

  async listMine(userId: number, q: ListBookingQuery) {
    const { page = 1, pageSize = 12, sortOrder = 'desc' } = q;
    const skip = (page - 1) * pageSize;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.bookings.findMany({
        where: { userId },
        orderBy: { createdAt: sortOrder },
        skip,
        take: pageSize,
        include: {
          rooms: {
            include: {
              location_provinces: true,
              location_districts: true,
              location_wards: true,
              room_images: true,
              room_amenities: {
                include: { amenities: true },
              },
              room_beds: true,
              users: true,
            },
          },
          users: true,
          reviews: true,
        },
      }),
      this.prisma.bookings.count({ where: { userId } }),
    ]);

    return {
      page,
      pageSize,
      total,
      items: sanitizeBooking(items),
    };
  }

  async cancel(
    id: number,
    requesterId: number,
    role: string,
    dto: CancelBookingDto,
  ) {
    const booking = await this.prisma.bookings.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('Không tìm thấy booking');

    const now = new Date();
    if (role !== 'ADMIN' && booking.userId !== requesterId)
      throw new ForbiddenException('Bạn không có quyền hủy booking này');

    if (booking.status) {
      if (!['PENDING', 'CONFIRMED'].includes(booking.status))
        throw new BadRequestException('Chỉ hủy được khi PENDING/CONFIRMED');
    }
    if (now >= booking.checkIn)
      throw new BadRequestException('Không thể hủy khi đã đến ngày check-in');

    const updated = await this.prisma.bookings.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelReason: dto.reason ?? null,
        updatedAt: new Date(),
      },
      include: { rooms: { include: { room_images: true } } },
    });

    return {
      message: 'Hủy booking thành công',
      booking: sanitizeBooking([updated]),
    };
  }

  async detail(id: number, requesterId?: number | null, role?: string | null) {
    const booking = await this.prisma.bookings.findUnique({
      where: { id },
      include: {
        rooms: { include: { room_images: true, users: true } },
        users: true,
        reviews: true,
      },
    });
    if (!booking) throw new NotFoundException('Không tìm thấy booking');
    if (role !== 'ADMIN' && requesterId && booking.userId !== requesterId) {
      throw new ForbiddenException('Bạn không có quyền xem booking này');
    }
    return sanitizeBooking(booking);
  }

  async listAll(q: ListBookingQuery) {
    const { page = 1, pageSize = 12, sortOrder = 'desc' } = q;
    const skip = (page - 1) * pageSize;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.bookings.findMany({
        where: {},
        orderBy: { createdAt: sortOrder },
        skip,
        take: pageSize,
        include: {
          rooms: { include: { room_images: true, users: true } },
          users: true,
        },
      }),
      this.prisma.bookings.count(),
    ]);

    return {
      page,
      pageSize,
      total,
      items: sanitizeBooking(items),
    };
  }

  async roomAvailability(roomId: number, q: RoomAvailabilityDto) {
    const { inDate, outDate } = ensureDateRange(q.checkIn, q.checkOut);

    const room = await this.prisma.rooms.findFirst({
      where: { id: roomId, isDeleted: false },
      select: { id: true, price: true },
    });
    if (!room) throw new NotFoundException('Phòng không tồn tại');

    const conflict = await this.availability.hasOverlap(
      roomId,
      inDate,
      outDate,
    );
    const totalAmount = conflict
      ? null
      : await this.pricing.priceForRange(
          roomId,
          Number(room.price),
          inDate,
          outDate,
        );

    return { roomId, available: !conflict, totalAmount };
  }

  async listByRoom(roomId: number) {
    const items = await this.prisma.bookings.findMany({
      where: { roomId },
      // include: { rooms: { include: { room_images: true } }, users: true },
      include: { users: true },
    });
    return { items: sanitizeBooking(items) };
  }

  async updateStatus(orderId: number, status: bookings_status) {
    const updated = await this.prisma.bookings.update({
      where: { id: orderId },
      data: { status },
    });

    if (status === 'CHECKED_OUT') {
      await this.loyaltyProgram.recalculateLoyaltyLevel(updated.userId);
    }

    return {
      message: 'Cập nhật trạng thái booking thành công',
      data: updated,
    };
  }
}
