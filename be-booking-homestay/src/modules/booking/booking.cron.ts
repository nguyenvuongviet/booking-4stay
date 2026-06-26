import { Injectable, Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Cron } from '@nestjs/schedule';
import { bookings_status } from '@prisma/client';
import { addDays, endOfDay, startOfDay, subMinutes } from 'date-fns';
import { ADMIN_EMAIL } from 'src/common/constant/app.constant';
import { AppConfigsService } from '../app-configs/app-configs.service';
import { AppConfigKey } from '../app-configs/constants/app-config.constant';
import { MailService } from '../mail/mail.service';
import { BookingNotificationDispatcher } from '../notification/booking-notification.dispatcher';
import { PayosService } from '../payos/payos.service';
import { PrismaService } from '../prisma/prisma.service';
import { BookingLifecycleService } from './booking-lifecycle.service';

@Injectable()
export class BookingCron {
  private readonly logger = new Logger(BookingCron.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly lifecycleService: BookingLifecycleService,
    private readonly appConfigsService: AppConfigsService,
    private readonly bookingNotifications: BookingNotificationDispatcher,
    private readonly mailService: MailService,
    private readonly moduleRef: ModuleRef,
  ) {}

  /**
   * Tự động quét và chuyển các đơn từ CHECKED_IN sang CHECKED_OUT nếu hôm nay là ngày trả phòng.
   */
  @Cron('0 0 12 * * *', { timeZone: 'Asia/Ho_Chi_Minh' })
  async handleAutoCheckOut() {
    const today = startOfDay(new Date());
    const checkouts = await this.prisma.bookings.findMany({
      where: {
        isDeleted: false,
        status: bookings_status.CHECKED_IN,
        checkOut: { lte: endOfDay(today) },
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
   * Tự động quét và chuyển các đơn từ CONFIRMED/PARTIALLY_PAID sang CHECKED_IN nếu hôm nay là ngày nhận phòng.
   */
  @Cron('0 0 14 * * *', { timeZone: 'Asia/Ho_Chi_Minh' })
  async handleAutoCheckIn() {
    const today = startOfDay(new Date());

    const checkins = await this.prisma.bookings.findMany({
      where: {
        isDeleted: false,
        status: {
          in: [bookings_status.CONFIRMED, bookings_status.PARTIALLY_PAID],
        },
        checkIn: { lte: endOfDay(today) },
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

      // Giải phóng date locks
      await this.prisma.booking_date_locks
        .deleteMany({ where: { bookingId: b.id } })
        .catch((err) =>
          this.logger.error(
            `[Cron] Delete date locks error for booking ${b.id}`,
            err,
          ),
        );
    }

    if (expired.length) {
      this.logger.log(
        `[Cron] Đã hủy ${expired.length} đơn PENDING quá hạn thanh toán (${minutes} phút).`,
      );
    }
  }

  /**
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

  /**
   * Nhắc khách có booking sắp check-in vào ngày mai.
   */
  @Cron('0 * * * *', { timeZone: 'Asia/Ho_Chi_Minh' })
  async sendCheckInReminders() {
    this.logger.log('Running check-in reminder cron');

    const today = startOfDay(new Date());
    const todayEnd = endOfDay(today);
    const tomorrow = startOfDay(addDays(new Date(), 1));
    const tomorrowEnd = endOfDay(tomorrow);

    const bookings = await this.prisma.bookings.findMany({
      where: {
        isDeleted: false,
        status: {
          in: [bookings_status.CONFIRMED, bookings_status.PARTIALLY_PAID],
        },
        checkIn: { gte: tomorrow, lt: tomorrowEnd },
      },
      select: {
        id: true,
        userId: true,
        checkIn: true,
        checkOut: true,
        guestFullName: true,
        guestEmail: true,
        guestPhoneNumber: true,
        totalPrice: true,
        paidAmount: true,
        paymentMethod: true,
        rooms: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!bookings.length) {
      this.logger.log('[Cron] No check-in reminders to send.');
      return;
    }

    const existingReminders = await this.prisma.notifications.findMany({
      where: {
        type: { in: ['CHECKIN_REMINDER', 'ADMIN_CHECKIN_REMINDER'] },
        createdAt: { gte: today, lt: todayEnd },
      },
      select: {
        type: true,
        data: true,
      },
    });

    const userRemindedBookings = new Set<number>();
    const adminRemindedBookings = new Set<number>();

    for (const notification of existingReminders) {
      const bookingId = Number((notification.data as any)?.bookingId || 0);

      if (!bookingId) continue;

      if (notification.type === 'CHECKIN_REMINDER') {
        userRemindedBookings.add(bookingId);
      }

      if (notification.type === 'ADMIN_CHECKIN_REMINDER') {
        adminRemindedBookings.add(bookingId);
      }
    }

    let userSentCount = 0;
    let adminSentCount = 0;

    for (const booking of bookings) {
      try {
        if (!userRemindedBookings.has(booking.id)) {
          await this.bookingNotifications.notifyCheckinReminder(
            booking.userId,
            booking.id,
            new Date(booking.checkIn),
          );
          await this.mailService.sendCheckinReminderMail(
            booking.guestEmail,
            booking,
          );

          userSentCount += 1;
        }

        if (!adminRemindedBookings.has(booking.id)) {
          await this.bookingNotifications.notifyAdminCheckinReminder(
            booking.id,
            booking.guestFullName,
            new Date(booking.checkIn),
          );
          if (ADMIN_EMAIL) {
            await this.mailService.sendCheckinReminderMail(
              ADMIN_EMAIL,
              booking,
              true,
            );
          }

          adminSentCount += 1;
        }
      } catch (error) {
        this.logger.error(
          `[Cron] Failed to send check-in reminder for booking ${booking.id}`,
          error as any,
        );
      }
    }

    if (userSentCount || adminSentCount) {
      this.logger.log(
        `[Cron] Sent check-in reminders: user=${userSentCount}, admin=${adminSentCount}.`,
      );
    }
  }

  /**
   * Đối soát các giao dịch thanh toán PENDING quá 10 phút với PayOS.
   * Phòng trường hợp webhook bị mất (network issue).
   */
  @Cron('*/5 * * * *')
  async reconcilePayments() {
    const threshold = subMinutes(new Date(), 10);

    const pendingTxs = await this.prisma.payment_transactions.findMany({
      where: {
        status: 'PENDING',
        createdAt: { lt: threshold },
      },
      take: 20,
    });

    if (!pendingTxs.length) return;

    let syncedCount = 0;
    const payosService = this.moduleRef.get(PayosService, { strict: false });
    for (const tx of pendingTxs) {
      try {
        const success = await payosService.verifyAndSyncPayment(
          tx.orderCode.toString(),
        );
        if (success) {
          syncedCount++;
        }
      } catch (err) {
        this.logger.error(
          `[Cron] Reconcile failed for orderCode ${tx.orderCode}:`,
          err,
        );
      }
    }

    if (syncedCount > 0) {
      this.logger.log(`[Cron] Reconciled and synced ${syncedCount} bookings.`);
    }

    // Hết hạn các giao dịch PENDING quá 30 phút
    const expireThreshold = subMinutes(new Date(), 30);
    const expired = await this.prisma.payment_transactions.updateMany({
      where: {
        status: 'PENDING',
        createdAt: { lt: expireThreshold },
      },
      data: { status: 'CANCELLED' },
    });

    if (expired.count > 0) {
      this.logger.log(
        `[Cron] Expired ${expired.count} stale payment transactions.`,
      );
    }
  }
}
