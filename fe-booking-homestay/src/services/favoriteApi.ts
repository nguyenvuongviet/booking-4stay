import api from "./api";

/**
 * Toggle yêu thích phòng (thêm/bỏ).
 */
export const toggleFavorite = async (roomId: number) => {
  const resp = await api.post(`/favorites/${roomId}`);
  return resp.data?.data || resp.data || {};
};

/**
 * Lấy danh sách phòng yêu thích (có phân trang).
 */
export const getFavorites = async (page = 1, pageSize = 12) => {
  const resp = await api.get("/favorites", { params: { page, pageSize } });
  const data = resp.data?.data || {};
  return {
    items: Array.isArray(data.items) ? data.items : [],
    total: data.total || 0,
    page: data.page || page,
    pageSize: data.pageSize || pageSize,
  };
};

/**
 * Kiểm tra 1 phòng đã yêu thích chưa.
 */
export const checkFavorite = async (roomId: number) => {
  const resp = await api.get(`/favorites/check/${roomId}`);
  return resp.data?.data || { isFavorited: false };
};

/**
 * Kiểm tra hàng loạt phòng đã yêu thích chưa.
 * Trả về { favoriteMap: { [roomId]: boolean } }
 */
export const checkBulkFavorites = async (roomIds: number[]) => {
  if (!roomIds.length) return { favoriteMap: {} };
  const resp = await api.get("/favorites/check-bulk", {
    params: { roomIds: roomIds.join(",") },
  });
  return resp.data?.data || { favoriteMap: {} };
};
