import api from "./api";

export interface PopularRoom {
  id: number;
  name: string;
  description?: string;
  price: number;
  adultCapacity: number;
  childCapacity?: number;
  location: {
    fullAddress?: string;
    province?: string;
    latitude?: number;
    longitude?: number;
  };
  rating: number;
  reviewCount: number;
  images?: { main: string; gallery: any[] };
  amenities?: any[];
  popularity?: {
    score: number;
    bookingCount30d: number;
    avgRating: number;
    reviewCount: number;
    recentCancelCount: number;
  };
  badges?: string[];
}

/**
 * Lấy phòng phổ biến (sắp xếp theo popularity score).
 */
export const getPopularRooms = async (limit = 12): Promise<PopularRoom[]> => {
  try {
    const resp = await api.get("/recommendation/popular", {
      params: { limit },
    });
    return resp.data?.data?.items || resp.data?.items || [];
  } catch (err) {
    console.error("Get popular rooms error:", err);
    return [];
  }
};

/**
 * Lấy phòng đang trống trong N ngày tới.
 */
export const getAvailableSoonRooms = async (
  days = 7,
  limit = 8,
): Promise<any[]> => {
  try {
    const resp = await api.get("/recommendation/available-soon", {
      params: { days, limit },
    });
    return resp.data?.data?.items || resp.data?.items || [];
  } catch (err) {
    console.error("Get available soon rooms error:", err);
    return [];
  }
};

/**
 * Gợi ý phòng cá nhân hóa "For You" (cần đăng nhập).
 * Fallback về popularity nếu chưa có booking history.
 */
export const getForYouRooms = async (limit = 12): Promise<any[]> => {
  try {
    const resp = await api.get("/recommendation/for-you", {
      params: { limit },
    });
    return resp.data?.data?.items || resp.data?.items || [];
  } catch (err) {
    console.error("Get for-you rooms error:", err);
    return [];
  }
};

/**
 * Phòng tương tự (không cần đăng nhập).
 */
export const getSimilarRooms = async (
  roomId: number,
  limit = 6,
): Promise<any[]> => {
  try {
    const resp = await api.get(`/recommendation/similar/${roomId}`, {
      params: { limit },
    });
    return resp.data?.data?.items || resp.data?.items || [];
  } catch (err) {
    console.error("Get similar rooms error:", err);
    return [];
  }
};
