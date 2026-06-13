import api from "./api";

export interface LoyaltyLevel {
  id: number;
  name: string;
  minPoints: number;
  discountPercent: number;
  maxDiscountAmount: number;
  description: string;
  isActive: boolean;
}

export const getPublicLoyaltyLevels = async (): Promise<LoyaltyLevel[]> => {
  try {
    const res = await api.get("/loyalty/levels/public");
    return res.data?.data ?? [];
  } catch (error) {
    console.error("API Error: getPublicLoyaltyLevels", error);
    throw error;
  }
};
