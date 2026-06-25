"use client";

import {
  createManualBooking,
  ManualBookingPayload,
} from "@/services/admin/bookingsApi";
import { getAllRooms, getRoomCalendar } from "@/services/admin/roomsApi";
import api from "@/services/api";
import { get_unavailable_dates } from "@/services/bookingApi";
import { Room } from "@/types/room";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { useSearchParams } from "next/navigation";

export interface GuestForm {
  fullName: string;
  email: string;
  phone: string;
  specialRequest: string;
}

export function useManualBookingForm() {
  const searchParams = useSearchParams();
  const initialRoomId = searchParams.get("room")
    ? Number(searchParams.get("room"))
    : null;
  const initialDate = searchParams.get("date") || "";
  const endDateParam = searchParams.get("endDate") || initialDate;

  // Bước 1: Chọn ngày trước → lọc phòng trống
  const [checkIn, setCheckIn] = useState(initialDate);
  const [checkOut, setCheckOut] = useState(() => {
    if (endDateParam) {
      return new Date(endDateParam).toISOString().split("T")[0];
    }
    return "";
  });

  const isQuickAction = !!initialRoomId && !!initialDate;

  // Rooms
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(
    initialRoomId,
  );
  const [unavailableDays, setUnavailableDays] = useState<string[]>([]);
  const [loadingDays, setLoadingDays] = useState(false);
  const [roomPriceDates, setRoomPriceDates] = useState<
    { date: string; price: number }[]
  >([]);

  // Guest
  const [guest, setGuest] = useState<GuestForm>({
    fullName: "",
    email: "",
    phone: "",
    specialRequest: "",
  });

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "BANK_TRANSFER">(
    "CASH",
  );
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [note, setNote] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [createAccount, setCreateAccount] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Pricing (from previewBooking API)
  const [pricing, setPricing] = useState<{
    available: boolean;
    rawTotal: number;
    nights: number;
    avgPerNight: number;
    roomName: string;
  } | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(false);

  // Submit
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState<number | null>(null);

  const selectedRoom = useMemo(
    () => rooms.find((r) => r.id === selectedRoomId) || null,
    [rooms, selectedRoomId],
  );

  // Step Validation
  const isStepValid = useMemo(() => {
    if (currentStep === 1) return !!selectedRoomId;
    if (currentStep === 2) return !!checkIn && !!checkOut && pricing?.available;
    if (currentStep === 3) return !!guest.fullName.trim() && !!guest.phone.trim();
    return true; // Step 4 is always valid as it's the final overview
  }, [currentStep, selectedRoomId, checkIn, checkOut, pricing, guest]);

  const nextStep = () => {
    if (isStepValid && currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const goToStep = (step: number) => {
    // Only allow going back or to a step that is valid
    if (step < currentStep) {
      setCurrentStep(step);
      return;
    }
    
    // If going forward, check if intermediate steps are valid
    if (step === 2 && !!selectedRoomId) setCurrentStep(2);
    if (step === 3 && !!selectedRoomId && !!checkIn && !!checkOut && pricing?.available) setCurrentStep(3);
    if (step === 4 && !!selectedRoomId && !!checkIn && !!checkOut && pricing?.available && !!guest.fullName && !!guest.phone) setCurrentStep(4);
  };

  // Load all rooms
  useEffect(() => {
    (async () => {
      try {
        const data = await getAllRooms();
        setRooms(
          (data.items || []).filter((r: Room) => r.status === "AVAILABLE"),
        );
      } finally {
        setLoadingRooms(false);
      }
    })();
  }, []);

  // Load unavailable days & pricing calendar khi chọn phòng
  useEffect(() => {
    if (!selectedRoomId) {
      setUnavailableDays([]);
      setRoomPriceDates([]);
      return;
    }
    (async () => {
      setLoadingDays(true);
      try {
        const [days, calendarData] = await Promise.all([
          get_unavailable_dates(selectedRoomId),
          getRoomCalendar(selectedRoomId),
        ]);
        setUnavailableDays(days);
        setRoomPriceDates(
          calendarData.calendar.map((c) => ({ date: c.date, price: c.price })),
        );
      } catch (err) {
        console.error("Load room data error:", err);
      } finally {
        setLoadingDays(false);
      }
    })();
  }, [selectedRoomId]);

  // Gọi previewBooking khi có đủ room + dates
  useEffect(() => {
    if (!selectedRoomId || !checkIn || !checkOut) {
      setPricing(null);
      return;
    }
    (async () => {
      setLoadingPrice(true);
      try {
        const res = await api.post("/bookings/preview", {
          roomId: selectedRoomId,
          checkIn,
          checkOut,
        });
        const d = res.data?.data;
        if (d) {
          setPricing({
            available: d.available,
            rawTotal: d.priceSummary?.rawTotal || 0,
            nights: d.stayDetails?.nights || 1,
            avgPerNight: d.priceSummary?.averagePricePerNight || 0,
            roomName: d.roomName || "",
          });
        }
      } catch {
        setPricing(null);
      } finally {
        setLoadingPrice(false);
      }
    })();
  }, [selectedRoomId, checkIn, checkOut]);

  const canSubmit = useMemo(() => {
    return (
      !!selectedRoomId &&
      !!checkIn &&
      !!checkOut &&
      !!guest.fullName.trim() &&
      !!guest.phone.trim() &&
      pricing?.available === true &&
      !submitting
    );
  }, [
    selectedRoomId,
    checkIn,
    checkOut,
    guest.fullName,
    guest.phone,
    pricing,
    submitting,
  ]);

  const handleSubmit = useCallback(async () => {
    if (!canSubmit || !selectedRoomId) return;
    setSubmitting(true);
    try {
      const payload: ManualBookingPayload = {
        roomId: selectedRoomId,
        checkIn,
        checkOut,
        adults,
        children,
        guestFullName: guest.fullName,
        guestPhoneNumber: guest.phone,
        paymentMethod,
        paidAmount,
        note: note || undefined,
      };
      if (guest.email.trim()) payload.guestEmail = guest.email;
      if (guest.specialRequest.trim())
        payload.specialRequest = guest.specialRequest;
      if (createAccount) payload.createAccount = true;

      const result = await createManualBooking(payload);
      toast.success("Tạo đơn thủ công thành công!");
      setSuccess(true);
      setCreatedBookingId(result?.booking?.id || null);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Không thể tạo đơn. Vui lòng thử lại.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }, [
    canSubmit,
    selectedRoomId,
    checkIn,
    checkOut,
    adults,
    children,
    guest,
    paymentMethod,
    paidAmount,
    note,
  ]);

  const reset = useCallback(() => {
    setSelectedRoomId(null);
    setCheckIn("");
    setCheckOut("");
    setGuest({ fullName: "", email: "", phone: "", specialRequest: "" });
    setPaymentMethod("CASH");
    setPaidAmount(0);
    setNote("");
    setAdults(1);
    setChildren(0);
    setPricing(null);
    setSuccess(false);
    setCreatedBookingId(null);
    setCreateAccount(false);
  }, []);

  return {
    rooms,
    selectedRoomId,
    setSelectedRoomId,
    selectedRoom,
    loadingRooms,
    checkIn,
    setCheckIn,
    checkOut,
    setCheckOut,
    unavailableDays,
    loadingDays,
    guest,
    setGuest,
    adults,
    setAdults,
    children,
    setChildren,
    paymentMethod,
    setPaymentMethod,
    paidAmount,
    setPaidAmount,
    note,
    setNote,
    pricing,
    loadingPrice,
    canSubmit,
    submitting,
    success,
    createdBookingId,
    handleSubmit,
    reset,
    isQuickAction,
    createAccount,
    setCreateAccount,
    roomPriceDates,
    currentStep,
    setCurrentStep,
    nextStep,
    prevStep,
    isStepValid,
    goToStep,
  };
}
