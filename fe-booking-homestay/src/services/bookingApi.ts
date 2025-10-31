import api from "./api";

export const create_booking = async (data: {
  roomId: number | string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
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
    return resp.data || {};
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
  reason: string
) => {
  try {
    const resp = await api.patch(`/bookings/${bookingId}/cancel`, { reason });
    return resp.data || {};
  } catch (error) {
    console.error("Get booking detail error:", error);
    throw error;
  }
};

export const pay_with_vnpay = async (
  totalPrice: string | number,
  orderId: number | string
) => {
  try {
    const resp = await api.post("api/create-qr", {
      totalPrice,
      orderId,
    });
    return resp.data || {};
  } catch (error) {
    console.error("vnpay error: ", error);
    throw error;
  }
};

export const verify_vnpay_return = async (query: any) => {
  try {
    const resp = await api.get("/api/payment-return", { params: query });
    return resp.data || {};
  } catch (error) {
    console.error("Verify VNPay return error:", error);
    throw error;
  }
};