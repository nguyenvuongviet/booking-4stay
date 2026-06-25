"use client";

import { BookingCard } from "@/app/(pages)/booking/_component/BookingCard";
import { useLang } from "@/context/lang-context";
import { Booking } from "@/models/Booking";
import { IUser } from "@/models/User";
import { get_booking } from "@/services/bookingApi";
import { CalendarX, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface Props {
  user: IUser | null;
  isActive: boolean;
}

export default function BookingTab({ user, isActive }: Props) {
  const { t } = useLang();
  const containerRef = useRef<HTMLDivElement>(null);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchBookings = useCallback(async (pageNumber: number) => {
    setLoading(true);
    try {
      // Using pageSize 5 for bookings to keep the page size optimal
      const res = await get_booking({ page: pageNumber, pageSize: 5 });
      setBookings(res.bookings || []);
      setTotalPages(Math.ceil(res.total / 5));
      setTotalCount(res.total || 0);
    } catch (err) {
      console.error("Fetch bookings error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch bookings when active or page changes
  useEffect(() => {
    if (isActive) {
      fetchBookings(page);
    }
  }, [isActive, page, fetchBookings]);

  // Reset page when switching tabs
  useEffect(() => {
    if (!isActive) {
      setPage(1);
    }
  }, [isActive]);

  const handlePageChange = (newPage: number) => {
    if (newPage === page || loading) return;
    setPage(newPage);

    // Smooth scroll to container top with header offset
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      window.scrollTo({
        top: rect.top + scrollTop - 100,
        behavior: "smooth",
      });
    }
  };

  const getPageNumbers = () => {
    const pageNumbers: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (page <= 3) {
        pageNumbers.push(1, 2, 3, 4, "...", totalPages);
      } else if (page >= totalPages - 2) {
        pageNumbers.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        );
      } else {
        pageNumbers.push(1, "...", page - 1, page, page + 1, "...", totalPages);
      }
    }
    return pageNumbers;
  };

  return (
    <div
      ref={containerRef}
      className="bg-white dark:bg-slate-900 p-4 sm:p-6 md:p-8 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-xs animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      <div className="mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl elegant-heading tracking-tight dark:text-white">
          {t("history_booking")}
        </h2>
        <p className="text-slate-500 text-xs md:text-sm mt-1">
          Xem lại các chuyến đi trước đây và sắp tới của bạn.
        </p>
      </div>

      {loading && page === 1 ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-4 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-sm font-medium">{t("loading_bookings")}</span>
          </div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center text-slate-500 bg-slate-50/50 dark:bg-slate-900/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800/80">
          <CalendarX className="h-12 w-12 md:h-16 md:w-16 mb-4 text-slate-300 dark:text-slate-700" />
          <p className="text-lg md:text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">
            {t("no_booking")}
          </p>
          <p className="text-xs md:text-sm max-w-sm text-slate-500">
            {t("no_booking_desc")}
          </p>
        </div>
      ) : (
        <div className="space-y-6 md:space-y-8">
          <div className="grid grid-cols-1 gap-5 md:gap-6 relative">
            {loading && (
              <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 z-10 flex items-center justify-center backdrop-blur-xs rounded-xl">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            {bookings.map((booking, index) => (
              <div
                key={`${booking.id}-${index}`}
                className="transition-all duration-300 hover:-translate-y-0.5"
              >
                <BookingCard booking={booking} />
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100 dark:border-slate-800/80">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium order-2 sm:order-1">
                Hiển thị trang {page} / {totalPages} (tổng số {totalCount} đơn
                đặt phòng)
              </span>

              <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2">
                <button
                  onClick={() => handlePageChange(Math.max(1, page - 1))}
                  disabled={page === 1 || loading}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-650 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Trước</span>
                </button>

                {getPageNumbers().map((num, idx) => {
                  if (num === "...") {
                    return (
                      <span
                        key={`ellipsis-${idx}`}
                        className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-slate-400 text-sm"
                      >
                        &hellip;
                      </span>
                    );
                  }

                  const pageNum = num as number;
                  const isCurrent = pageNum === page;

                  return (
                    <button
                      key={`page-${pageNum}`}
                      onClick={() => handlePageChange(pageNum)}
                      disabled={loading}
                      className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                        isCurrent
                          ? "bg-primary text-primary-foreground shadow-xs shadow-primary/20 scale-105"
                          : "border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() =>
                    handlePageChange(Math.min(totalPages, page + 1))
                  }
                  disabled={page === totalPages || loading}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-650 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 cursor-pointer"
                >
                  <span className="hidden sm:inline">Sau</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
