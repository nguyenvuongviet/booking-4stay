import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { eachDayOfInterval, format, subDays } from 'date-fns';

@Injectable()
export class PricingHelper {
  constructor(private readonly prisma: PrismaService) {}

  async priceForRange(
    roomId: number,
    basePrice: number,
    inDate: Date,
    outDate: Date,
  ): Promise<number> {
    const overrides = await this.prisma.room_prices.findMany({
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

  async applyLoyaltyDiscount(userId: number, rawTotal: number) {
    const loyalty = await this.prisma.loyalty_program.findFirst({
      where: { userId },
      include: { levels: true },
    });

    if (!loyalty || !loyalty.levels || !loyalty.levels.isActive) {
      return {
        totalPrice: rawTotal,
        discountAmount: 0,
        tierName: 'NONE',
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
}
