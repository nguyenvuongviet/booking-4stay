import api from "../api";

import { Booking, PaginatedBookings } from "@/types/booking";

export async function getBookings(): Promise<PaginatedBookings> {
  try {
    const res = await api.get("/bookings/admin/all");
    const data = res.data?.data;
    return data as PaginatedBookings;
  } catch (err) {
    console.error("Get Bookings error:", err);
    throw err;
  }
}

export async function getBookingById(id: number): Promise<Booking> {
  try {
    const res = await api.get(`/bookings/${id}`);
    return res.data?.data;
  } catch (err) {
    console.error("Get Detail Booking error:", err);
    throw err;
  }
}
