import { Injectable } from '@nestjs/common';
import { subDays } from 'date-fns';
import { sanitizeRoom } from 'src/utils/sanitize/room.sanitize';
import { PrismaService } from '../prisma/prisma.service';
import { RecommendationCacheService } from './recommendation-cache.service';
import { v2 as cloudinary } from 'cloudinary';

const ROOM_INCLUDE = {
  room_images: true,
  room_amenities: { include: { amenities: true } },
  room_beds: true,
  location_countries: true,
  location_provinces: true,
  location_wards: true,
  users: true,
};

@Injectable()
export class RecommendationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: RecommendationCacheService,
  ) {}

  /**
   * Lấy danh sách phòng phổ biến, sắp xếp theo popularityScore.
   * Nếu bảng cache trống → tự tính toán lần đầu (bootstrap).
   */
  async getPopular(limit = 12) {
    // Kiểm tra cache đã có dữ liệu chưa
    const cacheCount = await this.prisma.room_popularity.count();
    if (cacheCount === 0) {
      await this.cacheService.recalculatePopularity();
    }

    const popularRooms = await this.prisma.room_popularity.findMany({
      orderBy: { popularityScore: 'desc' },
      take: limit,
      include: {
        rooms: {
          include: ROOM_INCLUDE,
        },
      },
    });

    return popularRooms
      .filter((p) => p.rooms && !p.rooms.isDeleted)
      .map((p) => ({
        ...sanitizeRoom(p.rooms),
        popularity: {
          score: Number(p.popularityScore),
          bookingCount30d: p.bookingCount30d,
          avgRating: Number(p.avgRating),
          reviewCount: p.reviewCount,
          recentCancelCount: p.recentCancelCount,
        },
        // Urgency badges
        badges: this.computeBadges(p),
      }));
  }

  /**
   * Phòng đang trống trong N ngày tới (Host-side: fill empty rooms).
   */
  async getAvailableSoon(days = 7, limit = 8) {
    const futureDate = subDays(new Date(), -days); // N ngày tới

    // Tìm phòng KHÔNG có booking active trong N ngày tới
    const rooms = await this.prisma.rooms.findMany({
      where: {
        isDeleted: false,
        bookings: {
          none: {
            status: {
              in: ['CONFIRMED', 'CHECKED_IN', 'PARTIALLY_PAID', 'PENDING'],
            },
            AND: [
              { checkIn: { lte: futureDate } },
              { checkOut: { gte: new Date() } },
            ],
          },
        },
      },
      orderBy: { rating: 'desc' },
      take: limit,
      include: ROOM_INCLUDE,
    });

    return sanitizeRoom(rooms);
  }

  /**
   * Tính urgency badges cho phòng dựa trên popularity data.
   */
  private computeBadges(pop: any): string[] {
    const badges: string[] = [];
    if (pop.bookingCount30d >= 3) {
      badges.push(`🔥 Đã được đặt ${pop.bookingCount30d} lần tháng này`);
    }
    if (pop.recentCancelCount > 0) {
      badges.push('🎯 Vừa có người hủy — đặt ngay!');
    }
    if (Number(pop.avgRating) >= 4.5 && pop.reviewCount >= 5) {
      badges.push('⭐ Được khách yêu thích');
    }
    return badges;
  }

  getImageUrl(publicId?: string | null): string | null {
    if (!publicId) return null;

    return cloudinary.url(publicId, {
      secure: true,
    });
  }

  async getPopularDestinations(limit = 10) {
    const provinces = await this.prisma.location_provinces.findMany({
      where: {
        isDeleted: false,
      },
      include: {
        rooms: {
          where: {
            isDeleted: false,
          },
          include: {
            bookings: {
              where: {
                status: {
                  in: [
                    'CONFIRMED',
                    'CHECKED_IN',
                    'CHECKED_OUT',
                  ],
                },
              },
            },
            room_images: {
              where: {
                isMain: true,
              },
              take: 1,
            },
          },
        },
      },
    });

    const result = provinces
      .map((province) => {
        const roomCount = province.rooms.length;

        const bookingCount = province.rooms.reduce(
          (sum, room) => sum + room.bookings.length,
          0,
        );

        const avgRating =
          roomCount > 0
            ? province.rooms.reduce(
              (sum, room) => sum + Number(room.rating || 0),
              0,
            ) / roomCount
            : 0;

        const publicId =
          province.imageUrl ||
          province.rooms[0]?.room_images[0]?.imageUrl;

        const coverImage = this.getImageUrl(publicId);

        console.log({
          publicId,
          coverImage,
        });


        return {
          id: province.id,
          name: province.name,
          imageUrl: coverImage,
          roomCount,
          bookingCount,
          avgRating: Number(avgRating.toFixed(1)),
          popularityScore:
            roomCount * 5 + bookingCount * 2 + avgRating,
        };
      })
      .sort(
        (a, b) => b.popularityScore - a.popularityScore,
      )
      .slice(0, limit);

    return result;
  }
}
