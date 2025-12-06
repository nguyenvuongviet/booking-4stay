import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { bookings_status } from '@prisma/client';
import { eachDayOfInterval, formatISO } from 'date-fns';
import { ADMIN_EMAIL } from 'src/common/constant/app.constant';
import { AvailabilityHelper } from 'src/helpers/availability.helper';
import { LoyaltyProgram } from 'src/helpers/loyalty.helper';
import { PricingHelper } from 'src/helpers/pricing.helper';
import { ensureDateRange } from 'src/utils/date.util';
import { sanitizeBooking } from 'src/utils/sanitize/booking.sanitize';
import { MailService } from '../mail/mail.service';
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
    private readonly mailService: MailService,
  ) {}

  private async changeBookingStatus(
    bookingId: number,
    newStatus: bookings_status,
    options?: {
      reason?: string;
      allowOverride?: boolean;
      notifyUser?: boolean;
      notifyAdmin?: boolean;
      paidAmount?: number;
    },
  ) {
    const booking = await this.prisma.bookings.findUnique({
      where: { id: bookingId },
      include: { rooms: true },
    });

    if (!booking) throw new NotFoundException('Không tìm thấy booking');

    const current = booking.status;
    const allowOverride = options?.allowOverride ?? false;

    if (!allowOverride) {
      const validTransitions: Record<bookings_status, bookings_status[]> = {
        PENDING: ['PARTIALLY_PAID', 'CONFIRMED', 'CANCELLED'],
        PARTIALLY_PAID: ['CONFIRMED', 'CANCELLED'],
        CONFIRMED: ['CHECKED_IN', 'CANCELLED', 'WAITING_REFUND'],
        CHECKED_IN: ['CHECKED_OUT', 'CANCELLED'],
        CHECKED_OUT: [],
        CANCELLED: ['WAITING_REFUND'],
        WAITING_REFUND: ['REFUNDED'],
        REFUNDED: [],
      };

      if (!validTransitions[current].includes(newStatus)) {
        throw new BadRequestException(
          `Không thể chuyển trạng thái từ ${current} sang ${newStatus}`,
        );
      }
    }

    const updated = await this.prisma.bookings.update({
      where: { id: bookingId },
      data: {
        status: newStatus,
        cancelReason: options?.reason ?? null,
        paidAmount:
          newStatus === 'CHECKED_OUT'
            ? booking.totalPrice
            : (options?.paidAmount ?? undefined),
        updatedAt: new Date(),
      },
      include: { rooms: true },
    });

    if (newStatus === 'CHECKED_OUT') {
      await this.loyaltyProgram.recalculateLoyaltyLevel(updated.userId);
    }

    const notifyUser = options?.notifyUser ?? true;
    const notifyAdmin = options?.notifyAdmin ?? true;

    const mailType =
      newStatus === 'CONFIRMED'
        ? 'BOOKING_CONFIRMED'
        : newStatus === 'CANCELLED'
          ? 'BOOKING_CANCELLED'
          : 'BOOKING_PENDING';

    if (notifyUser) {
      this.mailService
        .sendBookingMail(updated.guestEmail, mailType, updated)
        .catch((err) => console.error('Email user error:', err));
    }

    if (notifyAdmin) {
      this.mailService
        .sendBookingMail(ADMIN_EMAIL, mailType, updated)
        .catch((err) => console.error('Email admin error:', err));
    }

    return updated;
  }

  private determineCancelFinalStatus(paidAmount: string) {
    const isPaid = paidAmount > '0';

    return isPaid
      ? {
          finalStatus: bookings_status.REFUNDED,
          message:
            'Booking đã được chuyển sang trạng thái REFUNDED để hoàn tiền.',
        }
      : {
          finalStatus: bookings_status.CANCELLED,
          message: 'Booking hủy thành công. Không cần hoàn tiền.',
        };
  }

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
      paymentMethod,
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
        paymentMethod,
        paidAmount: 0,
      },
      include: { rooms: { include: { room_images: true } } },
    });

    await this.mailService.sendBookingMail(
      booking.guestEmail,
      'BOOKING_PENDING',
      booking,
    );
    await this.mailService.sendBookingMail(
      ADMIN_EMAIL,
      'BOOKING_PENDING',
      booking,
    );

    return {
      message: 'Tạo đơn đặt thành công',
      booking: sanitizeBooking(booking),
    };
  }

  async listMine(userId: number, q: ListBookingQuery) {
    const { page = 1, pageSize = 12, sortOrder = 'desc' } = q;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.bookings.findMany({
        where: { userId },
        orderBy: { createdAt: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          rooms: {
            include: {
              location_provinces: true,
              location_districts: true,
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
      this.prisma.bookings.count({ where: { userId } }),
    ]);

    return {
      page,
      pageSize,
      total,
      items: sanitizeBooking(items),
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
      orderBy: { createdAt: 'desc' },
      include: { users: true },
    });
    return sanitizeBooking(items);
  }

  async getUnavailableDays(roomId: number) {
    if (!roomId) throw new BadRequestException('Thiếu roomId');

    const bookings = await this.prisma.bookings.findMany({
      where: {
        roomId,
        isDeleted: false,
        status: {
          in: [
            'PENDING',
            'CONFIRMED',
            'CHECKED_IN',
            'CHECKED_OUT',
          ] as bookings_status[],
        },
      },
      select: { checkIn: true, checkOut: true },
    });

    const blocked = await this.prisma.room_availability.findMany({
      where: { roomId, isAvailable: false },
      select: { date: true },
    });

    const unavailable = new Set<string>();

    for (const b of bookings) {
      const range = eachDayOfInterval({
        start: b.checkIn,
        end: new Date(b.checkOut.getTime() - 86400000),
      });
      range.forEach((d) =>
        unavailable.add(formatISO(d, { representation: 'date' })),
      );
    }

    blocked.forEach((b) =>
      unavailable.add(formatISO(b.date, { representation: 'date' })),
    );

    return {
      message: 'Danh sách ngày không khả dụng của phòng',
      roomId,
      total: unavailable.size,
      days: Array.from(unavailable).sort(),
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

    if (role !== 'ADMIN' && booking.userId !== requesterId)
      throw new ForbiddenException('Bạn không có quyền hủy booking này');

    if (!['PENDING', 'CONFIRMED'].includes(booking.status))
      throw new BadRequestException(
        'Chỉ được hủy khi booking đang PENDING/CONFIRMED',
      );

    if (new Date() >= booking.checkIn)
      throw new BadRequestException('Không thể hủy khi đã đến ngày check-in');

    const { finalStatus, message } = this.determineCancelFinalStatus(
      booking.paidAmount.toString(),
    );

    const updated = await this.changeBookingStatus(id, finalStatus, {
      reason: dto.reason,
    });

    return {
      message,
      booking: sanitizeBooking(updated),
    };
  }

  async updateStatus(
    orderId: number,
    paidAmount: number,
    status: bookings_status,
  ) {
    const updated = await this.changeBookingStatus(orderId, status, {
      allowOverride: true,
      paidAmount,
    });

    return {
      message: 'Cập nhật trạng thái thành công',
      data: updated,
    };
  }

  async listByUser(userId: number) {
    const items = await this.prisma.bookings.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: { rooms: { include: { room_images: true } }, users: true },
    });
    return sanitizeBooking(items);
  }

  async adminAcceptBooking(bookingId: number, dto: { paidAmount: number }) {
    const updated = await this.changeBookingStatus(bookingId, 'CONFIRMED', {
      allowOverride: true,
      paidAmount: dto.paidAmount,
    });
    return {
      message: 'Admin đã duyệt đơn',
      booking: sanitizeBooking(updated),
    };
  }

  async adminRejectBooking(bookingId: number, dto: CancelBookingDto) {
    const booking = await this.prisma.bookings.findUnique({
      where: { id: bookingId },
    });
    if (!booking) throw new NotFoundException('Không tìm thấy booking');

    const { finalStatus, message } = this.determineCancelFinalStatus(
      booking.paidAmount.toString(),
    );

    const updated = await this.changeBookingStatus(bookingId, finalStatus, {
      reason: dto.reason,
    });

    return {
      message,
      booking: sanitizeBooking(updated),
    };
  }
}
