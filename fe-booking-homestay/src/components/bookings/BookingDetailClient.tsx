"use client";

import { BookingDetail } from "@/components/bookings/BookingDetail";
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
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await get_booking_detail(bookingId);
        console.log("Booking detail API response:", res);

        const data = res.data?.booking[0];
        if (!data) throw new Error("Không tìm thấy thông tin đặt phòng.");
        setBooking(data);
      } catch (err: any) {
        console.error("Fetch booking error:", err);
        setError(err.message || "Đã xảy ra lỗi khi tải thông tin đặt phòng.");
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        Đang tải thông tin đặt phòng...
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
          Quay lại danh sách
        </button>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-500">
        Không có dữ liệu đặt phòng.
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
            <span className="elegant-sans">Back</span>
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl elegant-heading mb-6">
          Booking Details
        </h1>
        <BookingDetail booking={booking} />
      </div>
    </div>
  );
}
