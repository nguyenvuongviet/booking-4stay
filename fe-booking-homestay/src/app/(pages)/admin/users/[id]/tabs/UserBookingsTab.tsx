"use client";

import { Badge } from "@/_components/ui/badge";
import { Card } from "@/_components/ui/card";
import { Pagination } from "@/app/(pages)/admin/_components/Pagination";
import {
  getStatusColorClasses,
  translateStatus,
} from "@/constants/booking-status";
import { formatDate } from "@/lib/utils/date";
import { getBookingUser } from "@/services/admin/usersApi";
import { Booking } from "@/types/booking";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export default function UserBookingsTab({
  userId,
  refreshKey,
}: {
  userId: number;
  refreshKey: number;
}) {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const pageSize = 6;
  const [page, setPage] = useState(1);

  async function loadData() {
    try {
      setLoading(true);
      const data = await getBookingUser(userId);
      setBookings(data);
    } catch (err) {
      console.error("Load bookings error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [userId, refreshKey]);

  useEffect(() => setPage(1), [bookings.length]);

  const pageCount = Math.max(1, Math.ceil(bookings.length / pageSize));
  const pagedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return bookings.slice(start, start + pageSize);
  }, [bookings, page]);

  return (
    <Card className="p-4 sm:p-6 rounded-2xl border border-border shadow-xs">
      <h2 className="text-base sm:text-lg font-bold mb-4 border-b border-border pb-3 text-slate-850 dark:text-slate-100">
        Lịch sử đặt phòng
      </h2>

      {loading && (
        <div className="space-y-4 animate-pulse">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="p-4 bg-card rounded-2xl border border-border/80 shadow-2xs flex flex-col gap-3.5"
            >
              {/* Header skeleton */}
              <div className="flex items-center justify-between pb-3 border-b border-dashed border-border/85">
                <div className="flex items-center gap-3">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-28" />
                </div>
                <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-16" />
              </div>

              {/* Body skeleton */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <div className="w-16 h-12 sm:w-20 sm:h-15 bg-slate-200 dark:bg-slate-800 rounded-xl shrink-0" />
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                  </div>
                </div>
                <div className="grid grid-cols-2 md:flex md:items-center md:justify-end gap-4 md:gap-8 flex-1">
                  <div className="space-y-1.5">
                    <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded w-12" />
                    <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-28" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded w-16" />
                    <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-20" />
                  </div>
                </div>
              </div>

              {/* Footer skeleton */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/40">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && bookings.length === 0 && (
        <p className="text-slate-400 dark:text-slate-500 italic text-xs py-2">
          Người dùng này chưa có lượt đặt phòng nào.
        </p>
      )}

      {!loading && bookings.length > 0 && (
        <>
          <div className="space-y-4">
            {pagedItems.map((b) => {
              const isRefund =
                b.status === "REFUNDED" || b.status === "WAITING_REFUND";

              const totalPriceClass = isRefund
                ? "text-red-500 line-through"
                : "text-emerald-600 dark:text-emerald-500";

              return (
                <div
                  key={b.id}
                  className="rounded-2xl border border-border bg-card shadow-2xs hover:shadow-xs hover:border-primary/30 transition-all duration-200 p-4"
                >
                  {/* Card Top */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-dashed border-border/80">
                    <div className="flex items-center gap-3">
                      <h3 className="text-sm sm:text-base font-bold text-slate-850 dark:text-slate-150 leading-tight">
                        Booking #{b.id}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-muted-foreground">
                        Đặt ngày:{" "}
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {formatDate(b.createdAt)}
                        </span>
                      </p>
                    </div>

                    <Badge
                      className={`${getStatusColorClasses(
                        b.status,
                      )} px-2.5 py-0.5 text-xs font-semibold rounded-full border shadow-none`}
                    >
                      {translateStatus(b.status)}
                    </Badge>
                  </div>

                  {/* Card Content */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Room Info */}
                    <div className="flex items-center gap-3.5 min-w-0 md:max-w-xs lg:max-w-md">
                      <Image
                        src={b.room?.images?.main || "/placeholder.png"}
                        alt={b.room?.name ?? "Room"}
                        width={80}
                        height={60}
                        className="w-16 h-12 sm:w-20 sm:h-15 object-cover rounded-xl border border-border shrink-0 shadow-2xs"
                      />

                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                          {b.room?.name ?? "Không rõ tên phòng"}
                        </p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                          ID phòng: {b.room?.id ?? "?"}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Details Grid */}
                    <div className="grid grid-cols-2 md:flex md:items-center md:justify-end gap-4 md:gap-8 flex-1">
                      {/* Checkin / Checkout */}
                      <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                          Vào / Ra
                        </span>
                        <span className="font-semibold text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-0.5">
                          {formatDate(b.checkIn)} → {formatDate(b.checkOut)}
                        </span>
                      </div>

                      {/* Payment Method */}
                      <div className="flex flex-col items-start md:items-center">
                        <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                          Thanh toán
                        </span>
                        <Badge className="mt-1 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400 border border-indigo-200 px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-semibold shadow-none">
                          {b.paymentMethod}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">
                        Tổng tiền:
                      </span>
                      <span
                        className={`text-sm sm:text-base font-extrabold ${totalPriceClass}`}
                      >
                        {b.totalAmount?.toLocaleString()} ₫
                      </span>
                    </div>

                    <Link
                      href={`/admin/bookings/${b.id}`}
                      className="text-primary hover:text-primary/80 text-xs sm:text-sm font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span className="hidden sm:inline">Xem chi tiết</span>
                      <span className="sm:hidden">Chi tiết</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-6 border-t border-border mt-6">
            <Pagination
              page={page}
              pageCount={pageCount}
              onPageChange={setPage}
            />
          </div>
        </>
      )}
    </Card>
  );
}
