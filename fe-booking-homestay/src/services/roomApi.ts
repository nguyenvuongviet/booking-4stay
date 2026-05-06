import api from "./api";
export interface RoomQueryParams {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  adults?: number;
  children?: number;
  minRating?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export const room_all = async (params?: any) => {
  try {
    const resp = await api.get("/room/all", { params });
    const mainData = resp.data?.data || {};
    return {
      rooms: Array.isArray(mainData.items) ? mainData.items : [],
      totalPages: mainData.totalPages || 1,
      total: mainData.total || 0,
      page: mainData.page || 1,
    };
    // return resp.data || {};
  } catch (error) {
    console.error("Get list room error:", error);
    throw error;
  }
};

export const room_detail = async (id: number | string) => {
  try {
    const resp = await api.get(`/room/${id}`);
    return resp.data?.data || {};
  } catch (error) {
    console.error("Get room detail error:", error);
    throw error;
  }
};

export const search_room = async (
  keyword: string,
  adults: number,
  children: number,
  page: number = 1,
  pageSize: number = 6,
) => {
  try {
    const resp = await api.get("/room/all", {
      params: { search: keyword, adults, children, page, pageSize },
    });

    const mainData = resp.data?.data || {};
    return {
      rooms: Array.isArray(mainData.items) ? mainData.items : [],
      totalPages: mainData.totalPages || 1,
      total: mainData.total || 0,
      page: mainData.page || page,
    };
  } catch (error: any) {
    if (error.response?.status === 404) {
      return { rooms: [], totalPages: 1, total: 0, page };
    }
    console.error("Get list room error:", error);
    return { rooms: [], totalPages: 1, total: 0, page };
  }
};

export const getRooms = async (params?: RoomQueryParams) => {
  try {
    const resp = await api.get("/room/all", { params });

    const mainData = resp.data?.data || {};

    return {
      rooms: Array.isArray(mainData.items) ? mainData.items : [],
      totalPages: mainData.totalPages || 1,
      total: mainData.total || 0,
      page: mainData.page || params?.page || 1,
    };
  } catch (error: any) {
    if (error.response?.status === 404) {
      return { rooms: [], totalPages: 1, total: 0, page: 1 };
    }

    console.error("Get rooms error:", error);
    throw error;
  }
};

export const room_available = async (
  roomId: number | string,
  checkIn: string,
  checkOut: string,
) => {
  try {
    const resp = await api.get(`bookings/rooms/${roomId}/availability`, {
      params: {
        checkIn,
        checkOut,
      },
    });
    return resp.data?.data || {};
  } catch (error) {
    console.error("Check room available error:", error);
    throw error;
  }
};

export const room_preview = async (
  roomId: number,
  checkIn: string,
  checkOut: string,
) => {
  try {
    const resp = await api.post(`bookings/preview`, {
      roomId,
      checkIn,
      checkOut,
    });
    return resp.data?.data || {};
  } catch (error) {
    console.error("Check room preview error:", error);
    throw error;
  }
};

export const get_review = async (
  roomId: number | string,
  page = 1,
  pageSize = 3,
) => {
  try {
    const resp = await api.get(`review/rooms/${roomId}`, {
      params: { page, pageSize },
    });
    return resp.data;
  } catch (error) {
    console.error("Check review error:", error);
    throw error;
  }
};

export const get_room_calendar = async (
  roomId: number | string,
  month?: number,
  year?: number,
) => {
  try {
    const resp = await api.get(`/room/${roomId}/calendar`, {
      params: { month, year },
    });
    return resp.data?.data || {};
  } catch (error) {
    console.error("Get room calendar error:", error);
    throw error;
  }
};
