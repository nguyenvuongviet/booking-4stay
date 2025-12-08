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
  year?: number
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

export const getBookingStatusSummary = async (): Promise<
  BookingStatusSummary[]
> => {
  try {
    const resp = await api.get("/admin/dashboard/bookings/status");
    return resp.data.data;
  } catch (error) {
    console.error("GetBookingStatusSummary Error:", error);
    throw error;
  }
};

export const getRecentDashboardBookings = async (
  limit = 5
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
  limit = 5
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
