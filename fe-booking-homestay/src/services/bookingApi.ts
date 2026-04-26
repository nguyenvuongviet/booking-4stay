import api from "./api";

export const create_booking = async (data: {
  roomId: number | string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  guestFullName: string;
  guestEmail: string;
  guestPhoneNumber: string;
  specialRequest?: string;
  paymentMethod: string;
  policyUpdatedAt?: string;
}) => {
  try {
    const resp = await api.post("/bookings", data);
    return resp.data || {};
  } catch (error) {
    console.error("Create booking error:", error);
    throw error;
  }
};

export const get_booking = async (params?: any) => {
  try {
    const resp = await api.get(`/bookings/me`, { params });
    const mainData = resp.data?.data || {};

    return {
      bookings: Array.isArray(mainData.items) ? mainData.items : [],
      total: mainData.total ?? 0,
      page: mainData.page ?? 1,
      pageSize: mainData.pageSize ?? 6,
    };
  } catch (error) {
    console.error("Get booking detail error:", error);
    throw error;
  }
};

export const get_booking_detail = async (bookingId: number | string) => {
  try {
    const resp = await api.get(`/bookings/${bookingId}`);
    return resp.data || {};
  } catch (error) {
    console.error("Get booking detail error:", error);
    throw error;
  }
};

export const cancel_booking = async (
  bookingId: number | string,
  reason: string,
  bankInfo?: {
    bankName: string;
    bankAccountNumber: string;
    bankAccountName: string;
  },
) => {
  try {
    const resp = await api.patch(`/bookings/${bookingId}/cancel`, {
      reason,
      ...bankInfo,
    });
    return resp.data || {};
  } catch (error) {
    console.error("Cancel booking error:", error);
    throw error;
  }
};

export const create_payos_link = async (
  bookingId: number | string,
  amount: number | string,
) => {
  try {
    const resp = await api.post("/payos/create-link", { bookingId, amount });
    return resp.data.data || {};
  } catch (error) {
    console.error("PayOS error: ", error);
    throw error;
  }
};

export const sync_payos_status = async (orderCode: string | number) => {
  try {
    const resp = await api.get(`/payos/sync-status/${orderCode}`);
    return resp.data.data?.success || false;
  } catch (error) {
    console.error("PayOS Sync error: ", error);
    return false;
  }
};

export const post_review = async (
  bookingId: number | string,
  rating: number,
  comment: string,
) => {
  try {
    const resp = await api.post("/review", {
      bookingId,
      rating,
      comment,
    });
    return resp.data || {};
  } catch (error) {
    console.error("Post review error:", error);
    throw error;
  }
};

export const get_review_bookingId = async (roomId: number | string) => {
  try {
    const resp = await api.get(`/review/room/${roomId}`);
    return resp.data || {};
  } catch (error) {
    console.error("Get reviews by room error:", error);
    throw error;
  }
};

export const get_unavailable_dates = async (
  roomId: number | string,
  excludeBookingId?: number | string,
) => {
  try {
    const resp = await api.get(`/bookings/unavailable-days`, {
      params: { roomId, excludeBookingId },
    });
    return resp.data?.data?.days || []; // trả về mảng ngày
  } catch (error) {
    console.error("Get unavailable dates error:", error);
    throw error;
  }
};
