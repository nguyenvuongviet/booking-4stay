import { Injectable } from '@nestjs/common';
import { startOfDay } from 'date-fns';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { ACTIVE_BOOKING_STATUSES } from 'src/modules/booking/booking.constants';

@Injectable()
export class AvailabilityHelper {
  constructor(private readonly prisma: PrismaService) {}

  async hasOverlap(
    roomId: number,
    inDate: Date,
    outDate: Date,
  ): Promise<boolean> {
    const existingBooking = await this.prisma.bookings.findFirst({
      where: {
        roomId,
        isDeleted: false,
        status: { in: ACTIVE_BOOKING_STATUSES },
        checkIn: { lt: outDate },
        checkOut: { gt: inDate },
      },
      select: { id: true },
    });
    if (existingBooking) return true;

    const blockedDate = await this.prisma.room_availability.findFirst({
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
}
