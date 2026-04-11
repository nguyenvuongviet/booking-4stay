"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { create_booking, pay_with_vnpay } from "@/services/bookingApi";
import { differenceInDays, format } from "date-fns";
import { room_preview } from "@/services/roomApi";

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
  paymentMethod: "VNPAY" | "CASH";
};

export function usePayment(room: any, bookingData: any, roomAvailable?: boolean) {
  const router = useRouter();
  const [modalType, setModalType] = useState<"VNPAY" | "CASH" | null>(null);
  const [openPopupPayment, setOpenPopupPayment] = useState(false);

  //  mở modal theo phương thức thanh toán 
  const handleConfirmBooking = (paymentMethod: "VNPAY" | "CASH") => {
    setModalType(paymentMethod);
    setOpenPopupPayment(true);
  };

  const totalNights = differenceInDays(
    new Date(bookingData.checkOut),
    new Date(bookingData.checkIn)
  );

  const handleDepositNow = async (payload: BookingPayload, bookingId?: number | string) => {
    try {

      let id = bookingId;
      if (!id) {
        const resp = await create_booking(payload);
        toast.success("Đã tạo đặt phòng. Đang chuyển hướng đến trang thanh toán...");
        id = resp.data?.booking?.id;
        if (!id) {
          toast.error("Không thể tạo đặt phòng. Vui lòng thử lại.");
          return;
        }
        console.log("id: ", id);
      }
      const amount = payload.paymentMethod === "VNPAY"
        ? room.price * totalNights
        : room.price * totalNights * 0.3; // CASH => cọc 30%

      const payment = await pay_with_vnpay(amount, id);
      window.location.href = payment.url;
      setTimeout(() => router.push("/booking"), 3000);

    } catch (error) {
      console.error("Payment error:", error);
      if (error == 500)
        toast.error("Kết nối mạng đang bị gián đoạn, vui lòng thử lại sau!");

      toast.error("Hết phòng, vui lòng chọn phòng khác!");
    }
  };

  const handleDepositLater = async (payload: BookingPayload, bookingId?: number | string) => {
    try {
      

      if (!bookingId) {
        const resp = await create_booking(payload);
        router.push("/booking");
        toast.success("Đặt phòng đã được lưu. Thanh toán sau.");
      }
    } catch (error) {
      console.error("DepositLater error:", error);
      if (error == 500)
        toast.error("Kết nối mạng đang bị gián đoạn, vui lòng thử lại sau!");

      toast.error("Hết phòng, vui lòng chọn phòng khác!");
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
