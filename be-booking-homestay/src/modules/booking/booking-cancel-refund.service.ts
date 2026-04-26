import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { bookings_status } from '@prisma/client';
import { sanitizeBooking } from 'src/utils/sanitize/booking.sanitize';
import { AppConfigKey } from '../app-configs/constants/app-config.constant';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../user/dto/enum.dto';
import { BookingLifecycleService } from './booking-lifecycle.service';
import {
  CANCELLABLE_STATUSES,
  daysUntilDate,
  resolveRefundPercent,
  sortPolicyDesc,
} from './booking.constants';
import { CancelBookingDto } from './dto/cancel-booking.dto';

interface RefundResult {
  refundAmount: number;
  cancellationFee: number;
  appliedDaysBefore: number;
  refundPercent: number;
}

interface CancelFinalStatus {
  finalStatus: 'WAITING_REFUND' | 'CANCELLED';
  message: string;
}

@Injectable()
export class BookingCancelRefundService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly lifecycleService: BookingLifecycleService,
  ) {}

  /**
   * Khách hàng hoặc Admin chủ động hủy đơn đặt phòng.
   * Tự động tính phí phạt, số tiền hoàn trả (nếu có) và ghi log thay đổi.
   */
  async cancel(
    id: number,
    requesterId: number,
    role: string,
    dto: CancelBookingDto,
  ) {
    return await this.prisma.$transaction(async (tx) => {
      const booking = await tx.bookings.findUnique({
        where: { id },
        include: { rooms: true },
      });
      if (!booking) throw new NotFoundException('Không tìm thấy booking');

      if (role !== Role.ADMIN && booking.userId !== requesterId)
        throw new ForbiddenException('Bạn không có quyền hủy booking này');

      this.assertCancellable(booking.status as bookings_status);

      const isLastMinute = new Date() >= new Date(booking.checkIn);

      let { refundAmount, cancellationFee } =
        await this.calculateRefundAmount(booking);

      if (isLastMinute) {
        refundAmount = 0;
        cancellationFee = Number(booking.paidAmount);
      }

      const { finalStatus, message } = this.determineFinalStatus(
        booking.paidAmount.toNumber(),
        refundAmount,
      );

      const updated = await tx.bookings.update({
        where: { id },
        data: {
          status: finalStatus,
          cancelReason: dto.reason || 'Khách hàng chủ động hủy',
          refundAmount,
          cancellationFee,
          bankName: dto.bankName || null,
          bankAccountNumber: dto.bankAccountNumber || null,
          bankAccountName: dto.bankAccountName || null,
          updatedAt: new Date(),
        } as any,
        include: { rooms: true },
      });

      await (tx as any).booking_logs.create({
        data: {
          bookingId: id,
          action: 'CANCEL',
          note: `Hủy đơn: Phí phạt ${cancellationFee.toLocaleString()}đ. Hoàn trả ${refundAmount.toLocaleString()}đ. Trạng thái: ${finalStatus}.`,
          performedBy: requesterId,
        },
      });

      this.lifecycleService.sendStatusMail(updated, finalStatus);

      return { message, booking: sanitizeBooking(updated) };
    });
  }

  /**
   * Admin từ chối đơn đặt phòng (ví dụ do quá tải hoặc sự cố kỹ thuật).
   * Kèm theo lý do từ chối và tự động tính toán tiền cần hoàn.
   */
  async adminRejectBooking(bookingId: number, dto: CancelBookingDto) {
    const booking = await this.findBookingOrThrow(bookingId);
    const { refundAmount } = await this.calculateRefundAmount(booking);

    const { finalStatus, message } = this.determineFinalStatus(
      booking.paidAmount.toNumber(),
      refundAmount,
    );

    const updated = await this.lifecycleService.changeBookingStatus(
      bookingId,
      finalStatus,
      { reason: dto.reason },
    );

    return { message, booking: sanitizeBooking(updated) };
  }

  /**
   * Admin chủ động thao tác hủy đơn đặt phòng thay cho khách hàng.
   */
  async adminCancelBooking(bookingId: number, dto: CancelBookingDto) {
    const booking = await this.findBookingOrThrow(bookingId);
    const { refundAmount } = await this.calculateRefundAmount(booking);

    const { finalStatus } = this.determineFinalStatus(
      booking.paidAmount.toNumber(),
      refundAmount,
    );

    const updated = await this.lifecycleService.changeBookingStatus(
      bookingId,
      finalStatus,
      {
        reason: dto.reason || 'Admin chủ động huỷ đơn',
        allowOverride: true,
      },
    );

    return {
      message: 'Đã huỷ đơn thành công',
      booking: sanitizeBooking(updated),
    };
  }

  /**
   * Admin xác nhận đã chuyển khoản hoàn tiền thành công cho khách.
   * Lưu lại ảnh minh chứng chuyển khoản (Evidence URL) và chuyển trạng thái sang REFUNDED.
   */
  async adminConfirmRefund(
    id: number,
    refundAmount: number,
    evidenceUrl?: string,
  ) {
    return await this.prisma.$transaction(async (tx) => {
      const booking = await tx.bookings.findUnique({ where: { id } });

      if (!booking) throw new NotFoundException('Không tìm thấy đơn hàng');
      if (booking.status !== bookings_status.WAITING_REFUND) {
        throw new BadRequestException(
          'Đơn hàng không ở trạng thái chờ hoàn tiền',
        );
      }

      const updated = await tx.bookings.update({
        where: { id },
        data: {
          status: bookings_status.REFUNDED,
          refundAmount,
          refundEvidence: evidenceUrl || null,
          refundedAt: new Date(),
          updatedAt: new Date(),
        } as any,
      });

      await (tx as any).booking_logs.create({
        data: {
          bookingId: id,
          action: 'REFUND_CONFIRMED',
          note: `Admin xác nhận đã hoàn tiền: ${refundAmount.toLocaleString()}đ.`,
        },
      });

      this.lifecycleService.sendStatusMail(updated, bookings_status.REFUNDED);

      return updated;
    });
  }

  /**
   * Core logic: Tính toán số tiền hoàn trả và phí phạt hủy phòng.
   * So sánh thời điểm hiện tại với ngày check-in để áp dụng đúng mức phần trăm hoàn tiền.
   */
  async calculateRefundAmount(booking: any): Promise<RefundResult> {
    const daysLeft = daysUntilDate(new Date(booking.checkIn));

    let policy = booking.cancellationPolicy;

    if (!policy || (Array.isArray(policy) && policy.length === 0)) {
      const config = await this.prisma.app_configs.findUnique({
        where: { key: AppConfigKey.CANCELLATION_POLICY },
      });
      policy = (config?.value as any[]) || [
        { daysBefore: 0, refundPercent: 0 },
      ];
    }

    const sortedPolicy = sortPolicyDesc(policy);
    const refundPercent = resolveRefundPercent(sortedPolicy, daysLeft);

    const paidAmount = Number(booking.paidAmount);
    const totalPrice = Number(booking.totalPrice);

    const penaltyPercent = 1 - refundPercent;
    const rawPenalty = totalPrice * penaltyPercent;
    const cancellationFee = Math.round(Math.min(rawPenalty, paidAmount));

    const refundAmount = Math.max(0, Math.round(paidAmount - cancellationFee));

    return {
      refundAmount,
      cancellationFee,
      appliedDaysBefore: daysLeft,
      refundPercent,
    };
  }

  /**
   * Quyết định trạng thái cuối cùng của đơn sau khi hủy.
   * Nếu có tiền cần trả lại -> WAITING_REFUND. Nếu không -> CANCELLED.
   */
  determineFinalStatus(
    paidAmount: number,
    refundAmount: number,
  ): CancelFinalStatus {
    if (refundAmount > 0) {
      return {
        finalStatus: 'WAITING_REFUND',
        message: `Yêu cầu hủy đã được ghi nhận. Số tiền cần hoàn trả: ${refundAmount.toLocaleString()} VNĐ.`,
      };
    }
    return {
      finalStatus: 'CANCELLED',
      message:
        'Đơn hàng đã được hủy thành công. Không có tiền hoàn trả theo chính sách.',
    };
  }

  /**
   * Kiểm tra trạng thái hiện tại có được phép thực hiện thao tác hủy hay không.
   */
  private assertCancellable(status: bookings_status) {
    if (!CANCELLABLE_STATUSES.includes(status)) {
      throw new BadRequestException(
        'Chỉ được hủy khi booking đang PENDING, PARTIALLY_PAID hoặc CONFIRMED',
      );
    }
  }

  private async findBookingOrThrow(id: number) {
    const booking = await this.prisma.bookings.findUnique({
      where: { id },
    });
    if (!booking) throw new NotFoundException('Không tìm thấy booking');
    return booking;
  }
}
