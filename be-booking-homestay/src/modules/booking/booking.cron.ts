import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { bookings_status } from '@prisma/client';
import { endOfDay, startOfDay, subMinutes } from 'date-fns';
import { AppConfigsService } from '../app-configs/app-configs.service';
import { AppConfigKey } from '../app-configs/constants/app-config.constant';
import { PrismaService } from '../prisma/prisma.service';
import { BookingLifecycleService } from './booking-lifecycle.service';

@Injectable()
export class BookingCron {
  private readonly logger = new Logger(BookingCron.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly lifecycleService: BookingLifecycleService,
    private readonly appConfigsService: AppConfigsService,
  ) {}

  /**
   * Chạy lúc 12:00 trưa mỗi ngày.
   * Tự động quét và chuyển các đơn từ CHECKED_IN sang CHECKED_OUT nếu hôm nay là ngày trả phòng.
   */
  @Cron('0 12 * * *', { timeZone: 'Asia/Ho_Chi_Minh' })
  async handleAutoCheckOut() {
    const today = startOfDay(new Date());
    const checkouts = await this.prisma.bookings.findMany({
      where: {
        isDeleted: false,
        status: bookings_status.CHECKED_IN,
        checkOut: { gte: today, lt: endOfDay(today) },
      },
      select: { id: true },
    });

    for (const b of checkouts) {
      await this.lifecycleService.changeBookingStatus(
        b.id,
        bookings_status.CHECKED_OUT,
        {
          allowOverride: true,
          notifyAdmin: false,
          notifyUser: false,
        },
      );
    }

    if (checkouts.length) {
      this.logger.log(`[Cron] Auto Check-out: ${checkouts.length} đơn.`);
    }
  }

  /**
   * Chạy lúc 14:00 chiều mỗi ngày.
   * Tự động quét và chuyển các đơn từ CONFIRMED/PARTIALLY_PAID sang CHECKED_IN nếu hôm nay là ngày nhận phòng.
   */
  @Cron('0 14 * * *', { timeZone: 'Asia/Ho_Chi_Minh' })
  async handleAutoCheckIn() {
    const today = startOfDay(new Date());

    const checkins = await this.prisma.bookings.findMany({
      where: {
        isDeleted: false,
        status: {
          in: [bookings_status.CONFIRMED, bookings_status.PARTIALLY_PAID],
        },
        checkIn: { gte: today, lt: endOfDay(today) },
      },
      select: { id: true },
    });

    for (const b of checkins) {
      await this.lifecycleService.changeBookingStatus(
        b.id,
        bookings_status.CHECKED_IN,
        {
          allowOverride: true,
          notifyAdmin: false,
          notifyUser: true,
        },
      );
    }

    if (checkins.length) {
      this.logger.log(`[Cron] Auto Check-in: ${checkins.length} đơn.`);
    }
  }

  /**
   * Chạy mỗi phút (* * * * *).
   * Tự động quét và hủy các đơn PENDING nếu quá thời gian giữ chỗ (ví dụ: 15 phút) mà chưa thanh toán.
   */
  @Cron('* * * * *')
  async clearExpiredBookings() {
    const minutes = await this.appConfigsService.getConfigValue<number>(
      AppConfigKey.BOOKING_EXPIRY_MINUTES,
    );
    const expiryThreshold = subMinutes(new Date(), minutes);

    const expired = await this.prisma.bookings.findMany({
      where: {
        status: bookings_status.PENDING,
        createdAt: { lt: expiryThreshold },
        isDeleted: false,
      },
      select: { id: true },
    });

    for (const b of expired) {
      await this.lifecycleService.changeBookingStatus(
        b.id,
        bookings_status.CANCELLED,
        {
          reason: `Hết hạn thanh toán tự động (Hệ thống tự huỷ do quá ${minutes} phút chưa thanh toán)`,
          allowOverride: true,
          notifyAdmin: true,
          notifyUser: true,
        },
      );
    }

    if (expired.length) {
      this.logger.log(
        `[Cron] Đã hủy ${expired.length} đơn PENDING quá hạn thanh toán (${minutes} phút).`,
      );
    }
  }

  /**
   * Chạy lúc 2:00 sáng mỗi ngày.
   * Dọn dẹp các dữ liệu lịch phòng (giá phòng, khóa phòng) cũ hơn 30 ngày để làm nhẹ database.
   */
  @Cron('0 2 * * *', { timeZone: 'Asia/Ho_Chi_Minh' })
  async clearOldCalendarData() {
    const thresholdDate = startOfDay(subMinutes(new Date(), 30 * 24 * 60));

    try {
      const deletedPrices = await this.prisma.room_prices.deleteMany({
        where: { date: { lt: thresholdDate } },
      });

      const deletedAvail = await this.prisma.room_availability.deleteMany({
        where: { date: { lt: thresholdDate } },
      });

      if (deletedPrices.count > 0 || deletedAvail.count > 0) {
        this.logger.log(
          `[Cron] Dọn dẹp Calendar: Xoá ${deletedPrices.count} bản ghi giá và ${deletedAvail.count} bản ghi trạng thái cũ (Trôi qua hơn 30 ngày).`,
        );
      }
    } catch (e) {
      this.logger.error('[Cron] Lỗi khi dọn dẹp dữ liệu Calendar cũ', e);
    }
  }
}
