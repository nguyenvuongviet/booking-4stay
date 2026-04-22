"use client";

import { BookingCard } from "@/app/(pages)/booking/_component/BookingCard";
import Header from "@/_components/Header";
import { useLang } from "@/context/lang-context";
import { Booking } from "@/models/Booking";
import { get_booking, sync_payos_status } from "@/services/bookingApi";
import { CalendarX, Loader2 } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function HistoryBooking() {
  const { t } = useLang();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const statusParam = searchParams.get("status");
  const cancelParam = searchParams.get("cancel");
  const orderCode = searchParams.get("orderCode");
  const successPayos = searchParams.get("success_payos");
  const cancelPayos = searchParams.get("cancel_payos");

  const fetchBookings = async (pageNumber: number) => {
    if (pageNumber === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const res = await get_booking({ page: pageNumber, pageSize: 3, sortOrder: "desc" });
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
    const isSuccess = successPayos === "true" || statusParam === "success" || statusParam === "PAID";
    const isCancel = cancelPayos === "true" || statusParam === "failed" || cancelParam === "true";

    if (isSuccess && orderCode) {
      const verify = async () => {
        const success = await sync_payos_status(orderCode);
        if (success) {
          toast.success(t("payment_success"));
          fetchBookings(1); // Reload
        } else {
          toast.error(t("payment_failed"));
        }
        // clear query params so it doesn't run again on reload
        router.replace("/booking");
      };
      
      toast.promise(verify(), {
        loading: "Đang đồng bộ trạng thái thanh toán...",
        success: "Đồng bộ thành công!",
        error: "Lỗi đồng bộ",
      });
    } else if (isCancel) {
      toast.error(t("payment_failed"));
      router.replace("/booking");
    }
  }, [statusParam, successPayos, cancelPayos, orderCode, cancelParam, router, t]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container max-w-6xl mx-auto py-12 space-y-12 pt-20 px-4 sm:px-6 lg:px-8">
        <h2 className="elegant-heading text-4xl my-6">{t("history_booking")}</h2>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-sm">{t("loading_bookings")}</span>
            </div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
            <CalendarX className="h-12 w-12 mb-4 text-gray-400" />
            <p className="text-lg font-medium">{t("no_bookings")}</p>
            <p className="text-sm text-gray-500 mt-1">{t("no_bookings_desc")}</p>
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
                  <span className="text-sm">{t("loading_more")}</span>
                </div>
              </div>
            )}
            {!hasMore && !loadingMore && bookings.length > 0 && (
              <div className="flex items-center justify-center py-2">
                <div className="text-center text-muted">
                  <p className="text-sm">{t("end_of_results")}</p>
                  <p className="text-xs mt-1">
                    {t("total_found")}: {bookings.length} {t("found")}
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
