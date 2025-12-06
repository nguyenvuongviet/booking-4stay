"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { create_booking, pay_with_vnpay } from "@/services/bookingApi";
import { differenceInDays } from "date-fns";

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

export function usePayment(room: any, bookingData: any) {
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
        id = resp.data?.booking?.id;
        if (!id) {
          toast.error("Cannot process payment — bookingId not returned!");
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
      toast.error("Payment failed!");
    }
  };

  const handleDepositLater = async (payload: BookingPayload, bookingId?: number | string) => {
    try {
      if (!bookingId) {
        const resp = await create_booking(payload);
        router.push("/booking");
        toast.success("Reservation saved. Deposit later.");
      }
    } catch (error) {
      console.error("DepositLater error:", error);
      toast.error("DepositLater failed!");
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
