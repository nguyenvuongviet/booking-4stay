import { Injectable } from '@nestjs/common';
import { sanitizeRoom } from 'src/utils/sanitize/room.sanitize';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoriteService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Toggle yêu thích: nếu đã thích → bỏ thích, chưa thích → thêm vào.
   */
  async toggle(userId: number, roomId: number) {
    const existing = await this.prisma.user_favorites.findUnique({
      where: { userId_roomId: { userId, roomId } },
    });

    if (existing) {
      await this.prisma.user_favorites.delete({
        where: { id: existing.id },
      });
      return { isFavorited: false, message: 'Đã bỏ yêu thích' };
    }

    // Kiểm tra room tồn tại
    const room = await this.prisma.rooms.findFirst({
      where: { id: roomId, isDeleted: false },
      select: { id: true },
    });
    if (!room) {
      return { isFavorited: false, message: 'Phòng không tồn tại' };
    }

    await this.prisma.user_favorites.create({
      data: { userId, roomId },
    });
    return { isFavorited: true, message: 'Đã thêm vào yêu thích' };
  }

  /**
   * Lấy danh sách phòng yêu thích của user (có phân trang).
   */
  async findAll(userId: number, page = 1, pageSize = 12) {
    page = Math.max(1, Number(page) || 1);
    pageSize = Math.max(1, Number(pageSize) || 12);
    const skip = (page - 1) * pageSize;

    const where = {
      userId,
      rooms: { isDeleted: false },
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.user_favorites.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        include: {
          rooms: {
            include: {
              room_images: true,
              room_amenities: { include: { amenities: true } },
              room_beds: true,
              location_countries: true,
              location_provinces: true,
              location_wards: true,
              users: true,
            },
          },
        },
      }),
      this.prisma.user_favorites.count({ where }),
    ]);

    return {
      page,
      pageSize,
      total,
      items: items.map((fav) => ({
        favoriteId: fav.id,
        favoritedAt: fav.createdAt,
        ...sanitizeRoom(fav.rooms),
      })),
    };
  }

  /**
   * Kiểm tra user đã yêu thích phòng này chưa.
   */
  async check(userId: number, roomId: number) {
    const fav = await this.prisma.user_favorites.findUnique({
      where: { userId_roomId: { userId, roomId } },
      select: { id: true },
    });
    return { isFavorited: !!fav };
  }

  /**
   * Kiểm tra hàng loạt phòng đã yêu thích (dùng cho danh sách phòng).
   */
  async checkBulk(userId: number, roomIds: number[]) {
    if (!roomIds.length) return { favoriteMap: {} };

    const favs = await this.prisma.user_favorites.findMany({
      where: { userId, roomId: { in: roomIds } },
      select: { roomId: true },
    });

    const favoriteMap: Record<number, boolean> = {};
    for (const id of roomIds) {
      favoriteMap[id] = favs.some((f) => f.roomId === id);
    }
    return { favoriteMap };
  }
}
