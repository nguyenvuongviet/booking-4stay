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
      where: { roomId, isDeleted: false, date: { gte: inDate, lt: outDate } },
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
}
