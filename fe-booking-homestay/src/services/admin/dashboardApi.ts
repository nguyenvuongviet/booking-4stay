import api from "../api";

export interface DashboardStats {
  totalRevenue: number;
  totalBookings: number;
  totalUsers: number;
  totalRooms: number;
}

export interface RevenueByMonth {
  month: string;
  revenue: number;
  bookings: number;
}

export interface BookingStatusSummary extends Record<string, string | number> {
  status: string;
  count: number;
}

export interface RecentBookingItem {
  id: number;
  userName: string;
  roomName: string;
  total: number;
  status: string;
  createdAt: string;
}

export interface PopularRoomItem {
  roomId: number;
  roomName: string;
  bookings: number;
  revenue: number;
}

export interface DashboardSummary {
  overviewCards: {
    totalRevenue: number;
    revenueChangePercent: number;
    totalBookings: number;
    bookingsChangePercent: number;
    occupancyRate: number;
    occupancyRateChangePercent: number;
    averageRating: number;
    totalReviews: number;
  };
  todayOperations: {
    checkInsToday: number;
    checkOutsToday: number;
    newBookingsToday: number;
    currentlyStaying: number;
  };
  pendingActions: {
    pendingConfirmationCount: number;
    waitingRefundCount: number;
    partiallyPaidCount: number;
  };
  bookingStatusBreakdown: { status: string; count: number }[];
  provinceDistribution: {
    provinceName: string;
    bookings: number;
    revenue: number;
  }[];
  topRooms: {
    roomId: number;
    roomName: string;
    rating: number;
    imageUrl: string | null;
    bookings: number;
    revenue: number;
  }[];
  recentBookings: {
    id: number;
    userName: string;
    userAvatar: string | null;
    roomName: string;
    total: number;
    status: string;
    checkIn: string;
    checkOut: string;
    createdAt: string;
  }[];
  recentReviews: {
    id: number;
    userName: string;
    avatar: string | null;
    roomName: string;
    rating: number;
    comment: string;
    createdAt: string;
  }[];
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const resp = await api.get("/admin/dashboard/stats");
    return resp.data.data;
  } catch (error) {
    console.error("GetDashboardStats Error:", error);
    throw error;
  }
};

export const getDashboardRevenue = async (
  year?: number,
): Promise<RevenueByMonth[]> => {
  try {
    const resp = await api.get("/admin/dashboard/revenue", {
      params: { year },
    });
    return resp.data.data;
  } catch (error) {
    console.error("GetDashboardRevenue Error:", error);
    throw error;
  }
};

export const getBookingStatusSummary = async (
  year?: number,
  month?: number,
): Promise<BookingStatusSummary[]> => {
  try {
    const resp = await api.get("/admin/dashboard/bookings-status", {
      params: { year, month },
    });
    return resp.data.data;
  } catch (error) {
    console.error("GetBookingStatusSummary Error:", error);
    throw error;
  }
};

export const getRecentDashboardBookings = async (
  limit = 5,
): Promise<RecentBookingItem[]> => {
  try {
    const resp = await api.get("/admin/dashboard/recent-bookings", {
      params: { limit },
    });
    return resp.data.data;
  } catch (error) {
    console.error("GetRecentDashboardBookings Error:", error);
    throw error;
  }
};

export const getPopularRooms = async (
  limit = 5,
): Promise<PopularRoomItem[]> => {
  try {
    const resp = await api.get("/admin/dashboard/popular-rooms", {
      params: { limit },
    });
    return resp.data.data;
  } catch (error) {
    console.error("GetPopularRooms Error:", error);
    throw error;
  }
};

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  try {
    const resp = await api.get("/admin/dashboard/summary");
    return resp.data.data;
  } catch (error) {
    console.error("GetDashboardSummary Error:", error);
    throw error;
  }
};
