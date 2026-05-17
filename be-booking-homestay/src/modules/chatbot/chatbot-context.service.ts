import { Injectable } from '@nestjs/common';
import { AppConfigKey } from '../app-configs/constants/app-config.constant';
import { PrismaService } from '../prisma/prisma.service';

const STOP_WORDS = new Set([
  'toi',
  'minh',
  'ban',
  'can',
  'muon',
  'tim',
  'phong',
  'homestay',
  'khach',
  'hang',
  'cho',
  'nguoi',
  'ngay',
  'gia',
  'bao',
  'nhieu',
  'co',
  'khong',
  'o',
  'tai',
  'la',
  've',
  'va',
  'hay',
]);

@Injectable()
export class ChatbotContextService {
  constructor(private readonly prisma: PrismaService) { }

  async build(message: string, userId?: number) {
    const keywords = this.extractKeywords(message);

    const [
      rooms,
      locations,
      loyaltyLevels,
      cancellationPolicy,
      siteInfo,
      currentUser,
      inventorySummary,
    ] =
      await Promise.all([
        this.findRelevantRooms(keywords),
        this.findLocations(),
        this.findLoyaltyLevels(),
        this.getCancellationPolicy(),
        this.getSiteInfo(),
        userId ? this.findCurrentUser(userId) : Promise.resolve(null),
        this.getInventorySummary(),
      ]);

    return {
      source: 'live_database',
      generatedAt: new Date().toISOString(),
      userKeywords: keywords,
      rooms,
      locations,
      loyaltyLevels,
      cancellationPolicy,
      siteInfo,
      currentUser,
      inventorySummary,
    };
  }

  private extractKeywords(message: string) {
    const normalized = this.normalize(message);

    return Array.from(
      new Set(
        normalized
          .split(/\s+/)
          .map((word) => word.trim())
          .filter((word) => word.length >= 3 && !STOP_WORDS.has(word)),
      ),
    ).slice(0, 10);
  }

  private normalize(value: string) {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\u0111/g, 'd')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private async findRelevantRooms(keywords: string[]) {
    const locationFilter = await this.findLocationFilter(keywords);
    const keywordFilters = keywords.flatMap((keyword) => [
      { name: { contains: keyword } },
      { description: { contains: keyword } },
      { street: { contains: keyword } },
      { fullAddress: { contains: keyword } },
      { location_provinces: { name: { contains: keyword } } },
      { location_wards: { name: { contains: keyword } } },
      { room_amenities: { some: { amenities: { name: { contains: keyword } } } } },
    ]);

    const where: any = {
      isDeleted: false,
      users: {
        isActive: true,
        isDeleted: false,
      },
    };

    if (locationFilter) {
      where.OR = locationFilter;
    } else if (keywordFilters.length > 0) {
      where.OR = keywordFilters;
    }

    const rooms = await this.prisma.rooms.findMany({
      where,
      orderBy: [{ rating: 'desc' }, { reviewCount: 'desc' }, { price: 'asc' }],
      take: 5,
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        adultCapacity: true,
        childCapacity: true,
        status: true,
        rating: true,
        reviewCount: true,
        street: true,
        fullAddress: true,
        location_countries: { select: { name: true } },
        location_provinces: { select: { name: true } },
        location_wards: { select: { name: true } },
        room_amenities: {
          take: 5,
          select: {
            amenities: {
              select: {
                name: true,
                category: true,
              },
            },
          },
        },
        room_beds: {
          select: {
            type: true,
            quantity: true,
          },
        },
      },
    });

