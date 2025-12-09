import { Booking } from "@/types/booking";
import { Review } from "@/types/review";
import { CreateUserDto, UpdateUserDto, User } from "@/types/user";
import api from "../api";

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
    return res.data.data as User;
  } catch (error) {
    console.error("Get user by id error:", error);
    throw error;
  }
}

export async function createUser(payload: CreateUserDto) {
  try {
    const res = await api.post("/user/admin/create", payload);
    return res.data.data as User;
  } catch (error) {
    console.error("Create user error:", error);
    throw error;
  }
}

export async function updateUser(id: number, payload: UpdateUserDto) {
  try {
    const res = await api.patch(`/user/admin/update/${id}`, payload);
    return res.data.data as User;
  } catch (error) {
    console.error("Update user error:", error);
    throw error;
  }
}

export async function deleteUser(id: number) {
  try {
    const res = await api.delete(`/user/admin/delete/${id}`);
    return res.data.data as User;
  } catch (error) {
    console.error("Delete user error:", error);
    throw error;
  }
}

export async function uploadUserAvatar(id: number, file: File) {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post(`/user/admin/${id}/avatar-cloudinary`, formData);
    return res.data.data;
  } catch (error) {
    console.error("Upload user avatar error:", error);
    throw error;
  }
}

export async function getBookingUser(id: number): Promise<Booking[]> {
  try {
    const res = await api.get(`/bookings/users/${id}`);
    return res.data.data;
  } catch (error) {
    console.error("Get room by id error:", error);
    throw error;
  }
}

export async function getReviewsUser(id: number): Promise<Review[]> {
  try {
    const res = await api.get(`/review/users/${id}`);
    return res.data.data;
  } catch (error) {
    console.error("Get room by id error:", error);
    throw error;
  }
}
