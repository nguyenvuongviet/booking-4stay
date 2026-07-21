"use client";

import { BookingDetail } from "@/app/(pages)/booking/_component/BookingDetail";
import { useLang } from "@/context/lang-context";
import { Booking } from "@/models/Booking";
import { get_booking_detail } from "@/services/bookingApi";
import { ChevronLeft } from "lucide-react";
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
        const bookingData = res.data;
        if (!bookingData || !bookingData.id)
          throw new Error(t("booking_not_found"));
        setBooking(bookingData);
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
          onClick={() => router.back()}
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
      <div className="max-w-6xl mx-auto pt-4">
        <div className="sticky top-0 z-30 backdrop-blur-xl bg-background/70 border-b border-border/50">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 h-20 flex items-center gap-4 ">
            {/* Back Button */}
            <button
              onClick={() => router.back()}
              className="cursor-pointer group flex items-center justify-center h-10 w-10 rounded-full hover:bg-primary/10 hover:scale-105 backdrop-blur-xl shadow-sm hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30 transition-all duration-300 hover:-translate-x-1"
            >
              <ChevronLeft className="h-6 w-6 text-muted-foreground group-hover:text-primary duration-300 transition-colors" />
            </button>

            {/* Title */}
            <div className="flex flex-col">
              <h1 className="text-2xl sm:text-3xl elegant-heading text-foreground leading-tight">
                {t("booking_details")}
              </h1>
            </div>
          </div>
        </div>

        <BookingDetail booking={booking} />
      </div>
    </div>
  );
}