    return rooms.map((room) => ({
      id: room.id,
      name: room.name,
      description: this.truncate(room.description, 160),
      pricePerNight: Number(room.price),
      capacity: {
        adults: room.adultCapacity,
        children: room.childCapacity,
      },
      status: room.status,
      rating: Number(room.rating || 0),
      reviewCount: room.reviewCount || 0,
      address: {
        country: room.location_countries?.name || null,
        province: room.location_provinces?.name || null,
        ward: room.location_wards?.name || null,
        street: room.street || null,
        fullAddress: room.fullAddress || null,
      },
      amenities: room.room_amenities
        .map((item) => item.amenities?.name)
        .filter(Boolean),
      beds: room.room_beds.map((bed) => ({
        type: bed.type,
        quantity: bed.quantity,
      })),
    }));
  }

  private async findLocationFilter(keywords: string[]) {
    if (keywords.length === 0) return null;

    const OR = keywords.flatMap((keyword) => [
      { name: { contains: keyword } },
      { code: { contains: keyword } },
    ]);

    const [provinces, wards] = await Promise.all([
      this.prisma.location_provinces.findMany({
        where: {
          isDeleted: false,
          OR,
        },
        take: 5,
        select: { id: true },
      }),
      this.prisma.location_wards.findMany({
        where: {
          isDeleted: false,
          OR,
        },
        take: 10,
        select: { id: true, provinceId: true },
      }),
    ]);

    const provinceIds = Array.from(
      new Set([
        ...provinces.map((province) => province.id),
        ...wards.map((ward) => ward.provinceId),
      ]),
    );
    const wardIds = wards.map((ward) => ward.id);

    const filters: any[] = [];
    if (provinceIds.length > 0) {
      filters.push({ provinceId: { in: provinceIds } });
    }
    if (wardIds.length > 0) {
      filters.push({ wardId: { in: wardIds } });
    }

    return filters.length > 0 ? filters : null;
  }

  private async findLocations() {
    const provinces = await this.prisma.location_provinces.findMany({
      where: {
        isDeleted: false,
        rooms: {
          some: {
            isDeleted: false,
          },
        },
      },
      orderBy: { name: 'asc' },
      take: 10,
      select: {
        id: true,
        name: true,
        code: true,
        latitude: true,
        longitude: true,
        _count: {
          select: {
            rooms: {
              where: { isDeleted: false },
            },
          },
        },
      },
    });

    return provinces.map((province) => ({
      id: province.id,
      name: province.name,
      code: province.code,
      coordinates:
        province.latitude && province.longitude
          ? {
            latitude: Number(province.latitude),
            longitude: Number(province.longitude),
          }
          : null,
      roomCount: province._count.rooms,
    }));
  }

  private async getInventorySummary() {
    const [totalRooms, totalLocationsWithRooms] = await Promise.all([
      this.prisma.rooms.count({
        where: {
          isDeleted: false,
          users: {
            isActive: true,
            isDeleted: false,
          },
        },
      }),
      this.prisma.location_provinces.count({
        where: {
          isDeleted: false,
          rooms: {
            some: {
              isDeleted: false,
              users: {
                isActive: true,
                isDeleted: false,
              },
            },
          },
        },
      }),
    ]);

    return {
      totalRooms,
      totalLocationsWithRooms,
    };
  }

  private async findLoyaltyLevels() {
    const levels = await this.prisma.levels.findMany({
      where: { isActive: true },
      orderBy: { minPoints: 'asc' },
      select: {
        id: true,
        name: true,
        minPoints: true,
        discountPercent: true,
        maxDiscountAmount: true,
        description: true,
      },
    });

    return levels.map((level) => ({
      id: level.id,
      name: level.name,
      minPoints: level.minPoints,
      discountPercent: Number(level.discountPercent),
      maxDiscountAmount: Number(level.maxDiscountAmount),
      description: level.description,
    }));
  }

  private async findCurrentUser(userId: number) {
    const user = await this.prisma.users.findFirst({
      where: {
        id: userId,
        isDeleted: false,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        loyalty_program: {
          select: {
            points: true,
            totalBookings: true,
            totalNights: true,
            lastUpgradeDate: true,
            levels: {
              select: {
                id: true,
                name: true,
                minPoints: true,
                discountPercent: true,
                maxDiscountAmount: true,
                description: true,
              },
            },
          },
        },
      },
    });

    if (!user) return null;

    const activeLevels = await this.prisma.levels.findMany({
      where: { isActive: true },
      orderBy: { minPoints: 'asc' },
      select: {
        id: true,
        name: true,
        minPoints: true,
        discountPercent: true,
        maxDiscountAmount: true,
      },
    });

    const points = user.loyalty_program?.points || 0;
    const nextLevel = activeLevels.find((level) => level.minPoints > points);

    return {
      id: user.id,
      fullName: `${user.firstName} ${user.lastName}`.trim(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      loyalty: user.loyalty_program
        ? {
          points,
          totalBookings: user.loyalty_program.totalBookings,
          totalNights: user.loyalty_program.totalNights,
          lastUpgradeDate: user.loyalty_program.lastUpgradeDate,
          currentLevel: {
            id: user.loyalty_program.levels.id,
            name: user.loyalty_program.levels.name,
            minPoints: user.loyalty_program.levels.minPoints,
            discountPercent: Number(
              user.loyalty_program.levels.discountPercent,
            ),
            maxDiscountAmount: Number(
              user.loyalty_program.levels.maxDiscountAmount,
            ),
            description: user.loyalty_program.levels.description,
          },
          nextLevel: nextLevel
            ? {
              id: nextLevel.id,
              name: nextLevel.name,
              minPoints: nextLevel.minPoints,
              pointsNeeded: nextLevel.minPoints - points,
              discountPercent: Number(nextLevel.discountPercent),
              maxDiscountAmount: Number(nextLevel.maxDiscountAmount),
            }
            : null,
        }
        : null,
    };
  }

  private async getCancellationPolicy() {
    const config = await this.prisma.app_configs.findUnique({
      where: { key: AppConfigKey.CANCELLATION_POLICY },
      select: { value: true, updatedAt: true },
    });

    return {
      rules: Array.isArray(config?.value) ? config?.value : [],
      updatedAt: config?.updatedAt || null,
    };
  }

  private async getSiteInfo() {
    const configs = await this.prisma.app_configs.findMany({
      where: {
        key: {
          in: [AppConfigKey.SITE_NAME, AppConfigKey.CONTACT_EMAIL],
        },
      },
      select: {
        key: true,
        value: true,
      },
    });

    return configs.reduce<Record<string, unknown>>((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {});
  }

  private truncate(value?: string | null, maxLength = 200) {
    if (!value) return null;
    if (value.length <= maxLength) return value;
    return `${value.slice(0, maxLength).trim()}...`;
  }
}
