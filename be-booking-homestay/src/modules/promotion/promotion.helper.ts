import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { bookings_status, discount_type } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface CouponValidationResult {
  valid: boolean;
  promotion: any;
  couponDiscount: number;
  afterCoupon: number;
  message: string;
}

@Injectable()
export class PromotionHelper {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Validate mã coupon trước khi áp dụng.
   * Kiểm tra: tồn tại, thời hạn, lượt dùng, hạng thành viên, tỉnh thành, đơn tối thiểu.
   */
  async validateCoupon(
    code: string,
    userId: number,
    orderTotal: number,
    provinceId?: number,
    options?: { tx?: any },
  ): Promise<CouponValidationResult> {
    const prisma = options?.tx || this.prisma;
    const now = new Date();

    // 1. Tìm coupon
    const promotion = await prisma.promotions.findFirst({
      where: {
        code: code.toUpperCase(),
        isDeleted: false,
      },
    });

    if (!promotion) {
      return this.invalid('Mã giảm giá không tồn tại', orderTotal);
    }

    // 1.1. Nếu là mã private, kiểm tra xem user có trong ví không
    if (!promotion.isPublic) {
      const userVoucher = await prisma.user_vouchers.findFirst({
        where: {
          userId,
          promotionId: promotion.id,
          status: 'AVAILABLE',
        },
      });
      if (!userVoucher) {
        return this.invalid('Bạn không sở hữu mã giảm giá này', orderTotal);
      }
    }

    // 2. Kiểm tra trạng thái
    if (!promotion.isActive) {
      return this.invalid('Mã giảm giá đã ngừng hoạt động', orderTotal);
    }

    // 3. Kiểm tra thời hạn
    if (now < new Date(promotion.startDate)) {
      return this.invalid('Mã giảm giá chưa đến thời gian sử dụng', orderTotal);
    }
    if (now > new Date(promotion.endDate)) {
      return this.invalid('Mã giảm giá đã hết hạn', orderTotal);
    }

    // 4. Kiểm tra tổng lượt dùng
    if (promotion.usedCount >= promotion.usageLimit) {
      return this.invalid('Mã giảm giá đã hết lượt sử dụng', orderTotal);
    }

    // 5. Kiểm tra số lần user đã dùng mã này
    const userUsageCount = await prisma.promotion_usages.count({
      where: { promotionId: promotion.id, userId },
    });
    if (userUsageCount >= promotion.perUserLimit) {
      return this.invalid(
        'Bạn đã sử dụng hết số lần cho phép của mã này',
        orderTotal,
      );
    }

    // 5.1. Kiểm tra WELCOME / THANKYOU (1 query duy nhất cho cả hai)
    if (
      promotion.promotionType === 'WELCOME' ||
      promotion.promotionType === 'THANKYOU'
    ) {
      const bookingsByStatus = await prisma.bookings.groupBy({
        by: ['status'],
        where: { userId },
        _count: true,
      });

      const cancelledStatuses = new Set<bookings_status>([
        bookings_status.CANCELLED,
        bookings_status.CANCELLED_BY_ADMIN,
      ]);
      const activeBookings = bookingsByStatus
        .filter(
          (b: { status: bookings_status; _count: number }) =>
            !cancelledStatuses.has(b.status),
        )
        .reduce(
          (sum: number, b: { status: bookings_status; _count: number }) =>
            sum + b._count,
          0,
        );
      const completedBookings = bookingsByStatus
        .filter(
          (b: { status: bookings_status; _count: number }) =>
            b.status === bookings_status.CHECKED_OUT,
        )
        .reduce(
          (sum: number, b: { status: bookings_status; _count: number }) =>
            sum + b._count,
          0,
        );

      if (promotion.promotionType === 'WELCOME' && activeBookings > 0) {
        return this.invalid(
          'Mã giảm giá này chỉ dành cho khách hàng đặt phòng lần đầu',
          orderTotal,
        );
      }
      if (promotion.promotionType === 'THANKYOU' && completedBookings === 0) {
        return this.invalid(
          'Mã giảm giá này chỉ dành cho khách hàng đã hoàn thành đặt phòng',
          orderTotal,
        );
      }
    }

    // 6. Kiểm tra hạng thành viên (targetLevelId)
    if (promotion.targetLevelId) {
      const loyalty = await prisma.loyalty_program.findFirst({
        where: { userId },
      });
      const userLevelId = loyalty?.levelId;
      if (userLevelId !== promotion.targetLevelId) {
        // Lấy tên hạng để thông báo lỗi thân thiện
        const targetLevel = await prisma.levels.findUnique({
          where: { id: promotion.targetLevelId },
          select: { name: true },
        });
        return this.invalid(
          `Mã giảm giá chỉ dành cho hạng ${targetLevel?.name || 'thành viên cao hơn'}`,
          orderTotal,
        );
      }
    }

    // 7. Kiểm tra tỉnh thành
    if (promotion.provinceId && provinceId) {
      if (promotion.provinceId !== provinceId) {
        return this.invalid(
          'Mã giảm giá không áp dụng cho khu vực này',
          orderTotal,
        );
      }
    }

    // 8. Kiểm tra đơn hàng tối thiểu
    const minOrder = Number(promotion.minOrderValue || 0);
    if (orderTotal < minOrder) {
      return this.invalid(
        `Đơn hàng tối thiểu ${minOrder.toLocaleString()}đ để sử dụng mã này`,
        orderTotal,
      );
    }

    // 9. Tính giá trị giảm
    const couponDiscount = this.calculateDiscount(promotion, orderTotal);
    const afterCoupon = orderTotal - couponDiscount;

    return {
      valid: true,
      promotion,
      couponDiscount,
      afterCoupon,
      message: `Áp dụng mã ${code} thành công! Giảm ${couponDiscount.toLocaleString()}đ`,
    };
  }

