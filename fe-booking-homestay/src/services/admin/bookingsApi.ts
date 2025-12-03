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

export async function acceptBooking(id: number, paidAmount: number) {
  try {
    const res = await api.patch(`/bookings/${id}/accept`, { paidAmount });
    return res.data?.data;
  } catch (err) {
    console.error("Accept Booking error:", err);
    throw err;
  }
}

export async function rejectBooking(id: number, reason: string) {
  try {
    const res = await api.patch(`/bookings/${id}/reject`, { reason });
    return res.data?.data;
  } catch (err) {
    console.error("Reject Booking error:", err);
    throw err;
  }
}
