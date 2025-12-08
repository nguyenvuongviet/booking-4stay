import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { BookingService } from './booking.service';

function getVNDayRange() {
  const now = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }),
  );

  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();

  const start = new Date(Date.UTC(y, m, d, 0, 0, 0));
  const end = new Date(Date.UTC(y, m, d + 1, 0, 0, 0));
  return { start, end };
}

@Injectable()
export class BookingCron {
  private readonly logger = new Logger(BookingCron.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly bookingService: BookingService,
  ) {}

  @Cron('5 0 * * *', { timeZone: 'Asia/Ho_Chi_Minh' })
  async dailyStatusRoll() {
    const { start, end } = getVNDayRange();

    const checkins = await this.prisma.bookings.findMany({
      where: {
        isDeleted: false,
        status: { in: ['PENDING', 'PARTIALLY_PAID', 'CONFIRMED'] },
        checkIn: { gte: start, lt: end },
      },
    });

    for (const b of checkins) {
      await this.bookingService['changeBookingStatus'](b.id, 'CHECKED_IN', {
        allowOverride: true,
        notifyAdmin: false,
        notifyUser: true,
      });
    }

    const checkouts = await this.prisma.bookings.findMany({
      where: {
        isDeleted: false,
        status: 'CHECKED_IN',
        checkOut: { gte: start, lt: end },
      },
    });

    for (const b of checkouts) {
      await this.bookingService['changeBookingStatus'](b.id, 'CHECKED_OUT', {
        allowOverride: true,
        notifyAdmin: false,
        notifyUser: true,
      });
    }

    if (checkins.length || checkouts.length) {
      this.logger.log(
        `Cron: CHECKED_IN=${checkins.length}, CHECKED_OUT=${checkouts.length}`,
      );
    }
  }
}
