import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { BookingService } from './booking.service';
import { startOfDay, endOfDay, subMinutes } from 'date-fns';

@Injectable()
export class BookingCron {
  private readonly logger = new Logger(BookingCron.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly bookingService: BookingService,
  ) {}

  @Cron('0 12 * * *', { timeZone: 'Asia/Ho_Chi_Minh' })
  async handleAutoCheckOut() {
    const today = startOfDay(new Date());
    const checkouts = await this.prisma.bookings.findMany({
      where: {
        isDeleted: false,
        status: 'CHECKED_IN',
        checkOut: { gte: today, lt: endOfDay(today) },
      },
      select: { id: true },
    });

    for (const b of checkouts) {
      await this.bookingService['changeBookingStatus'](b.id, 'CHECKED_OUT', {
        allowOverride: true,
        notifyAdmin: false,
        notifyUser: false,
      });
    }

    if (checkouts.length) {
      this.logger.log(`[Cron] Auto Check-out: ${checkouts.length} đơn.`);
    }
  }

  @Cron('0 14 * * *', { timeZone: 'Asia/Ho_Chi_Minh' })
  async handleAutoCheckIn() {
    const today = startOfDay(new Date());

    const checkins = await this.prisma.bookings.findMany({
      where: {
        isDeleted: false,
        status: { in: ['CONFIRMED', 'PARTIALLY_PAID'] },
        checkIn: { gte: today, lt: endOfDay(today) },
      },
      select: { id: true },
    });

    for (const b of checkins) {
      await this.bookingService['changeBookingStatus'](b.id, 'CHECKED_IN', {
        allowOverride: true,
        notifyAdmin: false,
        notifyUser: true,
      });
    }

    if (checkins.length) {
      this.logger.log(`[Cron] Auto Check-in: ${checkins.length} đơn.`);
    }
  }

  @Cron('*/15 * * * *')
  async clearExpiredBookings() {
    const expiryThreshold = subMinutes(new Date(), 30);

    const expired = await this.prisma.bookings.findMany({
      where: {
        status: 'PENDING',
        createdAt: { lt: expiryThreshold },
        isDeleted: false,
      },
      select: { id: true },
    });

    for (const b of expired) {
      await this.bookingService['changeBookingStatus'](b.id, 'CANCELLED', {
        allowOverride: true,
        notifyAdmin: true,
        notifyUser: true,
      });
    }

    if (expired.length) {
      this.logger.log(
        `[Cron] Đã hủy ${expired.length} đơn PENDING quá hạn thanh toán.`,
      );
    }
  }
}
