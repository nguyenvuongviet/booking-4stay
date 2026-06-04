import { Injectable } from '@nestjs/common';
import { AppConfigKey } from '../app-configs/constants/app-config.constant';
import { PrismaService } from '../prisma/prisma.service';
import { RagIndexService } from './rag-index.service';
import { ChatIntent } from './rag-intent.service';

@Injectable()
export class ChatbotContextService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ragIndex: RagIndexService,
  ) { }

  // Build context theo intent — chỉ fetch data thực sự cần thiết
  async build(message: string, userId?: number, intent?: ChatIntent) {
    const resolvedIntent = intent ?? ChatIntent.ROOM_SEARCH;

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
        this.shouldFetchRooms(resolvedIntent)
          ? this.findRelevantRoomsRAG(message)
          : Promise.resolve([]),

        this.shouldFetchLocations(resolvedIntent)
          ? this.findLocations()
          : Promise.resolve([]),

        this.shouldFetchLoyalty(resolvedIntent)
          ? this.findLoyaltyLevels()
          : Promise.resolve([]),

        this.shouldFetchPolicy(resolvedIntent)
          ? this.getCancellationPolicy()
          : Promise.resolve({ rules: [], updatedAt: null }),

        this.shouldFetchSiteInfo(resolvedIntent)
          ? this.getSiteInfo()
          : Promise.resolve({}),

        userId && this.shouldFetchUser(resolvedIntent)
          ? this.findCurrentUser(userId)
          : Promise.resolve(null),

        this.shouldFetchInventory(resolvedIntent)
          ? this.getInventorySummary()
          : Promise.resolve(null),
      ]);

    return {
      source: 'rag_live_database',
      intent: resolvedIntent,
      generatedAt: new Date().toISOString(),
      rooms,
      locations,
      loyaltyLevels,
      cancellationPolicy,
      siteInfo,
      currentUser,
      inventorySummary,
    };
  }

  // Intent guards để tối ưu chỉ fetch data cần thiết, tránh lãng phí tài nguyên khi Gemini bị quota
  private shouldFetchRooms(intent: ChatIntent) {
    return [ChatIntent.ROOM_SEARCH].includes(intent);
  }

  private shouldFetchLocations(intent: ChatIntent) {
    return [ChatIntent.ROOM_SEARCH, ChatIntent.INVENTORY].includes(intent);
  }

  private shouldFetchLoyalty(intent: ChatIntent) {
    return [ChatIntent.LOYALTY].includes(intent);
  }

  private shouldFetchPolicy(intent: ChatIntent) {
    return [ChatIntent.CANCELLATION].includes(intent);
  }

  private shouldFetchSiteInfo(intent: ChatIntent) {
    return [ChatIntent.GENERAL].includes(intent);
  }

  private shouldFetchUser(intent: ChatIntent) {
    return [ChatIntent.LOYALTY, ChatIntent.USER_PROFILE, ChatIntent.ROOM_SEARCH].includes(intent);
  }

  private shouldFetchInventory(intent: ChatIntent) {
    return [ChatIntent.INVENTORY].includes(intent);
  }

  // Tìm phòng liên quan bằng RAG (cosine similarity với Gemini embeddings)
  // Fallback về keyword search nếu chưa có embeddings
  private async findRelevantRoomsRAG(query: string) {
    try {
      const roomIds = await this.ragIndex.searchSimilarRooms(query, 5, 0.3);

      if (roomIds.length > 0) {
        return this.ragIndex.getRoomsByIds(roomIds);
      }

      // Fallback: không có embedding → dùng keyword LIKE
      return this.findRoomsByKeyword(query);
    } catch {
      return this.findRoomsByKeyword(query);
    }
  }

  private async findRoomsByKeyword(message: string) {
    const keywords = this.extractKeywords(message);
    if (keywords.length === 0) {
      return this.findTopRooms();
    }

    const keywordFilters = keywords.flatMap((kw) => [
      { name: { contains: kw } },
      { description: { contains: kw } },
      { fullAddress: { contains: kw } },
      { location_provinces: { name: { contains: kw } } },
      { room_amenities: { some: { amenities: { name: { contains: kw } } } } },
    ]);

    const rooms = await this.prisma.rooms.findMany({
      where: {
        isDeleted: false,
        status: 'AVAILABLE',
        users: { isActive: true, isDeleted: false },
        OR: keywordFilters,
      },
      orderBy: [{ rating: 'desc' }, { reviewCount: 'desc' }],
      take: 5,
      select: this.roomSelect(),
    });

    return this.mapRooms(rooms);
  }

  private async findTopRooms() {
    const rooms = await this.prisma.rooms.findMany({
      where: {
        isDeleted: false,
        status: 'AVAILABLE',
        users: { isActive: true, isDeleted: false },
      },
      orderBy: [{ rating: 'desc' }, { reviewCount: 'desc' }],
      take: 5,
      select: this.roomSelect(),
    });
    return this.mapRooms(rooms);
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
      take: 15,
      select: {
        id: true,
        name: true,
        code: true,
        _count: {
          select: {
            rooms: {
              where: { isDeleted: false }
            }
          }
        },
      },
    });

    return provinces.map((p) => ({
      id: p.id,
      name: p.name,
      code: p.code,
      roomCount: p._count.rooms,
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
    return levels.map((l) => ({
      id: l.id,
      name: l.name,
      minPoints: l.minPoints,
      discountPercent: Number(l.discountPercent),
      maxDiscountAmount: Number(l.maxDiscountAmount),
      description: l.description,
    }));
  }

  private async findCurrentUser(userId: number) {
    const user = await this.prisma.users.findFirst({
      where: { id: userId, isDeleted: false },
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
        minPoints: true
      },
    });

    const points = user.loyalty_program?.points || 0;
    const nextLevel = activeLevels.find((l) => l.minPoints > points);

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

  // Helpers
  private roomSelect() {
    return {
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
        take: 8,
        select: { amenities: { select: { name: true, category: true } } },
      },
      room_beds: { select: { type: true, quantity: true } },
    };
  }

  private mapRooms(rooms: any[]) {
    return rooms.map((room) => ({
      id: room.id,
      name: room.name,
      description: room.description
        ? room.description.slice(0, 200) + (room.description.length > 200 ? '...' : '')
        : null,
      pricePerNight: Number(room.price),
      capacity: { adults: room.adultCapacity, children: room.childCapacity },
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
      amenities: room.room_amenities.map((ra: any) => ra.amenities?.name).filter(Boolean),
      beds: room.room_beds.map((b: any) => ({ type: b.type, quantity: b.quantity })),
    }));
  }

  private extractKeywords(message: string): string[] {
    const STOP_WORDS = new Set([
      'toi', 'minh', 'ban', 'can', 'muon', 'tim', 'phong', 'homestay',
      'khach', 'hang', 'cho', 'nguoi', 'ngay', 'gia', 'bao', 'nhieu',
      'co', 'khong', 'o', 'tai', 'la', 've', 'va', 'hay',
    ]);

    const normalized = message
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\u0111/g, 'd')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return Array.from(
      new Set(
        normalized
          .split(/\s+/)
          .filter((w) => w.length >= 3 && !STOP_WORDS.has(w)),
      ),
    ).slice(0, 10);
  }
}
