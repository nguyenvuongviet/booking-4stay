import api from "../api";

// ==================== ADMIN PROMOTION API ====================

/**
 * Danh sách promotions (Admin).
 */
export const get_admin_promotions = async (params?: any) => {
  try {
    const resp = await api.get("/admin/promotions", { params });
    return resp.data?.data || {};
  } catch (error) {
    console.error("Get admin promotions error:", error);
    throw error;
  }
};

/**
 * Chi tiết promotion (Admin).
 */
export const get_admin_promotion = async (id: number) => {
  try {
    const resp = await api.get(`/admin/promotions/${id}`);
    return resp.data?.data || {};
  } catch (error) {
    console.error("Get admin promotion error:", error);
    throw error;
  }
};

/**
 * Tạo mới promotion (Admin).
 */
export const create_admin_promotion = async (data: any) => {
  try {
    const resp = await api.post("/admin/promotions", data);
    return resp.data || {};
  } catch (error) {
    console.error("Create promotion error:", error);
    throw error;
  }
};

/**
 * Cập nhật promotion (Admin).
 */
export const update_admin_promotion = async (id: number, data: any) => {
  try {
    const resp = await api.patch(`/admin/promotions/${id}`, data);
    return resp.data || {};
  } catch (error) {
    console.error("Update promotion error:", error);
    throw error;
  }
};

/**
 * Bật/tắt promotion (Admin).
 */
export const toggle_admin_promotion = async (id: number) => {
  try {
    const resp = await api.patch(`/admin/promotions/${id}/toggle`);
    return resp.data || {};
  } catch (error) {
    console.error("Toggle promotion error:", error);
    throw error;
  }
};

/**
 * Xoá promotion (Admin).
 */
export const delete_admin_promotion = async (id: number) => {
  try {
    const resp = await api.delete(`/admin/promotions/${id}`);
    return resp.data || {};
  } catch (error) {
    console.error("Delete promotion error:", error);
    throw error;
  }
};

/**
 * Thống kê promotion (Admin Dashboard).
 */
export const get_admin_promotion_stats = async () => {
  try {
    const resp = await api.get("/admin/promotions/statistics");
    return resp.data?.data || {};
  } catch (error) {
    console.error("Get promotion stats error:", error);
    return {};
  }
};