  /**
   * Tính số tiền giảm thực tế dựa vào loại coupon (PERCENTAGE / FIXED_AMOUNT).
   */
  calculateDiscount(promotion: any, orderTotal: number): number {
    const value = Number(promotion.discountValue);
    const maxDiscount = Number(promotion.maxDiscount || 0);

    let discount = 0;

    if (promotion.discountType === discount_type.PERCENTAGE) {
      discount = Math.round((orderTotal * value) / 100);
      if (maxDiscount > 0 && discount > maxDiscount) {
        discount = maxDiscount;
      }
    } else {
      // FIXED_AMOUNT
      discount = value;
    }

    // Đảm bảo discount không vượt quá order total
    if (discount > orderTotal) {
      discount = orderTotal;
    }

    return Math.round(discount);
  }

  /**
   * Ghi nhận sử dụng coupon (trong transaction).
   * - Tăng usedCount
   * - Tạo promotion_usage
   * - Cập nhật user_voucher (nếu có)
   */
  async recordCouponUsage(
    promotionId: number,
    userId: number,
    bookingId: number,
    discountAmount: number,
    options?: { tx?: any },
  ) {
    const prisma = options?.tx || this.prisma;

    // Lấy thông tin giới hạn hiện tại của coupon
    const promotion = await prisma.promotions.findUnique({
      where: { id: promotionId },
      select: { usageLimit: true },
    });

    if (!promotion) {
      throw new NotFoundException('Mã giảm giá không tồn tại');
    }

    // Tăng usedCount (atomic) kèm điều kiện kiểm tra giới hạn
    const updateResult = await prisma.promotions.updateMany({
      where: {
        id: promotionId,
        usedCount: { lt: promotion.usageLimit },
      },
      data: {
        usedCount: { increment: 1 },
      },
    });

    if (updateResult.count === 0) {
      throw new BadRequestException('Mã giảm giá đã hết lượt sử dụng');
    }

    // Ghi nhận usage
    await prisma.promotion_usages.create({
      data: {
        promotionId,
        userId,
        bookingId,
        discountAmount,
      },
    });

    // Cập nhật user_voucher nếu tồn tại
    const voucher = await prisma.user_vouchers.findFirst({
      where: { userId, promotionId, status: 'AVAILABLE' },
    });
    if (voucher) {
      await prisma.user_vouchers.update({
        where: { id: voucher.id },
        data: { status: 'USED', usedAt: new Date() },
      });
    }
  }

  /**
   * Hoàn trả lượt sử dụng coupon khi huỷ đặt phòng.
   * - Giảm usedCount
   * - Xoá promotion_usage
   * - Trả user_voucher về AVAILABLE (nếu có)
   */
  async refundCouponUsage(
    promotionId: number,
    userId: number,
    bookingId: number,
    options?: { tx?: any },
  ) {
    const prisma = options?.tx || this.prisma;

    // Giảm usedCount (atomic + CAS, tối thiểu về 0)
    await prisma.promotions.updateMany({
      where: { id: promotionId, usedCount: { gt: 0 } },
      data: { usedCount: { decrement: 1 } },
    });

    // Xoá ghi nhận usage
    await prisma.promotion_usages.deleteMany({
      where: { bookingId, promotionId, userId },
    });

    // Cập nhật user_voucher về AVAILABLE nếu tồn tại
    const voucher = await prisma.user_vouchers.findFirst({
      where: { userId, promotionId, status: 'USED' },
      orderBy: { usedAt: 'desc' },
    });
    if (voucher) {
      await prisma.user_vouchers.update({
        where: { id: voucher.id },
        data: { status: 'AVAILABLE', usedAt: null },
      });
    }
  }

  private invalid(message: string, orderTotal: number): CouponValidationResult {
    return {
      valid: false,
      promotion: null,
      couponDiscount: 0,
      afterCoupon: orderTotal,
      message,
    };
  }
}
