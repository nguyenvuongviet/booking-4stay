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

export async function refundBooking(
  bookingId: number,
  amount: number,
  reason?: string,
) {
  try {
    const res = await api.patch(`/bookings/${bookingId}/refund`, {
      refundAmount: amount,
    });
    return res.data?.data;
  } catch (err) {
    console.error("Refund Booking error:", err);
    throw err;
  }
}

export async function cancelBooking(id: number, reason: string) {
  try {
    const res = await api.patch(`/bookings/${id}/admin-cancel`, { reason });
    return res.data?.data;
  } catch (err) {
    console.error("Cancel Booking error:", err);
    throw err;
  }
}

// ──────────────────────────────────────────
// Manual Booking (Offline)
// ──────────────────────────────────────────

export interface ManualBookingPayload {
  roomId: number;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  guestFullName: string;
  guestEmail?: string;
  guestPhoneNumber: string;
  specialRequest?: string;
  paymentMethod: "CASH" | "BANK_TRANSFER";
  paidAmount: number;
  note?: string;
  createAccount?: boolean;
}

export async function createManualBooking(payload: ManualBookingPayload) {
  try {
    const res = await api.post("/bookings/admin/manual", payload);
    return res.data?.data;
  } catch (err) {
    console.error("Create Manual Booking error:", err);
    throw err;
  }
}

// ──────────────────────────────────────────
// Admin Force Cancel (Override hoàn tiền)
// ──────────────────────────────────────────

export async function adminForceCancel(
  id: number,
  reason: string,
  overrideRefundAmount?: number,
) {
  try {
    const body: Record<string, unknown> = { reason };
    if (overrideRefundAmount !== undefined) {
      body.overrideRefundAmount = overrideRefundAmount;
    }
    const res = await api.patch(`/bookings/${id}/admin-cancel`, body);
    return res.data?.data;
  } catch (err) {
    console.error("Admin Force Cancel error:", err);
    throw err;
  }
}

// ──────────────────────────────────────────
// Cancel Preview (Smart Cancel)
// ──────────────────────────────────────────

export interface CancelPreviewResult {
  bookingId: number;
  guestName: string;
  checkIn: string;
  checkOut: string;
  roomName: string;
  totalPrice: number;
  paidAmount: number;
  daysUntilCheckIn: number;
  appliedRefundPercent: number;
  suggestedRefundAmount: number;
  suggestedCancellationFee: number;
  cancellationPolicy: { daysBefore: number; refundPercent: number }[];
}

export async function getCancelPreview(
  id: number,
): Promise<CancelPreviewResult> {
  try {
    const res = await api.get(`/bookings/${id}/cancel-preview`);
    return res.data?.data;
  } catch (err) {
    console.error("Cancel Preview error:", err);
    throw err;
  }
}

// ──────────────────────────────────────────
// Confirm Refund Difference
// ──────────────────────────────────────────

export async function confirmRefundDifference(id: number) {
  try {
    const res = await api.patch(`/bookings/${id}/confirm-refund-difference`);
    return res.data?.data;
  } catch (err) {
    console.error("Confirm Refund Difference error:", err);
    throw err;
  }
}
