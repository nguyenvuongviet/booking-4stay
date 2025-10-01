import { BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';

export async function getLoyaltyLevel(
  prisma: PrismaService,
  levelName: string,
) {
  const level = await prisma.loyalty_levels.findUnique({
    where: { name: levelName },
  });

  if (!level) {
    throw new BadRequestException(`Loyalty level '${levelName}' không tồn tại`);
  }

  return level;
}
