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
    const start = new Date(`${year}-01-01`);
    const end = new Date(`${year + 1}-01-01`);

    const bookings = await this.prisma.bookings.findMany({
      where: {
        status: { in: ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'] },
        isDeleted: false,
        checkOut: {
          gte: start,
          lt: end,
        },
      },
      select: {
        checkOut: true,
        totalPrice: true,
      },
    });

    const months = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(0, i).toLocaleString('en', { month: 'short' }),
      revenue: 0,
      bookings: 0,
    }));

    for (const b of bookings) {
      const m = new Date(b.checkOut).getMonth();
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

  async getBookingStatusSummary(year?: number, month?: number) {
    const where: any = { isDeleted: false };

    if (year) {
      where.createdAt = {
        gte: new Date(year, 0, 1),
        lt: new Date(year + 1, 0, 1),
      };

      if (month) {
        where.createdAt = {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1),
        };
      }
    }

    const results = await this.prisma.bookings.groupBy({
      by: ['status'],
      _count: { _all: true },
      where,
    });

    const ALL_STATUSES = [
      'PENDING',
      'PARTIALLY_PAID',
      'CONFIRMED',
      'CHECKED_IN',
      'CHECKED_OUT',
      'CANCELLED',
      'WAITING_REFUND',
      'REFUNDED',
    ];

    return ALL_STATUSES.map((s) => {
      const found = results.find((r) => r.status === s);
      return {
        status: s,
        count: found?._count._all ?? 0,
      };
    });
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

    const roomIds = grouped.map((g) => g.roomId);
    const rooms = await this.prisma.rooms.findMany({
      where: { id: { in: roomIds } },
      select: { id: true, name: true },
    });
    const roomMap = new Map(rooms.map((r) => [r.id, r.name]));

    return grouped.map((g) => ({
      roomId: g.roomId,
      roomName: roomMap.get(g.roomId) ?? 'N/A',
      bookings: g._count.roomId,
      revenue: Number(g._sum?.totalPrice ?? 0),
    }));
  }

  async getDashboardSummary() {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfThisMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
      999,
    );

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // 1. KPI Cards data
    // Revenue: this month vs last month
    const thisMonthRevenueAgg = await this.prisma.bookings.aggregate({
      _sum: { totalPrice: true },
      where: {
        status: { in: ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'] },
        isDeleted: false,
        checkOut: { gte: startOfThisMonth, lte: endOfThisMonth },
      },
    });
    const thisMonthRevenue = Number(thisMonthRevenueAgg._sum.totalPrice ?? 0);

    const lastMonthRevenueAgg = await this.prisma.bookings.aggregate({
      _sum: { totalPrice: true },
      where: {
        status: { in: ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'] },
        isDeleted: false,
        checkOut: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
    });
    const lastMonthRevenue = Number(lastMonthRevenueAgg._sum.totalPrice ?? 0);

    const revenueChangePercent =
      lastMonthRevenue > 0
        ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : 0;

    // Bookings count: this month vs last month (created date)
    const thisMonthBookings = await this.prisma.bookings.count({
      where: {
        isDeleted: false,
        createdAt: { gte: startOfThisMonth, lte: endOfThisMonth },
      },
    });

    const lastMonthBookings = await this.prisma.bookings.count({
      where: {
        isDeleted: false,
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
    });

    const bookingsChangePercent =
      lastMonthBookings > 0
        ? ((thisMonthBookings - lastMonthBookings) / lastMonthBookings) * 100
        : 0;

    // Occupancy Rate: this month vs last month
    const totalRoomsCount = await this.prisma.rooms.count({
      where: { isDeleted: false },
    });

    // This month booked nights
    const bookingsThisMonth = await this.prisma.bookings.findMany({
      where: {
        isDeleted: false,
        status: { in: ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'] },
        checkIn: { lt: endOfThisMonth },
        checkOut: { gt: startOfThisMonth },
      },
      select: { checkIn: true, checkOut: true },
    });

    let bookedNightsThisMonth = 0;
    for (const b of bookingsThisMonth) {
      const overlapStart =
        b.checkIn < startOfThisMonth ? startOfThisMonth : b.checkIn;
      const overlapEnd =
        b.checkOut > endOfThisMonth ? endOfThisMonth : b.checkOut;
      const diffTime = Math.max(
        0,
        overlapEnd.getTime() - overlapStart.getTime(),
      );
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      bookedNightsThisMonth += diffDays;
    }
    const daysInThisMonth = endOfThisMonth.getDate();
    const totalAvailableRoomNightsThisMonth = totalRoomsCount * daysInThisMonth;
    const occupancyRateThisMonth =
      totalAvailableRoomNightsThisMonth > 0
        ? (bookedNightsThisMonth / totalAvailableRoomNightsThisMonth) * 100
        : 0;

    // Last month booked nights
    const bookingsLastMonth = await this.prisma.bookings.findMany({
      where: {
        isDeleted: false,
        status: { in: ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'] },
        checkIn: { lt: endOfLastMonth },
        checkOut: { gt: startOfLastMonth },
      },
      select: { checkIn: true, checkOut: true },
    });

    let bookedNightsLastMonth = 0;
    for (const b of bookingsLastMonth) {
      const overlapStart =
        b.checkIn < startOfLastMonth ? startOfLastMonth : b.checkIn;
      const overlapEnd =
        b.checkOut > endOfLastMonth ? endOfLastMonth : b.checkOut;
      const diffTime = Math.max(
        0,
        overlapEnd.getTime() - overlapStart.getTime(),
      );
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      bookedNightsLastMonth += diffDays;
    }
    const daysInLastMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
    ).getDate();
    const totalAvailableRoomNightsLastMonth = totalRoomsCount * daysInLastMonth;
    const occupancyRateLastMonth =
      totalAvailableRoomNightsLastMonth > 0
        ? (bookedNightsLastMonth / totalAvailableRoomNightsLastMonth) * 100
        : 0;

    const occupancyRateChangePercent =
      occupancyRateThisMonth - occupancyRateLastMonth;

    // Average rating and review count
    const ratingAgg = await this.prisma.reviews.aggregate({
      _avg: { rating: true },
      _count: { id: true },
      where: { isDeleted: false },
    });
    const averageRating = Number(ratingAgg._avg.rating ?? 0);
    const totalReviews = ratingAgg._count.id;

    // 2. Today's operations
    const checkInsToday = await this.prisma.bookings.count({
      where: {
        checkIn: { gte: todayStart, lte: todayEnd },
        status: { in: ['CONFIRMED', 'CHECKED_IN'] },
        isDeleted: false,
      },
    });

    const checkOutsToday = await this.prisma.bookings.count({
      where: {
        checkOut: { gte: todayStart, lte: todayEnd },
        status: { in: ['CHECKED_IN', 'CHECKED_OUT'] },
        isDeleted: false,
      },
    });

    const newBookingsToday = await this.prisma.bookings.count({
      where: {
        createdAt: { gte: todayStart, lte: todayEnd },
        isDeleted: false,
      },
    });

    const currentlyStaying = await this.prisma.bookings.count({
      where: {
        status: 'CHECKED_IN',
        isDeleted: false,
      },
    });

    // 3. Urgent actions
    const pendingConfirmationCount = await this.prisma.bookings.count({
      where: { status: 'PENDING', isDeleted: false },
    });

    const waitingRefundCount = await this.prisma.bookings.count({
      where: { status: 'WAITING_REFUND', isDeleted: false },
    });

    const partiallyPaidCount = await this.prisma.bookings.count({
      where: { status: 'PARTIALLY_PAID', isDeleted: false },
    });

    // 4. Booking status breakdown
    const statusBreakdownRaw = await this.prisma.bookings.groupBy({
      by: ['status'],
      _count: { _all: true },
      where: { isDeleted: false },
    });

    const statusBreakdown = statusBreakdownRaw.map((b) => ({
      status: b.status,
      count: b._count._all,
    }));

    // 5. Province distribution (location_provinces mapping)
    const bookingsByProvince = await this.prisma.bookings.findMany({
      where: {
        isDeleted: false,
        status: { in: ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'] },
      },
      select: {
        totalPrice: true,
        rooms: {
          select: {
            location_provinces: {
              select: { name: true },
            },
          },
        },
      },
    });

    const provinceMap = new Map<
      string,
      { bookings: number; revenue: number }
    >();
    for (const b of bookingsByProvince) {
      const provinceName = b.rooms?.location_provinces?.name ?? 'Khác';
      const current = provinceMap.get(provinceName) || {
        bookings: 0,
        revenue: 0,
      };
      current.bookings++;
      current.revenue += Number(b.totalPrice);
      provinceMap.set(provinceName, current);
    }

    const provinceDistribution = Array.from(provinceMap.entries())
      .map(([name, data]) => ({
        provinceName: name,
        bookings: data.bookings,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // 6. Top Homestays
    const topRoomsRaw = await this.prisma.bookings.groupBy({
      by: ['roomId'],
      _count: { roomId: true },
      _sum: { totalPrice: true },
      where: {
        isDeleted: false,
        status: { in: ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'] },
      },
      orderBy: [{ _count: { roomId: 'desc' } }],
      take: 5,
    });

    const topRoomIds = topRoomsRaw.map((g) => g.roomId);
    const topRoomsDetails = await this.prisma.rooms.findMany({
      where: { id: { in: topRoomIds } },
      select: {
        id: true,
        name: true,
        rating: true,
        room_images: {
          where: { isMain: true },
          select: { imageUrl: true },
          take: 1,
        },
      },
    });

    const topRoomsMap = new Map(topRoomsDetails.map((r) => [r.id, r]));
    const topRooms = topRoomsRaw
      .map((g) => {
        const roomData = topRoomsMap.get(g.roomId);
        return {
          roomId: g.roomId,
          roomName: roomData?.name ?? 'N/A',
          rating: Number(roomData?.rating ?? 0),
          imageUrl: roomData?.room_images?.[0]?.imageUrl ?? null,
          bookings: g._count.roomId,
          revenue: Number(g._sum?.totalPrice ?? 0),
        };
      })
      .sort((a, b) => b.revenue - a.revenue);

    // 7. Recent bookings
    const recentBookingsRaw = await this.prisma.bookings.findMany({
      where: { isDeleted: false },
      include: {
        users: { select: { firstName: true, lastName: true, avatar: true } },
        rooms: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const recentBookings = recentBookingsRaw.map((b) => ({
      id: b.id,
      userName: `${b.users?.firstName ?? ''} ${b.users?.lastName ?? ''}`.trim(),
      userAvatar: b.users?.avatar ?? null,
      roomName: b.rooms?.name ?? 'N/A',
      total: Number(b.totalPrice),
      status: b.status,
      checkIn: b.checkIn,
      checkOut: b.checkOut,
      createdAt: b.createdAt,
    }));

    // 8. Recent reviews
    const recentReviewsRaw = await this.prisma.reviews.findMany({
      where: { isDeleted: false },
      include: {
        users: { select: { firstName: true, lastName: true, avatar: true } },
        bookings: {
          select: {
            rooms: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const recentReviews = recentReviewsRaw.map((r) => ({
      id: r.id,
      userName: `${r.users?.firstName ?? ''} ${r.users?.lastName ?? ''}`.trim(),
      avatar: r.users?.avatar ?? null,
      roomName: r.bookings?.rooms?.name ?? 'N/A',
      rating: Number(r.rating ?? 0),
      comment: r.comment,
      createdAt: r.createdAt,
    }));

    return {
      overviewCards: {
        totalRevenue: thisMonthRevenue,
        revenueChangePercent,
        totalBookings: thisMonthBookings,
        bookingsChangePercent,
        occupancyRate: occupancyRateThisMonth,
        occupancyRateChangePercent,
        averageRating,
        totalReviews,
      },
      todayOperations: {
        checkInsToday,
        checkOutsToday,
        newBookingsToday,
        currentlyStaying,
      },
      pendingActions: {
        pendingConfirmationCount,
        waitingRefundCount,
        partiallyPaidCount,
      },
      bookingStatusBreakdown: statusBreakdown,
      provinceDistribution,
      topRooms,
      recentBookings,
      recentReviews,
    };
  }
}
