import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Contextual Boost — Điều chỉnh điểm gợi ý theo ngữ cảnh thời gian thực.
 *
 * | Ngữ cảnh                          | Boost | Cách xác định                          |
 * |-----------------------------------|-------|----------------------------------------|
 * | Tỉnh đang hot (booking ≥5 / 30d) | +15%  | GROUP BY provinceId từ bookings gần đây |
 * | Phòng vừa bị hủy (48h)           | +20%  | Booking CANCELLED trong 48h qua        |
 * | Phòng mới thêm (< 14 ngày)       | +10%  | rooms.createdAt                        |
 * | Cuối tuần (T6–CN)                 | +10%  | dayOfWeek hiện tại                     |
 */
@Injectable()
export class ContextualBoostService {
  private readonly logger = new Logger(ContextualBoostService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lấy danh sách tỉnh "đang hot" — booking nhiều trong 30 ngày qua.
   * Trả về Set<provinceId>.
   */
  async getHotProvinces(minBookings = 5): Promise<Set<number>> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const results = await this.prisma.bookings.groupBy({
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

    // Lấy provinceId từ roomIds
    const roomIds = results
      .filter((r) => r._count.id >= minBookings)
      .map((r) => r.roomId);

    if (roomIds.length === 0) return new Set();

    const rooms = await this.prisma.rooms.findMany({
      where: { id: { in: roomIds } },
      select: { provinceId: true },
      distinct: ['provinceId'],
    });

    return new Set(rooms.map((r) => r.provinceId));
  }

  /**
   * Lấy roomIds vừa bị hủy trong 48h qua → slot trống mới.
   */
  async getRecentlyCancelledRoomIds(): Promise<Set<number>> {
    const fortyEightHoursAgo = new Date();
    fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48);

    const cancelled = await this.prisma.bookings.findMany({
      where: {
        status: 'CANCELLED',
        updatedAt: { gte: fortyEightHoursAgo },
        isDeleted: false,
      },
      select: { roomId: true },
      distinct: ['roomId'],
    });

    return new Set(cancelled.map((b) => b.roomId));
  }

  /**
   * Kiểm tra hôm nay có phải cuối tuần (T6–CN) không.
   */
  isWeekend(): boolean {
    const day = new Date().getDay(); // 0=CN, 5=T6, 6=T7
    return day === 0 || day === 5 || day === 6;
  }

  /**
   * Kiểm tra phòng có phải mới thêm (< 14 ngày) không.
   */
  isNewRoom(createdAt: Date): boolean {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    return new Date(createdAt) >= fourteenDaysAgo;
  }

  /**
   * Áp dụng Contextual Boost lên danh sách phòng.
   * Mỗi phòng sẽ được cộng thêm boost % vào matchScore.
   * Trả về danh sách đã sort lại theo score mới + gắn boost tags.
   */
  async applyBoost(rooms: any[]): Promise<any[]> {
    if (rooms.length === 0) return rooms;

    const [hotProvinces, cancelledRooms] = await Promise.all([
      this.getHotProvinces(3), // Hạ threshold xuống 3 cho demo
      this.getRecentlyCancelledRoomIds(),
    ]);
    const weekend = this.isWeekend();

    const boostedRooms = rooms.map((room) => {
      const boosts: string[] = [];
      let boostMultiplier = 1.0;

      // 1. Tỉnh đang hot
      if (hotProvinces.has(room.location?.provinceId || room.provinceId)) {
        boostMultiplier += 0.15;
        boosts.push('🔥 Điểm đến đang hot');
      }

      // 2. Phòng vừa bị hủy → slot trống mới
      if (cancelledRooms.has(room.id)) {
        boostMultiplier += 0.2;
        boosts.push('🎯 Vừa có người hủy');
      }

      // 3. Phòng mới
      if (room.createdAt && this.isNewRoom(room.createdAt)) {
        boostMultiplier += 0.1;
        boosts.push('✨ Phòng mới');
      }

      // 4. Cuối tuần + rating cao
      if (weekend && (Number(room.rating) || 0) >= 4.5) {
        boostMultiplier += 0.1;
        boosts.push('🌟 Được yêu thích cuối tuần');
      }

      const originalScore = room.matchScore || 50; // Default 50 nếu không có
      const boostedScore = Math.min(
        100,
        Math.round(originalScore * boostMultiplier),
      );

      return {
        ...room,
        matchScore: boostedScore,
        boostTags: boosts.length > 0 ? boosts : undefined,
      };
    });

    return boostedRooms.sort((a, b) => b.matchScore - a.matchScore);
  }
}
