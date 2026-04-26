import { BadRequestException, Injectable } from '@nestjs/common';
import { sanitizeProgram } from 'src/utils/sanitize/loyalty.sanitize';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLoyaltyLevelDto } from './dto/create-loyalty-level.dto';
import { UpdateLoyaltyLevelDto } from './dto/update-loyalty-level.dto';

@Injectable()
export class LoyaltyService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureLevelExists(id: number) {
    const level = await this.prisma.levels.findUnique({ where: { id } });
    if (!level) throw new BadRequestException('Cấp độ không tồn tại');
    return level;
  }

  private async checkDuplicateLevel(
    name: string,
    minPoints: number,
    ignoreId?: number,
  ) {
    const exists = await this.prisma.levels.findFirst({
      where: {
        OR: [{ name }, { minPoints }],
        NOT: ignoreId ? { id: ignoreId } : undefined,
      },
    });
    if (!exists) return;
    if (exists.name === name)
      throw new BadRequestException('Tên cấp độ đã tồn tại');
    if (exists.minPoints === minPoints)
      throw new BadRequestException(
        'Điểm tối thiểu đã được sử dụng cho cấp độ khác',
      );
  }

  async findAllLevels() {
    return await this.prisma.levels.findMany({
      orderBy: { minPoints: 'asc' },
    });
  }

  async createLevel(dto: CreateLoyaltyLevelDto) {
    await this.checkDuplicateLevel(dto.name, dto.minPoints);
    return await this.prisma.levels.create({
      data: {
        name: dto.name,
        minPoints: dto.minPoints,
        discountPercent: dto.discountPercent ?? 0,
        maxDiscountAmount: dto.maxDiscountAmount ?? 0,
        description: dto.description ?? '',
        isActive: true,
      },
    });
  }

  async updateLevel(id: number, dto: UpdateLoyaltyLevelDto) {
    const current = await this.ensureLevelExists(id);
    const newName = dto.name ?? current.name;
    const newMinPoints = dto.minPoints ?? current.minPoints;

    await this.checkDuplicateLevel(newName, newMinPoints, id);
    return await this.prisma.levels.update({
      where: { id },
      data: {
        name: newName,
        minPoints: newMinPoints,
        discountPercent: dto.discountPercent ?? current.discountPercent,
        maxDiscountAmount: dto.maxDiscountAmount ?? current.maxDiscountAmount,
        description: dto.description ?? current.description,
        isActive: dto.isActive ?? current.isActive,
      },
    });
  }

  async toggleActive(id: number) {
    const level = await this.ensureLevelExists(id);
    return await this.prisma.levels.update({
      where: { id },
      data: { isActive: !level.isActive },
    });
  }

  async recomputeAllUserLevels() {
    const activeLevels = await this.prisma.levels.findMany({
      where: { isActive: true },
      orderBy: { minPoints: 'desc' },
    });

    if (activeLevels.length === 0)
      throw new BadRequestException('Chưa có cấp độ nào khả dụng để tính toán');

    const BATCH_SIZE = 1000;
    let totalUpdated = 0;
    let lastId = 0;

    while (true) {
      const programs = await this.prisma.loyalty_program.findMany({
        where: { id: { gt: lastId } },
        take: BATCH_SIZE,
        orderBy: { id: 'asc' },
        select: { id: true, points: true, levelId: true },
      });

      if (programs.length === 0) break;

      const updatesMap: Record<number, number[]> = {};

      for (const pg of programs) {
        const match = activeLevels.find((lvl) => pg.points >= lvl.minPoints);
        if (match && match.id !== pg.levelId) {
          if (!updatesMap[match.id]) updatesMap[match.id] = [];
          updatesMap[match.id].push(pg.id);
        }
        lastId = pg.id;
      }

      const updateEntries = Object.entries(updatesMap);
      if (updateEntries.length > 0) {
        const results = await Promise.all(
          updateEntries.map(([newLevelId, ids]) =>
            this.prisma.loyalty_program.updateMany({
              where: { id: { in: ids } },
              data: {
                levelId: Number(newLevelId),
                lastUpgradeDate: new Date(),
              },
            }),
          ),
        );
        totalUpdated += results.reduce((sum, res) => sum + res.count, 0);
      }
    }

    return {
      message: `Đã quét toàn bộ hệ thống. Cập nhật thành công cấp độ cho ${totalUpdated} người dùng.`,
      totalUpdated,
    };
  }

  async findAllUserLoyalty() {
    const programs = await this.prisma.loyalty_program.findMany({
      include: {
        levels: true,
        users: {
          include: { user_roles: { include: { roles: true } } },
        },
      },
      orderBy: {
        points: 'desc',
      },
    });

    return sanitizeProgram(programs);
  }
}
