"use client";

import { BookingCard } from "@/components/bookings/BookingCard";
import Header from "@/components/Header";
import { Booking } from "@/models/Booking";
import { get_booking } from "@/services/bookingApi";
import { CalendarX, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function HistoryBooking() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const orderId = searchParams.get("orderId");
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchBookings = async (pageNumber: number) => {
    if (pageNumber === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const res = await get_booking({ page: pageNumber, pageSize: 3 });
      const items = res.bookings || [];
      const totalPages = Math.ceil(res.total / 3);

      setBookings((prev) => (pageNumber === 1 ? items : [...prev, ...items]));

      setHasMore(pageNumber < totalPages);
    } catch (err) {
      console.error("Fetch booking history error:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };
  useEffect(() => {
    fetchBookings(page);
  }, [page]);
  useEffect(() => {
    const handleScroll = () => {
      if (loading || loadingMore || !hasMore) return;

      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;

      if (scrollTop + clientHeight >= scrollHeight - 200) {
        setPage((prev) => prev + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, loadingMore, hasMore]);

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

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-sm">Loading your bookings...</span>
            </div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
            <CalendarX className="h-12 w-12 mb-4 text-gray-400" />
            <p className="text-lg font-medium">No bookings yet</p>
            <p className="text-sm text-gray-500 mt-1">
              When you make a booking, it will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {bookings.map((booking, index) => (
              <BookingCard key={`${booking.id}-${index}`} booking={booking} />
            ))}
            {loadingMore && (
              <div className="flex items-center justify-center py-6">
                <div className="flex items-center gap-3 text-muted">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="text-sm">Loading more hotels...</span>
                </div>
              </div>
            )}

            {!hasMore && !loadingMore && bookings.length > 0 && (
              <div className="flex items-center justify-center py-2">
                <div className="text-center text-muted">
                  <p className="text-sm ">
                    You{"'"}ve reached the end of the results
                  </p>
                  <p className="text-xs mt-1">
                    Total: {bookings.length} hotels found
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
