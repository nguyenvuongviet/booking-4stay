/**
 * Shared utility functions for promotion/coupon formatting.
 * Used by CouponSelector, BlogCouponsWidget, VoucherWallet.
 */

export interface PromotionBase {
  discountType: string;
  discountValue: number;
  maxDiscount?: number | null;
  minOrderValue?: number | null;
  endDate: string;
}

/**
 * Format discount value for display.
 * e.g. "15% (tối đa 150.000đ)" or "50.000đ"
 */
export function formatDiscount(promo: PromotionBase): string {
  if (promo.discountType === "PERCENTAGE") {
    const maxPart = promo.maxDiscount
      ? ` (tối đa ${Number(promo.maxDiscount).toLocaleString("vi-VN")}đ)`
      : "";
    return `${Number(promo.discountValue)}%${maxPart}`;
  }
  return `${Number(promo.discountValue).toLocaleString("vi-VN")}đ`;
}

/**
 * Format discount for compact badge display.
 * e.g. "15%" or "50k"
 */
export function formatDiscountBadge(promo: PromotionBase): string {
  if (promo.discountType === "PERCENTAGE") {
    return `${Number(promo.discountValue)}%`;
  }
  const val = Number(promo.discountValue);
  if (val >= 1000) {
    return `${(val / 1000).toLocaleString("vi-VN")}k`;
  }
  return `${val.toLocaleString("vi-VN")}đ`;
}

/**
 * Format min order value for display.
 * e.g. "Đơn tối thiểu 500k" or "Không yêu cầu tối thiểu"
 */
export function formatMinSpend(promo: PromotionBase): string {
  const minVal = Number(promo.minOrderValue || 0);
  if (minVal === 0) return "Không yêu cầu tối thiểu";
  const formatted =
    minVal >= 1000000
      ? `${(minVal / 1000000).toLocaleString("vi-VN")}M`
      : `${(minVal / 1000).toLocaleString("vi-VN")}k`;
  return `Đơn tối thiểu ${formatted}`;
}

/**
 * Format expiry date with time.
 * e.g. "23:59 31/12/2026"
 */
export function formatExpiryDate(dateStr: string): string {
  const d = new Date(dateStr);
  const pad = (n: number) => (n < 10 ? `0${n}` : n);
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const date = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  return `${time} ${date}`;
}

/**
 * Format date only (Vietnamese locale).
 * e.g. "31/12/2026"
 */
export function formatDateVN(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("vi-VN");
}

/**
 * Calculate estimated discount amount for sorting.
 */
export function getEstimatedDiscount(
  promo: PromotionBase,
  orderTotal: number,
): number {
  if (promo.discountType === "PERCENTAGE") {
    const calculated = (orderTotal * Number(promo.discountValue)) / 100;
    if (promo.maxDiscount) {
      return Math.min(calculated, Number(promo.maxDiscount));
    }
    return calculated;
  }
  return Number(promo.discountValue);
}
