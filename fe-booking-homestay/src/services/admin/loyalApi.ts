import { LoyaltyLevel } from "@/types/loyal";
import api from "../api";

export async function getAllLevels(): Promise<LoyaltyLevel[]> {
  try {
    const res = await api.get("/loyalty/levels");

    const list = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
    return list as LoyaltyLevel[];
  } catch (error) {
    console.error("Get list users error:", error);
    throw error;
  }
}
