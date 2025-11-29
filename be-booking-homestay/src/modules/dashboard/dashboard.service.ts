import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    const [revenueAgg, bookingCount, userCount, roomCount] = await Promise.all([
      this.prisma.bookings.aggregate({
        _sum: { totalPrice: true },
        where: {
          status: { in: ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'] },
          isDeleted: false,
        },
      }),
      this.prisma.bookings.count({ where: { isDeleted: false } }),
      this.prisma.users.count({ where: { isDeleted: false } }),
      this.prisma.rooms.count({ where: { isDeleted: false } }),
    ]);

    return {
      totalRevenue: Number(revenueAgg._sum.totalPrice ?? 0),
      totalBookings: bookingCount,
      totalUsers: userCount,
      totalRooms: roomCount,
    };
  }

  async getRevenueByMonth(year: number) {
    const bookings = await this.prisma.bookings.findMany({
      where: {
        status: { in: ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'] },
        isDeleted: false,
        updatedAt: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${year + 1}-01-01`),
        },
      },
      select: {
        updatedAt: true,
        totalPrice: true,
      },
    });

    const months = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(0, i).toLocaleString('en', { month: 'short' }),
      revenue: 0,
      bookings: 0,
    }));

    for (const b of bookings) {
      const m = new Date(b.updatedAt).getMonth();
      months[m].revenue += Number(b.totalPrice);
      months[m].bookings++;
    }

    return months;
  }

  async getRecentBookings(limit = 5) {
    const bookings = await this.prisma.bookings.findMany({
      where: { isDeleted: false },
      include: {
        users: { select: { firstName: true, lastName: true } },
        rooms: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return bookings.map((b) => ({
      id: b.id,
      userName: `${b.users?.firstName ?? ''} ${b.users?.lastName ?? ''}`.trim(),
      roomName: b.rooms?.name ?? 'N/A',
      total: Number(b.totalPrice),
      status: b.status,
      createdAt: b.createdAt,
    }));
  }

  async getBookingStatusSummary() {
    const results = await this.prisma.bookings.groupBy({
      by: ['status'],
      _count: { _all: true },
      where: { isDeleted: false },
    });

    return results.map((r) => ({
      status: r.status,
      count: r._count._all,
    }));
  }

  async getTopRooms(limit = 5) {
    const grouped = await this.prisma.bookings.groupBy({
      by: ['roomId'],
      _count: { roomId: true },
      _sum: { totalPrice: true },
      where: {
        isDeleted: false,
        status: { in: ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'] },
      },
      orderBy: [{ _count: { roomId: 'desc' } }],
      take: limit,
    });

    const enriched = await Promise.all(
      grouped.map(async (g) => {
        const room = await this.prisma.rooms.findUnique({
          where: { id: g.roomId },
          select: { name: true },
        });
        return {
          roomName: room?.name ?? 'N/A',
          bookings: g._count.roomId,
          revenue: Number(g._sum?.totalPrice ?? 0),
        };
      }),
    );

    return enriched;
  }
}
