import api from "./api";

export const room_all = async (params?: any) => {
  try {
    const resp = await api.get("/room/all", { params });
    const mainData = resp.data?.data || {};
    return {
      rooms: Array.isArray(mainData.data) ? mainData.data : [],
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
    const resp = await api.get(`/location/all`);
    return resp.data;
  } catch (error) {
    console.error("list location error: ", error);
    throw error;
  }
};

export const search_location = async (keyword: string) => {
  try {
    //keyword rỗng thì không gọi API
    if (!keyword.trim()) {
      return { data: { data: [] } };
    }

    const resp = await api.get("/location/search", {
      params: {
        search: keyword.trim(),
        page: 1,
        pageSize: 6,
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
  children: number
) => {
  try {
    const resp = await api.get("/room/all", {
      params: {
        search: keyword,
        adults,
        children,
        page: 1,
        pageSize: 6,
      },
    });
    return resp.data;
  } catch (error) {
    console.error("Get list room error:", error);
    throw error;
  }
};

