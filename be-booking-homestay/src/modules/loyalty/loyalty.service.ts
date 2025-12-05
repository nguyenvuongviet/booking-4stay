import { BadRequestException, Injectable } from '@nestjs/common';
import { sanitizeProgram } from 'src/utils/sanitize/loyalty.sanitize';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLoyaltyLevelDto } from './dto/create-loyalty-level.dto';
import { UpdateLoyaltyLevelDto } from './dto/update-loyalty-level.dto';
import { UpdateUserLoyaltyDto } from './dto/update-user-loyalty.dto';

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
    const levels = await this.prisma.levels.findMany({
      where: { isActive: true },
      orderBy: { minPoints: 'asc' },
    });
    if (levels.length === 0)
      throw new BadRequestException('Chưa có cấp độ nào khả dụng');

    const reversedLevels = [...levels].reverse();
    const programs = await this.prisma.loyalty_program.findMany();

    let updatedCount = 0;

    for (const program of programs) {
      const match = reversedLevels.find(
        (lvl) => program.points >= lvl.minPoints,
      );

      if (match && match.id !== program.levelId) {
        await this.prisma.loyalty_program.update({
          where: { id: program.id },
          data: {
            levelId: match.id,
            lastUpgradeDate: new Date(),
          },
        });
        updatedCount++;
      }
    }

    return {
      message: `Đã cập nhật cấp độ cho ${updatedCount} người dùng.`,
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

  async findUserLoyalty(userId: number) {
    // const program = await this.prisma.loyalty_program.findUnique({
    //   where: { userId },
    //   include: { levels: true },
    // });
    // if (!program)
    //   throw new BadRequestException(
    //     'Người dùng chưa tham gia chương trình Loyalty',
    //   );
    // return sanitizeProgram(program);
  }

  async updateUserLoyalty(userId: number, dto: UpdateUserLoyaltyDto) {
    // const user = await this.prisma.users.findUnique({ where: { id: userId } });
    // if (!user) throw new BadRequestException('Người dùng không tồn tại');
    // const level = await this.prisma.levels.findUnique({
    //   where: { name: dto.levelId },
    // });
    // if (!level || !level.isActive) {
    //   throw new BadRequestException(
    //     'Cấp độ không hợp lệ hoặc đang bị vô hiệu hoá',
    //   );
    // }
    // const updated = await this.prisma.loyalty_program.upsert({
    //   where: { userId },
    //   create: {
    //     userId,
    //     levelId: activeLevel?.id ?? undefined,
    //     points: dto.points ?? 0,
    //     totalBookings: dto.totalBookings ?? 0,
    //     totalNights: dto.totalNights ?? 0,
    //   },
    //   update: {
    //     levelId: activeLevel?.id ?? undefined,
    //     points: dto.points ?? undefined,
    //     totalBookings: dto.totalBookings ?? undefined,
    //     totalNights: dto.totalNights ?? undefined,
    //     lastUpgradeDate: activeLevel ? new Date() : undefined,
    //   },
    //   include: { levels: true },
    // });
    // return sanitizeProgram(updated);
  }
}
