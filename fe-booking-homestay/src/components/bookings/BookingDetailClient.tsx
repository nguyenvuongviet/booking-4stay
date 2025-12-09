"use client";

import { BookingDetail } from "@/components/bookings/BookingDetail";
import { useLang } from "@/context/lang-context";
import { Booking } from "@/models/Booking";
import { get_booking_detail } from "@/services/bookingApi";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function BookingDetailClient({
  bookingId,
}: {
  bookingId: string;
}) {
  const { t } = useLang();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await get_booking_detail(bookingId);
        console.log("Booking detail API response:", res);

        const data = res.data;
        if (!data) throw new Error(t("booking_not_found"));
        setBooking(data);
      } catch (err: any) {
        console.error("Fetch booking error:", err);
        setError(err.message || t("booking_fetch_error"));
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, t]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        {t("loading_booking")}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => router.push("/booking")}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition"
        >
          {t("back_to_list")}
        </button>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-500">
        {t("no_booking_data")}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-50 mb-8">
        <div className="max-w-7xl mx-auto px-12 py-4">
          <button
            onClick={() => router.push("/booking")}
            className="px-4 flex items-center gap-2 hover:text-primary hover:cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="elegant-sans">{t("back")}</span>
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl elegant-heading mb-6">{t("booking_details")}</h1>
        <BookingDetail booking={booking} />
      </div>
    </div>
  );
}
