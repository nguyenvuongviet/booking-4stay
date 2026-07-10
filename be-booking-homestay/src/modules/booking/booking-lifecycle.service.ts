import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { bookings_status } from '@prisma/client';
import { ADMIN_EMAIL } from 'src/common/constant/app.constant';
import { LoyaltyProgram } from 'src/helpers/loyalty.helper';
import { AppConfigKey } from '../app-configs/constants/app-config.constant';
import { MailService } from '../mail/mail.service';
import { BookingNotificationDispatcher } from '../notification/booking-notification.dispatcher';
import { PrismaService } from '../prisma/prisma.service';
import { PromotionHelper } from '../promotion/promotion.helper';
import {
  BookingMailType,
  STATUS_TO_MAIL_TYPE,
  VALID_STATUS_TRANSITIONS,
} from './booking.constants';

export interface ChangeStatusOptions {
  reason?: string;
  allowOverride?: boolean;
  notifyUser?: boolean;
  notifyAdmin?: boolean;
  paidAmount?: number;
  surcharge?: number;
}

@Injectable()
export class BookingLifecycleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly loyaltyProgram: LoyaltyProgram,
    private readonly mailService: MailService,
    private readonly bookingNotifications: BookingNotificationDispatcher,
    private readonly promotionHelper: PromotionHelper,
  ) {}

  /**
   * Thay đổi trạng thái của đơn đặt phòng.
   * Xử lý lưu lý do hủy, số tiền đã thanh toán, cập nhật hạng thành viên và gửi Email thông báo.
   */
  async changeBookingStatus(
    bookingId: number,
    newStatus: bookings_status,
    options?: ChangeStatusOptions,
  ) {
    const booking = await this.prisma.bookings.findUnique({
      where: { id: bookingId },
      include: { rooms: true },
    });

    if (!booking) throw new NotFoundException('Không tìm thấy booking');

    if (!options?.allowOverride) {
      this.validateTransition(booking.status as bookings_status, newStatus);
    }

    const surcharge = Number(options?.surcharge || 0);
    const oldTotalPrice = Number(booking.totalPrice);
    const newTotalPrice = oldTotalPrice + surcharge;

    let finalPaidAmount = Number(booking.paidAmount);
    if (newStatus === bookings_status.CHECKED_OUT) {
      finalPaidAmount = newTotalPrice;
    } else {
      finalPaidAmount = finalPaidAmount + surcharge;
    }

    const updated = await this.prisma.bookings.update({
      where: { id: bookingId },
      data: {
        status: newStatus,
        cancelReason: options?.reason ?? null,
        totalPrice: newTotalPrice,
        paidAmount: finalPaidAmount,
        updatedAt: new Date(),
      },
      include: { rooms: true },
    });

    // Ghi log hoạt động đổi trạng thái vào booking_logs
    await (this.prisma as any).booking_logs.create({
      data: {
        bookingId,
        action: `STATUS_${newStatus}`,
        oldTotal: booking.totalPrice,
        newTotal: updated.totalPrice,
        note:
          options?.reason ||
          (surcharge > 0
            ? `Cập nhật trạng thái sang ${newStatus} (Phụ thu phát sinh: ${surcharge.toLocaleString()}đ)`
            : `Cập nhật trạng thái sang ${newStatus}`),
      },
    });

    const isCancelledStatus =
      newStatus === bookings_status.CANCELLED ||
      newStatus === bookings_status.CANCELLED_BY_ADMIN;

    const wasAlreadyCancelled =
      booking.status === bookings_status.CANCELLED ||
      booking.status === bookings_status.CANCELLED_BY_ADMIN;

    if (isCancelledStatus && !wasAlreadyCancelled && booking.promotionId) {
      await this.promotionHelper.refundCouponUsage(
        booking.promotionId,
        booking.userId,
        booking.id,
      );
    }

    if (newStatus === bookings_status.CHECKED_OUT) {
      await this.loyaltyProgram.addLoyaltyProgressAfterCheckout(
        updated.userId,
        updated.checkIn,
        updated.checkOut,
        Number(updated.totalPrice),
      );
      await this.loyaltyProgram.recalculateLoyaltyLevel(updated.userId);

      // Auto Reward: Tặng coupon THANKYOU cho user sau checkout
      this.grantAutoRewardCoupon(updated.userId).catch((err) =>
        console.error('Auto reward coupon error:', err),
      );
    }

    const notifyUser = options?.notifyUser ?? true;
    const notifyAdmin = options?.notifyAdmin ?? true;
    const isWaitingRefund = newStatus === bookings_status.WAITING_REFUND;

    this.dispatchMail(updated, newStatus, {
      toUser: notifyUser && !isWaitingRefund,
      toAdmin: notifyAdmin,
    });

    if (notifyUser && !isWaitingRefund) {
      try {
        if (newStatus === bookings_status.CONFIRMED) {
          await this.bookingNotifications.notifyBookingConfirmed(
            updated.userId,
            updated.id,
          );
        } else if (
          newStatus === bookings_status.CANCELLED ||
          newStatus === bookings_status.CANCELLED_BY_ADMIN
        ) {
          const byAdmin = newStatus === bookings_status.CANCELLED_BY_ADMIN;
          await this.bookingNotifications.notifyBookingCancelled(
            updated.userId,
            updated.id,
            byAdmin,
          );
          // Noti admin khi booking bị hủy bởi user (không phải admin hủy)
          if (!byAdmin) {
            this.bookingNotifications
              .notifyAdminBookingCancelled(updated.id)
              .catch((err) => console.error('Admin notification error:', err));
          }
        }
        if (isWaitingRefund) {
          await this.bookingNotifications.notifyBookingRefunded(
            updated.userId,
            updated.id,
            Number(options?.paidAmount || 0),
          );
        }
      } catch (err) {
        console.error('Notification error:', err);
      }
    }

    return updated;
  }

  /**
   * Cập nhật trạng thái sau khi khách thanh toán thành công.
   * Tự động tính toán tổng tiền để chuyển sang PARTIALLY_PAID hoặc CONFIRMED.
   */
  async updateStatus(orderId: number, paidAmount: number, tx?: any) {
    const runUpdate = async (prismaTx: any) => {
      const booking = await prismaTx.bookings.findUnique({
        where: { id: orderId },
      });
      if (!booking) throw new NotFoundException('Không tìm thấy booking');

      // Guard: không xử lý nếu booking đã ở trạng thái cuối
      const terminalStatuses: bookings_status[] = [
        bookings_status.CANCELLED,
        bookings_status.CANCELLED_BY_ADMIN,
        bookings_status.CHECKED_OUT,
        bookings_status.REFUNDED,
      ];
      if (terminalStatuses.includes(booking.status as bookings_status)) {
        console.warn(
          `[Lifecycle] Payment received for terminal booking #${orderId} (${booking.status}). Skipping.`,
        );
        return booking;
      }

      const total = Number(booking.totalPrice);
      // Cap paidAmount: không cho vượt quá totalPrice (chống webhook retry cộng dồn)
      const newPaidAmount = Math.min(
        Number(booking.paidAmount) + paidAmount,
        total,
      );
      let newStatus: bookings_status = booking.status as bookings_status;

      if (newPaidAmount > 0 && newPaidAmount < total) {
        newStatus = bookings_status.PARTIALLY_PAID;
      } else if (newPaidAmount >= total) {
        newStatus = bookings_status.CONFIRMED;
      }

      const latestPolicy = await prismaTx.app_configs.findUnique({
        where: { key: AppConfigKey.CANCELLATION_POLICY },
      });

      const updated = await prismaTx.bookings.update({
        where: { id: orderId },
        data: {
          status: newStatus,
          paidAmount: newPaidAmount,
          cancellationPolicy: latestPolicy?.value || booking.cancellationPolicy,
          policyUpdatedAt: latestPolicy?.updatedAt || booking.policyUpdatedAt,
          updatedAt: new Date(),
        } as any,
        include: { rooms: true },
      });

      // Gửi mail & notifications (không block luồng chính của database transaction)
      this.sendStatusMail(updated, newStatus);

      try {
        if (paidAmount > 0) {
          await this.bookingNotifications.notifyPaymentSuccess(
            updated.userId,
            updated.id,
            paidAmount,
          );
          if (newStatus === bookings_status.CONFIRMED) {
            await this.bookingNotifications.notifyBookingConfirmed(
              updated.userId,
              updated.id,
            );
          }
          // Noti admin về thanh toán (fire-and-forget)
          this.bookingNotifications
            .notifyAdminPaymentSuccess(
              updated.id,
              paidAmount,
              updated.guestFullName,
            )
            .catch((err) => console.error('Admin notification error:', err));
        }
      } catch (err) {
        console.error('Notification error:', err);
      }

      return updated;
    };

    if (tx) {
      return await runUpdate(tx);
    } else {
      return await this.prisma.$transaction(async (prismaTx) => {
        return await runUpdate(prismaTx);
      });
    }
  }

  /**
   * Gửi email thông báo trạng thái đơn hàng hiện tại cho cả User và Admin.
   */
  sendStatusMail(booking: any, status: bookings_status) {
    this.dispatchMail(booking, status, { toUser: true, toAdmin: true });
  }

  /**
   * Logic cốt lõi để phân luồng loại Email (VD: Xác nhận, Hủy, Hoàn tiền) dựa theo trạng thái.
   */
  private dispatchMail(
    booking: any,
    status: bookings_status,
    flags: { toUser: boolean; toAdmin: boolean },
  ) {
    const mailType: BookingMailType | undefined = STATUS_TO_MAIL_TYPE[status];
    if (!mailType) return;

    if (flags.toUser) {
      this.mailService
        .sendBookingMail(booking.guestEmail, mailType, booking)
        .catch((err) => console.error('Email user error:', err));
    }
    if (flags.toAdmin) {
      this.mailService
        .sendBookingMail(ADMIN_EMAIL, mailType, booking)
        .catch((err) => console.error('Email admin error:', err));
    }
  }

  /**
   * Kiểm tra tính hợp lệ của luồng chuyển đổi trạng thái (State Machine).
   * VD: Không thể chuyển từ CANCELLED sang CONFIRMED.
   */
  private validateTransition(
    current: bookings_status,
    target: bookings_status,
  ) {
    if (!VALID_STATUS_TRANSITIONS[current]?.includes(target)) {
      throw new BadRequestException(
        `Không thể chuyển trạng thái từ ${current} sang ${target}`,
      );
    }
  }

  /**
   * Tự động tặng coupon THANKYOU cho user sau khi checkout thành công.
   * Tìm coupon THANKYOU đang active, chưa hết lượt, và user chưa có.
   */
  private async grantAutoRewardCoupon(userId: number) {
    const now = new Date();

    const thankYouPromo = await this.prisma.promotions.findFirst({
      where: {
        promotionType: 'THANKYOU',
        isActive: true,
        isDeleted: false,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!thankYouPromo) return;

    // Đếm số lần user đã thực sự dùng coupon này qua bảng usages
    const userUsageCount = await this.prisma.promotion_usages.count({
      where: { promotionId: thankYouPromo.id, userId },
    });

    if (userUsageCount >= thankYouPromo.perUserLimit) {
      // Đã dùng hết giới hạn số lần cho phép của coupon này
      return;
    }

    // Kiểm tra user đã có voucher này chưa
    const existing = await this.prisma.user_vouchers.findFirst({
      where: { userId, promotionId: thankYouPromo.id },
    });

    if (existing) {
      if (existing.status === 'USED') {
        // Nếu đã dùng nhưng chưa hết giới hạn perUserLimit, khôi phục lại trạng thái AVAILABLE để dùng tiếp
        await this.prisma.user_vouchers.update({
          where: { id: existing.id },
          data: { status: 'AVAILABLE', usedAt: null },
        });
        console.log(
          `[AutoReward] Restored THANKYOU coupon ${thankYouPromo.code} to AVAILABLE for user ${userId} (usage: ${userUsageCount}/${thankYouPromo.perUserLimit})`,
        );
      }
      return;
    }

    await this.prisma.user_vouchers.create({
      data: {
        userId,
        promotionId: thankYouPromo.id,
        status: 'AVAILABLE',
      },
    });

    console.log(
      `[AutoReward] Granted THANKYOU coupon ${thankYouPromo.code} to user ${userId}`,
    );
  }
}
