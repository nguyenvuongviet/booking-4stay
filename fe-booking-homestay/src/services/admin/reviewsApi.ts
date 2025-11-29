import api from "../api";

import { Review } from "@/types/review";

export async function getReviews(): Promise<Review[]> {
  try {
    const res = await api.get("/review/admin/all");
    return res.data.data.items;
  } catch (error) {
    console.error("Get reviews error:", error);
    throw error;
  }
}

export async function deleteReview(id: number) {
  try {
    const res = await api.delete(`/review/admin/${id}`);
    return res.data.data;
  } catch (error) {
    console.error("Delete review error:", error);
    throw error;
  }
}
