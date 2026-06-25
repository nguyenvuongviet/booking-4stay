import { BadRequestException, Injectable } from '@nestjs/common';
import { rooms_status } from '@prisma/client';
import { startOfDay } from 'date-fns';
import { ACTIVE_BOOKING_STATUSES } from 'src/modules/booking/booking.constants';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class AvailabilityHelper {
  constructor(private readonly prisma: PrismaService) {}

  async hasOverlap(
    roomId: number,
    inDate: Date,
    outDate: Date,
    options?: { tx?: any; excludeBookingId?: number },
  ): Promise<boolean> {
    const prisma = options?.tx || this.prisma;

    const room = await prisma.rooms.findFirst({
      where: { id: roomId },
      select: { status: true },
    });
    if (room?.status === rooms_status.MAINTENANCE) return true;

    const excludeFilter = options?.excludeBookingId
      ? { id: { not: options.excludeBookingId } }
      : {};

    const existingBooking = await prisma.bookings.findFirst({
      where: {
        roomId,
        isDeleted: false,
        status: { in: ACTIVE_BOOKING_STATUSES },
        checkIn: { lt: outDate },
        checkOut: { gt: inDate },
        ...excludeFilter,
      },
      select: { id: true },
    });
    if (existingBooking) return true;

    const blockedDate = await prisma.room_availability.findFirst({
      where: {
        roomId,
        isAvailable: false,
        date: {
          gte: startOfDay(inDate),
          lt: startOfDay(outDate),
        },
      },
      select: { id: true },
    });
    return !!blockedDate;
  }

  /**
   * Đảm bảo khoảng ngày đặt không bị trùng hoặc bị khóa. Ném lỗi nếu không khả dụng.
   * Hỗ trợ chống double-click bằng cách trả về null nếu booking trùng thuộc về chính user đó trong vòng 5 phút (nếu userId được truyền).
   */
  async assertAvailability(
    roomId: number,
    inDate: Date,
    outDate: Date,
    options?: { tx?: any; excludeBookingId?: number; userId?: number },
  ): Promise<void> {
    const prisma = options?.tx || this.prisma;

    const room = await prisma.rooms.findFirst({
      where: { id: roomId },
      select: { status: true },
    });
    if (room?.status === rooms_status.MAINTENANCE) {
      throw new BadRequestException(
        'Phòng đang bị khóa hoặc đang bảo trì, không thể đặt phòng',
      );
    }

    const excludeFilter = options?.excludeBookingId
      ? { id: { not: options.excludeBookingId } }
      : {};

    const overlap = await prisma.bookings.findFirst({
      where: {
        roomId,
        isDeleted: false,
        status: { in: ACTIVE_BOOKING_STATUSES },
        checkIn: { lt: outDate },
        checkOut: { gt: inDate },
        ...excludeFilter,
      },
    });

    if (overlap) {
      if (options?.userId && overlap.userId === options.userId) {
        const timeDiff =
          new Date().getTime() - new Date(overlap.createdAt).getTime();
        if (timeDiff < 5 * 60 * 1000) return; // Cho phép nếu là double click
      }
      throw new BadRequestException('Khoảng ngày đã có người giữ hoặc bị khóa');
    }

    const blockedDate = await prisma.room_availability.findFirst({
      where: {
        roomId,
        isAvailable: false,
        date: { gte: inDate, lt: outDate },
      },
    });
    if (blockedDate) {
      throw new BadRequestException('Khoảng ngày này đã bị khóa bởi Host');
    }
  }
}
