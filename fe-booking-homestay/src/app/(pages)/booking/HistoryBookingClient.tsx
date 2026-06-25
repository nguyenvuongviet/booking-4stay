"use client";

import Header from "@/_components/Header";
import { Button } from "@/_components/ui/button";
import { BookingCard } from "@/app/(pages)/booking/_component/BookingCard";
import { useLang } from "@/context/lang-context";
import { Booking } from "@/models/Booking";
import { get_booking, sync_payos_status } from "@/services/bookingApi";
import { CalendarX, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
      const res = await get_booking({
        page: pageNumber,
        pageSize: 3,
        sortOrder: "desc",
      });
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
      if (scrollTop + clientHeight >= scrollHeight - 10) {
        setPage((prev) => prev + 1);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, loadingMore, hasMore]);

  useEffect(() => {
    const isSuccess =
      successPayos === "true" ||
      statusParam === "success" ||
      statusParam === "PAID";
    const isCancel =
      cancelPayos === "true" ||
      statusParam === "failed" ||
      cancelParam === "true";

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
  }, [
    statusParam,
    successPayos,
    cancelPayos,
    orderCode,
    cancelParam,
    router,
    t,
  ]);

  return (
    <div className="min-h-screen bg-background dark:bg-black">
      <Header />
      <div className="max-w-5xl mx-auto py-24 px-6">
        {/* Breadcrumb/Header */}
        <div className="mb-12 space-y-2">
          <h1 className="elegant-heading text-3xl tracking-tighter text-foreground">
            Chuyến đi của bạn
          </h1>
          <p className="text-muted-foreground text-sm elegant-subheading">
            Xem lại tất cả các hành trình bạn đã trải nghiệm cùng 4STAY.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm font-bold text-muted-foreground animate-pulse uppercase tracking-widest">
              Đang tải dữ liệu...
            </p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="relative flex flex-col items-center justify-center p-20 text-center">
            <CalendarX className="absolute h-80 w-80 text-muted/10 z-0" />
            <div className="relative z-10 flex flex-col items-center gap-3">
              <h2 className="text-xl font-bold text-foreground">
                {t("no_booking")}
              </h2>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                Hãy bắt đầu khám phá ngay!
              </p>
              <Link href="/room">
                <Button
                  variant="secondary"
                  className="mt-6 rounded-full px-8 py-6 shadow-lg shadow-primary/20 backdrop-blur-2xl"
                >
                  Khám phá ngay
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            <div className="grid grid-cols-1 gap-8">
              {bookings.map((booking, index) => (
                <BookingCard key={`${booking.id}-${index}`} booking={booking} />
              ))}
            </div>

            {loadingMore && (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            {!hasMore && !loadingMore && bookings.length > 0 && (
              <div className="flex items-center justify-center py-2">
                <div className="text-center text-muted">
                  <p className="text-xs text-muted-foreground tracking-widest">
                    Đã hiển thị tất cả · {bookings.length} chuyến đi
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
