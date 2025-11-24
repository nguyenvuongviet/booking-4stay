import { BadRequestException, Injectable } from '@nestjs/common';
import { loyalty_program, Prisma } from '@prisma/client';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class LoyaltyProgram {
  constructor(private readonly prisma: PrismaService) {}

  async createLoyaltyProgram(
    userId: number,
    options?: {
      customLevelId?: number;
      forceReset?: boolean;
      tx?: Prisma.TransactionClient;
    },
  ): Promise<loyalty_program> {
    const { customLevelId, forceReset = false, tx } = options || {};
    const prisma = tx || this.prisma;

    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('Không tìm thấy người dùng!');

    const existing = await prisma.loyalty_program.findUnique({
      where: { userId },
    });
    if (existing && !forceReset) return existing;
    if (existing && forceReset)
      await prisma.loyalty_program.delete({ where: { userId } });

    let levelId = customLevelId;
    if (!levelId) {
      const defaultLevel = await prisma.levels.findFirst({
        where: { minPoints: 0 },
        orderBy: { id: 'asc' },
      });
      if (!defaultLevel) {
        throw new BadRequestException('Không tìm thấy cấp độ mặc định!');
      }
      levelId = defaultLevel.id;
    }

    return prisma.loyalty_program.create({
      data: {
        userId,
        totalBookings: 0,
        totalNights: 0,
        points: 0,
        levelId,
      },
    });
  }

  async recalculateLoyaltyLevel(userId: number): Promise<boolean> {
    const program = await this.prisma.loyalty_program.findUnique({
      where: { userId },
      include: { levels: true },
    });
    if (!program) return false;
    const levels = await this.prisma.levels.findMany({
      orderBy: { minPoints: 'asc' },
    });
    if (!levels.length) return false;

    const currentPoints = program.points;
    const newLevel = [...levels]
      .reverse()
      .find((lvl) => currentPoints >= lvl.minPoints);
    if (newLevel && newLevel.id !== program.levelId) {
      await this.prisma.loyalty_program.update({
        where: { userId },
        data: {
          levelId: newLevel.id,
          lastUpgradeDate: new Date(),
        },
      });
      return true;
    }
    return false;
  }
}
