import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

function getVNDayRange() {
  const nowVN = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }),
  );
  const y = nowVN.getFullYear();
  const m = nowVN.getMonth();
  const d = nowVN.getDate();

  const startTodayVN = new Date(Date.UTC(y, m, d, 0, 0, 0));
  const startTomorrowVN = new Date(Date.UTC(y, m, d + 1, 0, 0, 0));
  return { startTodayVN, startTomorrowVN };
}

@Injectable()
export class BookingCron {
  private readonly logger = new Logger(BookingCron.name);
  constructor(private readonly prisma: PrismaService) {}

  @Cron('5 0 * * *')
  async dailyStatusRoll() {
    const { startTodayVN, startTomorrowVN } = getVNDayRange();

    const rCheckIn = await this.prisma.bookings.updateMany({
      where: {
        isDeleted: false,
        status: { in: ['PENDING', 'CONFIRMED'] },
        checkIn: { gte: startTodayVN, lt: startTomorrowVN },
      },
      data: { status: 'CHECKED_IN', updatedAt: new Date() },
    });

    const rCheckOut = await this.prisma.bookings.updateMany({
      where: {
        isDeleted: false,
        status: 'CHECKED_IN',
        checkOut: { gte: startTodayVN, lt: startTomorrowVN },
      },
      data: { status: 'CHECKED_OUT', updatedAt: new Date() },
    });

    if (rCheckIn.count || rCheckOut.count) {
      this.logger.log(
        `Daily roll: →CHECKED_IN=${rCheckIn.count}, →CHECKED_OUT=${rCheckOut.count}`,
      );
    }
  }
}
