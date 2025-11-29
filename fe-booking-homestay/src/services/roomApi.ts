import api from "./api";

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

export const location = async () => {
  try {
    const resp = await api.get(`/location/provinces/search`);
    return resp.data;
  } catch (error) {
    console.error("list location error: ", error);
    throw error;
  }
};

export const search_location = async (keyword: string) => {
  try {
    if (!keyword.trim()) {
      return { data: { data: [] } };
    }

    const resp = await api.get("/location/provinces/search", {
      params: {
        keyword: keyword.trim(),
      },
    });

    return {
      data: {
        data: Array.isArray(resp.data?.data?.data)
          ? resp.data.data.data
          : resp.data?.data || [],
      },
    };
  } catch (error) {
    console.error("search location error:", error);
    return { data: { data: [] } };
  }
};

export const search_room = async (
  keyword: string,
  adults: number,
  children: number,
  page: number = 1,
  pageSize: number = 6
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
  } catch (error) {
    console.error("Get list room error:", error);
    return { rooms: [], totalPages: 1, total: 0, page };
  }
};

export const room_available = async (
  roomId: number | string,
  checkIn: string,
  checkOut: string
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

export const get_review = async (
  roomId: number | string,
  page = 1,
  pageSize = 3
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

export const sort_price = async ({
  minPrice,
  maxPrice,
  minRating,
  sortBy = "price",
  sortOrder = "desc",
  page = 1,
  pageSize = 6,
}: {
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}) => {
  try {
    const resp = await api.get(`/room/all`, {
      params: {
        minPrice,
        maxPrice,
        minRating,
        sortBy,
        sortOrder,
        page,
        pageSize,
      },
    });
    return resp.data;
  } catch (error) {
    console.error("Check review error:", error);
    throw error;
  }
};
