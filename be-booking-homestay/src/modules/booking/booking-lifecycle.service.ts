import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { bookings_status } from '@prisma/client';
import { ADMIN_EMAIL } from 'src/common/constant/app.constant';
import { LoyaltyProgram } from 'src/helpers/loyalty.helper';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { AppConfigKey } from '../app-configs/constants/app-config.constant';
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
}

@Injectable()
export class BookingLifecycleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly loyaltyProgram: LoyaltyProgram,
    private readonly mailService: MailService,
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

    const updated = await this.prisma.bookings.update({
      where: { id: bookingId },
      data: {
        status: newStatus,
        cancelReason: options?.reason ?? null,
        paidAmount:
          newStatus === bookings_status.CHECKED_OUT
            ? booking.totalPrice
            : (options?.paidAmount ?? booking.paidAmount),
        updatedAt: new Date(),
      },
      include: { rooms: true },
    });

    if (newStatus === bookings_status.CHECKED_OUT) {
      await this.loyaltyProgram.recalculateLoyaltyLevel(updated.userId);
    }

    const notifyUser = options?.notifyUser ?? true;
    const notifyAdmin = options?.notifyAdmin ?? true;
    const isWaitingRefund = newStatus === bookings_status.WAITING_REFUND;

    this.dispatchMail(updated, newStatus, {
      toUser: notifyUser && !isWaitingRefund,
      toAdmin: notifyAdmin,
    });

    return updated;
  }

  /**
   * Cập nhật trạng thái sau khi khách thanh toán thành công.
   * Tự động tính toán tổng tiền để chuyển sang PARTIALLY_PAID hoặc CONFIRMED.
   */
  async updateStatus(orderId: number, paidAmount: number) {
    return await this.prisma.$transaction(async (tx) => {
      const booking = await tx.bookings.findUnique({
        where: { id: orderId },
      });
      if (!booking) throw new NotFoundException();

      const newPaidAmount = Number(booking.paidAmount) + paidAmount;
      const total = Number(booking.totalPrice);
      let newStatus: bookings_status = booking.status as bookings_status;

      if (newPaidAmount > 0 && newPaidAmount < total) {
        newStatus = bookings_status.PARTIALLY_PAID;
      } else if (newPaidAmount >= total) {
        newStatus = bookings_status.CONFIRMED;
      }

      const latestPolicy = await tx.app_configs.findUnique({
        where: { key: AppConfigKey.CANCELLATION_POLICY },
      });

      const updated = await tx.bookings.update({
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

      this.sendStatusMail(updated, newStatus);

      return updated;
    });
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
}
