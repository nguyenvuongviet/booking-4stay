"use client";

import { BookingCard } from "@/components/bookings/BookingCard";
import Header from "@/components/Header";
import { Booking } from "@/models/Booking";
import { get_booking } from "@/services/bookingApi";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { all } from "axios";

export default function HistoryBooking() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const hasFetchedOnce = useRef(false);
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const orderId = searchParams.get("orderId");

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await get_booking({ page: 1, pageSize: 9999999999999 });
      console.log("Booking API response:", res);

      const items: Booking[] = res?.data?.items || [];
      setBookings(items || []);
    } catch (err) {
      console.error("Fetch booking history error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    if (status === "success") {
      toast.success(
        `Payment successful! Your booking #${orderId} is confirmed.`
      );
    } else if (status === "failed") {
      toast.error(
        `Payment failed or canceled. Your booking #${orderId} is pending.`
      );
    }
  }, [status, orderId]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container max-w-6xl mx-auto py-12 space-y-12 pt-20 px-4 sm:px-6 lg:px-8">
        <h2 className="elegant-heading text-4xl my-6">History booking</h2>
        <div className="grid grid-cols-1 gap-8 ">
          {bookings.map((booking, index) => (
            <BookingCard key={`${booking.id}-${index}`} booking={booking} />
          ))}
        </div>
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-sm">Loading more hotels...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
