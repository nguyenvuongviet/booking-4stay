"use client";
import { create_booking, create_payos_link } from "@/services/bookingApi";
import { PaymentMethod } from "@/types/paymentmethod";
import { differenceInDays } from "date-fns";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

type BookingPayload = {
  roomId: string | number;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  guestFullName: string;
  guestEmail: string;
  guestPhoneNumber: string;
  specialRequest?: string;
  paymentMethod: PaymentMethod;
  policyUpdatedAt?: string;
};

export function usePayment(
  room: any,
  bookingData: any,
  roomAvailable?: boolean,
) {
  const router = useRouter();
  const [modalType, setModalType] = useState<"BANK_TRANSFER" | "CASH" | null>(
    null,
  );
  const [openPopupPayment, setOpenPopupPayment] = useState(false);

  //  mở modal theo phương thức thanh toán
  const handleConfirmBooking = (paymentMethod: "BANK_TRANSFER" | "CASH") => {
    setModalType(paymentMethod);
    setOpenPopupPayment(true);
  };

  const totalNights = differenceInDays(
    new Date(bookingData.checkOut),
    new Date(bookingData.checkIn),
  );

  const handleDepositNow = async (
    payload: BookingPayload,
    bookingId?: number | string,
  ) => {
    try {
      let id = bookingId;
      if (!id) {
        const resp = await create_booking(payload);
        toast.success(
          "Đã tạo đặt phòng. Đang chuyển hướng đến trang thanh toán...",
        );
        id = resp.data?.booking?.id;
        if (!id) {
          toast.error("Không thể tạo đặt phòng. Vui lòng thử lại.");
          return;
        }
        console.log("id: ", id);
      }
      let amountToPay = 0;
      if (payload.paymentMethod === "BANK_TRANSFER") {
        amountToPay = room.price * totalNights;
      } else if (payload.paymentMethod === "CASH") {
        amountToPay = Math.round(room.price * totalNights * 0.3); // 30% deposit
      }

      toast.success("Đang tạo mã thanh toán PayOS...");
      const { url } = await create_payos_link(id, amountToPay);
      console.log("url: ", url);
      if (url) {
        window.location.href = url;
      } else {
        toast.error("Không thể lấy link PayOS");
      }
      return;
    } catch (error: any) {
      console.error("Payment error:", error);
      const status = error?.response?.status;
      const message = error?.response?.data?.message;

      if (status === 409) {
        toast.error(message || "Chính sách huỷ phòng vừa được cập nhật, vui lòng kiểm tra lại.");
      } else if (status === 500) {
        toast.error("Kết nối mạng đang bị gián đoạn, vui lòng thử lại sau!");
      } else {
        toast.error(message || "Không thể tạo đặt phòng. Vui lòng thử lại!");
      }
      throw error;
    }
  };

  const handleDepositLater = async (
    payload: BookingPayload,
    bookingId?: number | string,
  ) => {
    try {
      if (!bookingId) {
        const resp = await create_booking(payload);
        router.push("/booking");
        toast.success("Đặt phòng đã được lưu. Thanh toán sau.");
      }
    } catch (error: any) {
      console.error("DepositLater error:", error);
      const status = error?.response?.status;
      const message = error?.response?.data?.message;

      if (status === 409) {
        toast.error(message || "Chính sách huỷ phòng vừa có thay đổi, vui lòng tải lại!");
      } else if (status === 500) {
        toast.error("Kết nối mạng đang bị gián đoạn, vui lòng thử lại sau!");
      } else {
        toast.error(message || "Không thể lưu đơn đặt phòng. Vui lòng thử lại!");
      }
      throw error;
    }
  };

  return {
    modalType,
    openPopupPayment,
    setOpenPopupPayment,
    handleConfirmBooking,
    handleDepositNow,
    handleDepositLater,
  };
}
