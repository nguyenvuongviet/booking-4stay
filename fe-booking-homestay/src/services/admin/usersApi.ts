import api from "../api";
import type { User } from "@/types/user";

export async function getAllUsers(): Promise<User[]> {
  try {
    const res = await api.get("/user/admin/all");

    const list = Array.isArray(res.data) ? res.data : res.data?.data ?? [];

    return list as User[];
  } catch (error) {
    console.error("Get list users error:", error);
    throw error;
  }
}

export async function getUserById(id: number): Promise<User> {
  try {
    const res = await api.get(`/user/admin/profile/${id}`);
    console.log(res.data.data);

    return res.data.data;
  } catch (error) {
    console.error("Get user by id error:", error);
    throw error;
  }
}
