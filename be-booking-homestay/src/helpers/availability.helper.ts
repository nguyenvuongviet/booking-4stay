import { Injectable } from '@nestjs/common';
import { bookings_status } from '@prisma/client';
import { startOfDay } from 'date-fns';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class AvailabilityHelper {
  constructor(private readonly prisma: PrismaService) {}

  async hasOverlap(
    roomId: number,
    inDate: Date,
    outDate: Date,
  ): Promise<boolean> {
    const activeStatuses: bookings_status[] = [
      bookings_status.PENDING,
      bookings_status.PARTIALLY_PAID,
      bookings_status.CONFIRMED,
      bookings_status.CHECKED_IN,
      bookings_status.WAITING_REFUND,
    ];

    const existingBooking = await this.prisma.bookings.findFirst({
      where: {
        roomId,
        isDeleted: false,
        status: { in: activeStatuses },
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
