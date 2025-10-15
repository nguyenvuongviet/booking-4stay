import { BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

export async function createLoyaltyProgram(
  prisma: PrismaClient,
  userId: number,
  options?: { customLevelId?: number; forceReset?: boolean },
) {
  const { customLevelId, forceReset = false } = options || {};

  const user = await prisma.users.findUnique({ where: { id: userId } });
  if (!user) throw new BadRequestException('Không tìm thấy người dùng!');

  const existing = await prisma.loyalty_program.findUnique({
    where: { userId },
  });

  if (existing && !forceReset) return existing;
  if (existing && forceReset) {
    await prisma.loyalty_program.delete({ where: { userId } });
  }

  let levelId = customLevelId;
  if (!levelId) {
    const defaultLevel = await prisma.loyalty_levels.findFirst({
      where: { minPoints: 0 },
      orderBy: { id: 'asc' },
    });
    if (!defaultLevel)
      throw new BadRequestException('Không tìm thấy cấp độ mặc định!');
    levelId = defaultLevel.id;
  }

  const loyalty = await prisma.loyalty_program.create({
    data: {
      userId,
      totalBookings: 0,
      totalNights: 0,
      points: 0,
      levelId,
    },
    include: { loyalty_levels: true },
  });

  return loyalty;
}

export async function recalculateLoyaltyLevel(
  prisma: PrismaClient,
  userId: number,
): Promise<boolean> {
  const program = await prisma.loyalty_program.findUnique({
    where: { userId },
    include: { loyalty_levels: true },
  });
  if (!program) return false;

  const levels = await prisma.loyalty_levels.findMany({
    orderBy: { minPoints: 'asc' },
  });
  if (!levels.length) return false;

  const currentPoints = program.points;
  const newLevel = [...levels]
    .reverse()
    .find((lvl) => currentPoints >= lvl.minPoints);

  if (newLevel && newLevel.id !== program.levelId) {
    await prisma.loyalty_program.update({
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
