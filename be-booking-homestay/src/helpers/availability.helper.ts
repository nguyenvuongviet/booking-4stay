import { Injectable } from '@nestjs/common';
import { bookings_status } from '@prisma/client';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class AvailabilityHelper {
  constructor(private readonly prisma: PrismaService) {}

  async hasOverlap(roomId: number, inDate: Date, outDate: Date) {
    const booked = await this.prisma.bookings.findFirst({
      where: {
        roomId,
        status: {
          in: ['PENDING', 'CONFIRMED', 'CHECKED_IN'] as bookings_status[],
        },
        AND: [{ checkOut: { gt: inDate } }, { checkIn: { lt: outDate } }],
      },
      select: { id: true },
    });
    if (booked) return true;

    const blocked = await this.prisma.room_availability.findFirst({
      where: {
        roomId,
        isAvailable: false,
        date: { gte: inDate, lt: outDate },
      },
      select: { id: true },
    });
    return !!blocked;
  }
}
