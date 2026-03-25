import { PriceStatus } from "../../types/priceStatus";

export const formatPrice = (price?: number) => {
  if (!price) return "";
  if (price >= 1_000_000) {
    return (price / 1_000_000).toFixed(1).replace(".0", "") + "M";
  }
  if (price >= 1_000) {
    return (price / 1_000).toFixed(0) + "k";
  }
  return price.toString();
};

export const getPriceStatus = (
  price?: number,
  defaultPrice?: number
): PriceStatus => {
  if (!price || !defaultPrice) return "normal";
  if (price < defaultPrice) return "low";
  if (price > defaultPrice) return "high";
  return "normal";
};