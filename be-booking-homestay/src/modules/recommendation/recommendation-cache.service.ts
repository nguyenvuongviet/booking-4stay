import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { subDays } from 'date-fns';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Cron Job tính toán popularity score cho tất cả phòng.
 * Chạy mỗi 6 giờ (0h, 6h, 12h, 18h).
 * Score = 0.4×normalizedRating + 0.3×normalizedBookings + 0.2×normalizedReviews + 0.1×recencyBoost
 */
@Injectable()
export class RecommendationCacheService {
  private readonly logger = new Logger(RecommendationCacheService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron('0 */6 * * *', { timeZone: 'Asia/Ho_Chi_Minh' })
  async recalculatePopularity() {
    this.logger.log('[Cron] Bắt đầu tính toán Popularity Score...');
    const startTime = Date.now();

    try {
      const thirtyDaysAgo = subDays(new Date(), 30);
      const fortyEightHoursAgo = subDays(new Date(), 2);

      // 1. Lấy tất cả phòng đang active
      const rooms = await this.prisma.rooms.findMany({
        where: { isDeleted: false },
        select: { id: true, rating: true, reviewCount: true, createdAt: true },
      });

      if (!rooms.length) return;

      // 2. Lấy booking count 30 ngày cho từng phòng
      const bookingCounts = await this.prisma.bookings.groupBy({
        by: ['roomId'],
        where: {
          status: {
            in: ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'PARTIALLY_PAID'],
          },
          createdAt: { gte: thirtyDaysAgo },
          isDeleted: false,
        },
        _count: { id: true },
      });

      // 3. Lấy cancel count 48h cho từng phòng (phòng vừa bị hủy = slot trống mới)
      const cancelCounts = await this.prisma.bookings.groupBy({
        by: ['roomId'],
        where: {
          status: { in: ['CANCELLED', 'CANCELLED_BY_ADMIN'] },
          updatedAt: { gte: fortyEightHoursAgo },
          isDeleted: false,
        },
        _count: { id: true },
      });

      // 4. Tạo map dễ lookup
      const bookingMap = new Map(
        bookingCounts.map((b) => [b.roomId, b._count.id]),
      );
      const cancelMap = new Map(
        cancelCounts.map((c) => [c.roomId, c._count.id]),
      );

      // 5. Tìm max values để normalize (0–1)
      const maxBookings = Math.max(1, ...bookingCounts.map((b) => b._count.id));
      const maxReviews = Math.max(1, ...rooms.map((r) => r.reviewCount ?? 0));
      const maxRating = 5.0;

      // 6. Tính score cho từng phòng
      const upsertOps = rooms.map((room) => {
        const rating = Number(room.rating) || 0;
        const reviewCount = room.reviewCount ?? 0;
        const bookingCount30d = bookingMap.get(room.id) || 0;
        const recentCancelCount = cancelMap.get(room.id) || 0;

        // Normalize (0–1 scale)
        const normalizedRating = rating / maxRating;
        const normalizedBookings = bookingCount30d / maxBookings;
        const normalizedReviews = reviewCount / maxReviews;

        // Recency boost: phòng mới (< 14 ngày) +0.1
        const roomAge =
          (Date.now() - new Date(room.createdAt).getTime()) /
          (1000 * 60 * 60 * 24);
        const recencyBoost = roomAge < 14 ? 1.0 : 0;

        // Final score: weighted sum
        const popularityScore =
          0.4 * normalizedRating +
          0.3 * normalizedBookings +
          0.2 * normalizedReviews +
          0.1 * recencyBoost;

        return this.prisma.room_popularity.upsert({
          where: { roomId: room.id },
          create: {
            roomId: room.id,
            popularityScore,
            bookingCount30d,
            avgRating: rating,
            reviewCount,
            recentCancelCount,
            lastCalculatedAt: new Date(),
          },
          update: {
            popularityScore,
            bookingCount30d,
            avgRating: rating,
            reviewCount,
            recentCancelCount,
            lastCalculatedAt: new Date(),
          },
        });
      });

      await this.prisma.$transaction(upsertOps);

      const elapsed = Date.now() - startTime;
      this.logger.log(
        `[Cron] Popularity Score đã cập nhật cho ${rooms.length} phòng (${elapsed}ms).`,
      );
    } catch (error) {
      this.logger.error('[Cron] Lỗi khi tính Popularity Score', error);
    }
  }
}
