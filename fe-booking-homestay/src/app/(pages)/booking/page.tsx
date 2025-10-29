"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { Hotel } from "@/models/Hotel";
import { useState, useCallback, useEffect, useRef } from "react";
import { Loader2, Star, MapPin } from "lucide-react";
import { get } from "http";
import { get_booking, get_booking_detail } from "@/services/bookingApi";
import { Room } from "@/models/Room";
import { BookingCard } from "@/components/bookings/BookingCard";
import { Booking } from "@/models/Booking";

export default function HistoryBooking() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [scrolled, setScrolled] = useState(false);

  const hasFetchedOnce = useRef(false);

  const fetchBookings = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const res = await get_booking({ page, pageSize: 6 });
      console.log("Booking API response:", res);

      const items: Booking[] = res?.data?.items || [];
      if (!Array.isArray(items) || items.length === 0) {
        setHasMore(false);
        return;
      }

      setBookings((prev) => [...prev, ...items]);
      if (items.length < 6) setHasMore(false);
      setPage((prev) => prev + 1);
    } catch (err) {
      console.error("Fetch booking history error:", err);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page]);

  useEffect(() => {
    // 🛑 Chặn gọi lần 2 trong Strict Mode
    if (hasFetchedOnce.current) return;
    hasFetchedOnce.current = true;

    fetchBookings();

    const handleScroll = () => {
      if (loading || !hasMore) return;

      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;

      // Cách đáy 200px thì load thêm
      if (scrollTop + clientHeight >= scrollHeight - 200) {
        fetchBookings();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [fetchBookings, loading, hasMore]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container max-w-6xl mx-auto py-12 space-y-12 pt-20 px-4 sm:px-6 lg:px-8">
        <h2 className="elegant-heading text-3xl">History booking</h2>
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
