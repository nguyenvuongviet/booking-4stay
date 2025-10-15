import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLoyaltyLevelDto } from './dto/create-loyalty-level.dto';
import { UpdateLoyaltyLevelDto } from './dto/update-loyalty-level.dto';
import { UpdateUserLoyaltyDto } from './dto/update-user-loyalty.dto';
import { cleanData } from 'src/utils/object';

@Injectable()
export class LoyaltyService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllLevels() {
    const levels = await this.prisma.loyalty_levels.findMany({
      orderBy: { minPoints: 'asc' },
    });

    return cleanData(levels);
  }

  async findOneLevel(id: number) {
    const level = await this.prisma.loyalty_levels.findUnique({
      where: { id },
    });
    if (!level) throw new BadRequestException('Cấp độ không tồn tại');
    return cleanData(level);
  }

  async createLevel(dto: CreateLoyaltyLevelDto) {
    const existingLevel = await this.prisma.loyalty_levels.findFirst({
      where: {
        OR: [{ name: dto.name }, { minPoints: dto.minPoints }],
      },
    });

    if (existingLevel) {
      if (existingLevel.name === dto.name) {
        throw new BadRequestException('Cấp độ đã tồn tại');
      }
      if (existingLevel.minPoints === dto.minPoints) {
        throw new BadRequestException('Số điểm đã được dùng cho cấp độ khác');
      }
    }

    return this.prisma.loyalty_levels.create({
      data: {
        name: dto.name,
        minPoints: dto.minPoints,
        description: dto.description,
        isActive: true,
      },
    });
  }

  async updateLevel(id: number, dto: UpdateLoyaltyLevelDto) {
    const level = await this.prisma.loyalty_levels.findUnique({
      where: { id },
    });
    if (!level) throw new BadRequestException('Cấp độ không tồn tại');

    if (dto.name && dto.name !== level.name) {
      const nameExists = await this.prisma.loyalty_levels.findFirst({
        where: {
          name: dto.name,
          NOT: { id },
        },
      });
      if (nameExists) {
        throw new BadRequestException('Tên cấp độ đã được sử dụng');
      }
    }

    if (
      dto.minPoints !== undefined &&
      dto.minPoints !== null &&
      dto.minPoints !== level.minPoints
    ) {
      const pointExists = await this.prisma.loyalty_levels.findFirst({
        where: {
          minPoints: dto.minPoints,
          NOT: { id },
        },
      });
      if (pointExists) {
        throw new BadRequestException('Số điểm đã được dùng cho cấp độ khác');
      }
    }

    return this.prisma.loyalty_levels.update({
      where: { id },
      data: {
        name: dto.name ?? level.name,
        minPoints: dto.minPoints ?? level.minPoints,
        description: dto.description ?? level.description,
        isActive: dto.isActive ?? level.isActive,
      },
    });
  }

  async toggleActive(id: number) {
    const level = await this.prisma.loyalty_levels.findUnique({
      where: { id },
    });
    if (!level) throw new BadRequestException('Cấp độ không tồn tại');

    return await this.prisma.loyalty_levels.update({
      where: { id },
      data: { isActive: !level.isActive },
    });
  }

  async findUserLoyalty(userId: number) {
    const program = await this.prisma.loyalty_program.findUnique({
      where: { userId },
      include: {
        loyalty_levels: true,
      },
    });
    if (!program)
      throw new BadRequestException('Người dùng chưa có chương trình Loyalty');
    return cleanData(program);
  }

  async updateUserLoyalty(userId: number, dto: UpdateUserLoyaltyDto) {
    const user = await this.prisma.users.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('Người dùng không tồn tại');

    const level = await this.prisma.loyalty_levels.findUnique({
      where: { name: dto.level },
    });
    if (!level || !level.isActive) {
      throw new BadRequestException(
        'Cấp độ không hợp lệ hoặc đang bị vô hiệu hoá',
      );
    }

    const program = await this.prisma.loyalty_program.upsert({
      where: { userId },
      create: {
        userId,
        levelId: level.id,
        points: dto.points ?? 0,
        totalBookings: dto.totalBookings ?? 0,
        totalNights: dto.totalNights ?? 0,
      },
      update: {
        levelId: level.id,
        points: dto.points ?? undefined,
        totalBookings: dto.totalBookings ?? undefined,
        totalNights: dto.totalNights ?? undefined,
        updatedAt: new Date(),
      },
      include: { loyalty_levels: true },
    });

    return cleanData(program);
  }

  async recomputeAllUserLevels() {
    const levels = await this.prisma.loyalty_levels.findMany({
      where: { isActive: true },
      orderBy: { minPoints: 'asc' },
    });

    if (levels.length === 0)
      throw new BadRequestException('Chưa có cấp độ nào khả dụng.');

    const programs = await this.prisma.loyalty_program.findMany({
      include: { loyalty_levels: true },
    });

    let updatedCount = 0;

    for (const program of programs) {
      const matchedLevel = levels
        .slice()
        .reverse()
        .find((lvl) => program.points >= lvl.minPoints);

      if (
        matchedLevel &&
        program.levelId !== matchedLevel.id &&
        matchedLevel.isActive
      ) {
        await this.prisma.loyalty_program.update({
          where: { id: program.id },
          data: {
            levelId: matchedLevel.id,
            lastUpgradeDate: new Date(),
          },
        });
        updatedCount++;
      }
    }

    return {
      message: `Cập nhật lại cấp độ cho ${updatedCount} người dùng.`,
    };
  }
}
