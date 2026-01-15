import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { eachDate } from 'src/utils/date.util';

@Injectable()
export class PricingHelper {
  constructor(private readonly prisma: PrismaService) {}

  async priceForRange(
    roomId: number,
    basePrice: number,
    inDate: Date,
    outDate: Date,
  ) {
    const overrides = await this.prisma.room_prices.findMany({
      where: { roomId, date: { gte: inDate, lt: outDate } },
      select: { date: true, price: true },
    });
    const map = new Map(
      overrides.map((o) => [
        o.date.toISOString().slice(0, 10),
        Number(o.price),
      ]),
    );
    let total = 0;
    for (const d of eachDate(inDate, outDate)) {
      const key = d.toISOString().slice(0, 10);
      total += map.get(key) ?? basePrice;
    }
    return total;
  }

  async applyLoyaltyDiscount(userId: number, rawTotal: number) {
    const loyalty = await this.prisma.loyalty_program.findFirst({
      where: { userId },
      include: { levels: true },
    });

    if (!loyalty || !loyalty.levels || !loyalty.levels.isActive) {
      return {
        totalPrice: rawTotal,
        discountAmount: 0,
      };
    }

    const percent = Number(loyalty.levels.discountPercent);
    const maxDiscount = Number(loyalty.levels.maxDiscountAmount ?? 0);

    let discount = (rawTotal * percent) / 100;

    if (maxDiscount > 0) {
      discount = Math.min(discount, maxDiscount);
    }

    return {
      totalPrice: rawTotal - discount,
      discountAmount: discount,
    };
  }
}
