import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { sanitizeRoom } from 'src/utils/sanitize/room.sanitize';
import { PrismaService } from '../prisma/prisma.service';

const ROOM_INCLUDE = {
  room_images: true,
  room_amenities: { include: { amenities: true } },
  room_beds: true,
  location_countries: true,
  location_provinces: true,
  location_wards: true,
  users: true,
};

/**
 * Content-Based Personalization Strategy
 * Phân tích implicit preferences từ booking history của user.
 * Gợi ý phòng dựa trên: giá, tỉnh, amenities, rating, capacity.
 */
@Injectable()
export class ContentBasedService {
  private readonly logger = new Logger(ContentBasedService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cron Job: Tính toán user preferences mỗi 6 giờ (sau popularity cron).
   */
  @Cron('15 */6 * * *', { timeZone: 'Asia/Ho_Chi_Minh' })
  async recalculateUserPreferences() {
    this.logger.log('[Cron] Bắt đầu tính toán User Preferences...');
    const startTime = Date.now();

    try {
      // Lấy tất cả users có ít nhất 1 booking CHECKED_OUT
      const usersWithBookings = await this.prisma.bookings.groupBy({
        by: ['userId'],
        where: {
          status: { in: ['CHECKED_OUT', 'CONFIRMED', 'CHECKED_IN'] },
          isDeleted: false,
        },
        _count: { id: true },
      });

      let processed = 0;

      for (const u of usersWithBookings) {
        try {
          await this.calculateUserProfile(u.userId, u._count.id);
          processed++;
        } catch (err) {
          this.logger.warn(
            `[Cron] Lỗi khi tính profile user ${u.userId}: ${err.message}`,
          );
        }
      }

      const elapsed = Date.now() - startTime;
      this.logger.log(
        `[Cron] User Preferences đã cập nhật cho ${processed} users (${elapsed}ms).`,
      );
    } catch (error) {
      this.logger.error('[Cron] Lỗi khi tính User Preferences', error);
    }
  }

  /**
   * Tính implicit profile cho 1 user từ booking history.
   */
  private async calculateUserProfile(userId: number, bookingCount: number) {
    const bookings = await this.prisma.bookings.findMany({
      where: {
        userId,
        status: { in: ['CHECKED_OUT', 'CONFIRMED', 'CHECKED_IN'] },
        isDeleted: false,
      },
      include: {
        rooms: {
          include: {
            room_amenities: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20, // Chỉ lấy 20 booking gần nhất
    });

    if (!bookings.length) return;

    // 1. Tính giá trung bình
    const prices = bookings.map((b) => Number(b.totalPrice) || 0);
    const avgPrice = prices.reduce((s, p) => s + p, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    // 2. Tính capacity trung bình
    const avgAdults =
      bookings.reduce((s, b) => s + b.adults, 0) / bookings.length;
    const avgChildren =
      bookings.reduce((s, b) => s + (b.children || 0), 0) / bookings.length;

    // 3. Tỉnh yêu thích (top 5 provinces)
    const provinceCounts: Record<number, number> = {};
    for (const b of bookings) {
      const pid = b.rooms?.provinceId;
      if (pid) provinceCounts[pid] = (provinceCounts[pid] || 0) + 1;
    }
    const favoriteProvinces = Object.entries(provinceCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([id]) => Number(id));

    // 4. Amenities ưa thích (top 10 amenities xuất hiện nhiều nhất)
    const amenityCounts: Record<number, number> = {};
    for (const b of bookings) {
      for (const ra of b.rooms?.room_amenities || []) {
        amenityCounts[ra.amenityId] = (amenityCounts[ra.amenityId] || 0) + 1;
      }
    }
    const preferredAmenities = Object.entries(amenityCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([id]) => Number(id));

    // 5. Min acceptable rating
    const ratings = bookings
      .map((b) => Number(b.rooms?.rating) || 0)
      .filter((r) => r > 0);
    const minAcceptRating = ratings.length ? Math.min(...ratings) : 0;

    // Upsert vào DB
    await this.prisma.user_preferences.upsert({
      where: { userId },
      create: {
        userId,
        avgPrice,
        minPrice,
        maxPrice,
        avgAdults,
        avgChildren,
        minAcceptRating,
        favoriteProvinces,
        preferredAmenities,
        totalCompletedBookings: bookingCount,
        lastCalculatedAt: new Date(),
      },
      update: {
        avgPrice,
        minPrice,
        maxPrice,
        avgAdults,
        avgChildren,
        minAcceptRating,
        favoriteProvinces,
        preferredAmenities,
        totalCompletedBookings: bookingCount,
        lastCalculatedAt: new Date(),
      },
    });
  }

  /**
   * Gợi ý phòng "For You" — dựa trên implicit preferences.
   * Fallback về popularity nếu user chưa có preferences.
   */
  async getForYou(userId: number, limit = 12) {
    // 1. Lấy preferences (hoặc tính lần đầu nếu chưa có)
    let prefs = await this.prisma.user_preferences.findUnique({
      where: { userId },
    });

    if (!prefs || prefs.totalCompletedBookings === 0) {
      const bookingCount = await this.prisma.bookings.count({
        where: {
          userId,
          status: { in: ['CHECKED_OUT', 'CONFIRMED', 'CHECKED_IN'] },
          isDeleted: false,
        },
      });
      if (bookingCount === 0) return []; // User mới → caller sẽ fallback popularity

      // Tính profile lần đầu rồi lấy lại (không dùng recursive call)
      await this.calculateUserProfile(userId, bookingCount);
      prefs = await this.prisma.user_preferences.findUnique({
        where: { userId },
      });
      if (!prefs) return [];
    }

    // 2. Lấy rooms user đã book (để loại trừ)
    const bookedRoomIds = await this.prisma.bookings.findMany({
      where: { userId, isDeleted: false },
      select: { roomId: true },
      distinct: ['roomId'],
    });
    const excludeIds = bookedRoomIds.map((b) => b.roomId);

    // 3. Build where clause dựa trên preferences
    const priceRange = Number(prefs.maxPrice) - Number(prefs.minPrice);
    const priceTolerance = Math.max(priceRange * 0.3, 100000);

    const favoriteProvinces = (prefs.favoriteProvinces as number[]) || [];
    const preferredAmenities = (prefs.preferredAmenities as number[]) || [];

    const where: any = {
      isDeleted: false,
      id: excludeIds.length ? { notIn: excludeIds } : undefined,
      price: {
        gte: Math.max(0, Number(prefs.minPrice) - priceTolerance),
        lte: Number(prefs.maxPrice) + priceTolerance,
      },
    };

    // 4. Lấy phòng phù hợp
    const rooms = await this.prisma.rooms.findMany({
      where,
      include: {
        ...ROOM_INCLUDE,
        room_amenities: { include: { amenities: true } },
      },
      take: limit * 3,
    });

    // 5. Scoring — tính điểm phù hợp cho mỗi phòng
    const scored = rooms.map((room) => {
      const provinceScore = favoriteProvinces.includes(room.provinceId)
        ? 30
        : 0;

      const avgP = Number(prefs.avgPrice);
      const roomP = Number(room.price);
      const priceDiff = Math.abs(roomP - avgP);
      const priceScore = Math.max(
        0,
        Math.round((25 - (priceDiff / avgP) * 25) * 10) / 10,
      );

      const rating = Number(room.rating) || 0;
      const ratingScore = Math.round((rating / 5) * 20 * 10) / 10;

      const roomAmenityIds = room.room_amenities.map((ra) => ra.amenityId);
      const overlap = preferredAmenities.filter((id) =>
        roomAmenityIds.includes(id),
      ).length;
      const amenityScore =
        preferredAmenities.length > 0
          ? Math.round((overlap / preferredAmenities.length) * 15 * 10) / 10
          : 0;

      const avgAd = Number(prefs.avgAdults) || 1;
      const capacityScore = room.adultCapacity >= avgAd ? 10 : 0;

      const totalScore =
        provinceScore + priceScore + ratingScore + amenityScore + capacityScore;

      return {
        room,
        score: totalScore,
        scoreDetails: {
          province: provinceScore,
          price: priceScore,
          rating: ratingScore,
          amenity: amenityScore,
          capacity: capacityScore,
          total: Math.round(totalScore),
        },
      };
    });

    // 6. Sort by score DESC, return top limit
    scored.sort((a, b) => b.score - a.score);
    const topResults = scored.slice(0, limit);

    return topResults.map((s) => ({
      ...sanitizeRoom(s.room),
      matchScore: s.scoreDetails.total,
    }));
  }

  /**
   * Phòng tương tự — dựa trên price, province, amenities, capacity.
   */
  async getSimilar(roomId: number, limit = 6) {
    const room = await this.prisma.rooms.findUnique({
      where: { id: roomId },
      include: { room_amenities: true },
    });

    if (!room) return [];

    const price = Number(room.price);
    const tolerance = price * 0.4; // ±40%

    const similar = await this.prisma.rooms.findMany({
      where: {
        isDeleted: false,
        id: { not: roomId },
        price: {
          gte: Math.max(0, price - tolerance),
          lte: price + tolerance,
        },
      },
      include: {
        ...ROOM_INCLUDE,
        room_amenities: { include: { amenities: true } },
      },
      take: limit * 3,
    });

    const roomAmenityIds = room.room_amenities.map((ra) => ra.amenityId);

    const scored = similar.map((s) => {
      let score = 0;

      // Same province (+40)
      if (s.provinceId === room.provinceId) score += 40;

      // Price proximity (+25)
      const pDiff = Math.abs(Number(s.price) - price);
      score += Math.max(0, 25 - (pDiff / price) * 25);

      // Rating (+15)
      score += ((Number(s.rating) || 0) / 5) * 15;

      // Amenity overlap (+20)
      const sAmenities = s.room_amenities.map((ra) => ra.amenityId);
      const overlap = roomAmenityIds.filter((id) =>
        sAmenities.includes(id),
      ).length;
      score +=
        roomAmenityIds.length > 0 ? (overlap / roomAmenityIds.length) * 20 : 0;

      return { room: s, score };
    });

    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, limit).map((s) => sanitizeRoom(s.room));
  }
}
