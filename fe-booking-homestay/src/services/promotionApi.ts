import api from "./api";

// ==================== USER-FACING ====================

/**
 * Validate mã coupon trước khi checkout.
 */
export const validate_coupon = async (
  code: string,
  total: number,
  provinceId?: number,
) => {
  try {
    const resp = await api.get("/promotions/validate", {
      params: { code, total, provinceId },
    });
    return resp.data?.data || {};
  } catch (error) {
    console.error("Validate coupon error:", error);
    throw error;
  }
};

/**
 * Gợi ý coupon phù hợp cho checkout.
 */
export const get_coupon_suggestions = async (
  provinceId?: number,
  total?: number,
) => {
  try {
    const resp = await api.get("/promotions/suggestions", {
      params: { provinceId, total },
    });
    return resp.data?.data || [];
  } catch (error) {
    console.error("Get suggestions error:", error);
    return [];
  }
};

/**
 * Lưu coupon vào ví.
 */
export const collect_coupon = async (promotionId: number) => {
  try {
    const resp = await api.post(`/promotions/collect/${promotionId}`);
    return resp.data || {};
  } catch (error) {
    console.error("Collect coupon error:", error);
    throw error;
  }
};

/**
 * Lấy ví voucher của user.
 */
export const get_voucher_wallet = async (status?: string) => {
  try {
    const resp = await api.get("/promotions/wallet", {
      params: { status },
    });
    return resp.data?.data || [];
  } catch (error) {
    console.error("Get wallet error:", error);
    return [];
  }
};

/**
 * Lấy coupons gắn trong bài blog.
 */
export const get_blog_coupons = async (postId: number) => {
  try {
    const resp = await api.get(`/promotions/blog/${postId}`);
    return resp.data?.data || [];
  } catch (error) {
    console.error("Get blog coupons error:", error);
    return [];
  }
};
