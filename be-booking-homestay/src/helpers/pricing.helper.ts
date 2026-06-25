import { Injectable } from '@nestjs/common';
import { eachDayOfInterval, format, subDays } from 'date-fns';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { PromotionHelper } from 'src/modules/promotion/promotion.helper';

@Injectable()
export class PricingHelper {
  constructor(
    private readonly prisma: PrismaService,
    private readonly promotionHelper: PromotionHelper,
  ) {}

  async priceForRange(
    roomId: number,
    basePrice: number,
    inDate: Date,
    outDate: Date,
    options?: { tx?: any },
  ): Promise<number> {
    const prisma = options?.tx || this.prisma;
    const overrides = await prisma.room_prices.findMany({
      where: {
        roomId,
        date: { gte: inDate, lt: outDate },
      },
      select: { date: true, price: true },
    });
    const priceMap = new Map<string, number>(
      overrides.map((o) => [format(o.date, 'yyyy-MM-dd'), Number(o.price)]),
    );
    let total = 0;

    const stayInterval = eachDayOfInterval({
      start: inDate,
      end: subDays(outDate, 1),
    });

    for (const day of stayInterval) {
      const dateKey = format(day, 'yyyy-MM-dd');
      total += priceMap.get(dateKey) ?? Number(basePrice);
    }
    return total;
  }

  async applyLoyaltyDiscount(
    userId: number,
    rawTotal: number,
    options?: { tx?: any },
  ) {
    const prisma = options?.tx || this.prisma;
    const loyalty = await prisma.loyalty_program.findFirst({
      where: { userId },
      include: { levels: true },
    });

    if (!loyalty || !loyalty.levels || !loyalty.levels.isActive) {
      return {
        totalPrice: rawTotal,
        discountAmount: 0,
        tierName: 'NONE',
        discountPercent: 0,
      };
    }

    const percent = Number(loyalty.levels.discountPercent);
    const maxDiscount = Number(loyalty.levels.maxDiscountAmount || 0);

    let discount = (rawTotal * percent) / 100;

    if (maxDiscount > 0 && discount > maxDiscount) {
      discount = maxDiscount;
    }

    const finalDiscount = Math.round(discount);
    const finalTotal = rawTotal - finalDiscount;

    return {
      totalPrice: finalTotal > 0 ? finalTotal : 0,
      discountAmount: finalDiscount,
      tierName: loyalty.levels.name,
      discountPercent: percent,
    };
  }

  /**
   * Tính toán giảm giá theo mô hình Thác nước (Waterfall).
   * Tầng 1: Coupon giảm trên rawTotal
   * Tầng 2: Loyalty giảm trên giá sau coupon
   */
  async applyWaterfallDiscount(
    userId: number,
    rawTotal: number,
    promotionCode?: string,
    provinceId?: number,
    options?: { tx?: any },
  ) {
    let afterCoupon = rawTotal;
    let couponDiscount = 0;
    let couponInfo: any = null;
    let couponMessage = '';

    // === Tầng 1: Coupon ===
    if (promotionCode) {
      const result = await this.promotionHelper.validateCoupon(
        promotionCode,
        userId,
        rawTotal,
        provinceId,
        options,
      );

      if (result.valid) {
        afterCoupon = result.afterCoupon;
        couponDiscount = result.couponDiscount;
        couponInfo = result.promotion;
        couponMessage = result.message;
      } else {
        couponMessage = result.message;
      }
    }

    // === Tầng 2: Loyalty (tính trên giá SAU coupon) ===
    const loyaltyResult = await this.applyLoyaltyDiscount(
      userId,
      afterCoupon,
      options,
    );

    return {
      rawTotal,
      // Tầng 1 — Coupon
      couponDiscount,
      couponCode: promotionCode || null,
      couponValid: couponDiscount > 0,
      couponMessage,
      promotionId: couponInfo?.id || null,
      afterCoupon,
      // Tầng 2 — Loyalty
      loyaltyDiscount: loyaltyResult.discountAmount,
      tierName: loyaltyResult.tierName,
      discountPercent: loyaltyResult.discountPercent,
      // Tổng
      totalDiscount: couponDiscount + loyaltyResult.discountAmount,
      totalPrice: loyaltyResult.totalPrice,
    };
  }
}
