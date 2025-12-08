"use client";

import { Pagination } from "@/app/(pages)/admin/_components/Pagination";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils/date";
import { getBookingUser } from "@/services/admin/usersApi";
import { Booking } from "@/types/booking";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  getStatusColorClasses,
  translateStatus,
} from "../../../_utils/color-utils";

export default function UserReviewsTab({
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
    <Card className="p-6 rounded-xl shadow border border-gray-200">
      <h2 className="text-xl font-semibold mb-4 border-b pb-3 text-gray-800">
        Lịch sử đặt phòng
      </h2>

      {loading && <p>Đang tải dữ liệu...</p>}
      {!loading && bookings.length === 0 && (
        <p className="text-gray-500 italic">Người dùng này chưa có booking.</p>
      )}

      {!loading && bookings.length > 0 && (
        <>
          <div className="space-y-4">
            {pagedItems.map((b) => {
              const isRefund =
                b.status === "REFUNDED" || b.status === "WAITING_REFUND";

              const totalPriceClass = isRefund
                ? "text-red-600 line-through"
                : "text-green-700";

              return (
                <div
                  key={b.id}
                  className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all p-4"
                >
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-dashed border-gray-300">
                    <div className="flex items-center gap-4">
                      <h3 className="text-lg font-bold text-gray-800 leading-tight">
                        Booking #{b.id}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Đặt ngày:{" "}
                        <span className="font-medium">
                          {formatDate(b.createdAt)}
                        </span>
                      </p>
                    </div>

                    <Badge
                      className={`${getStatusColorClasses(
                        b.status
                      )} px-3 py-1 text-sm font-semibold rounded-full`}
                    >
                      {translateStatus(b.status)}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-4 min-w-[220px] shrink-0">
                      <Image
                        src={b.room?.images?.main || "/placeholder.png"}
                        alt={b.room?.name ?? "Room"}
                        width={80}
                        height={60}
                        className="w-20 h-[60px] object-cover rounded-lg border shadow-sm"
                      />

                      <div className="max-w-[150px]">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {b.room?.name ?? "Không rõ tên phòng"}
                        </p>
                        <p className="text-xs text-gray-400">
                          ID phòng: {b.room?.id ?? "?"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col min-w-[150px]">
                      <p className="text-gray-500 font-medium text-xs">
                        VÀO / RA
                      </p>
                      <p className="font-semibold text-gray-800">
                        {formatDate(b.checkIn)} → {formatDate(b.checkOut)}
                      </p>
                    </div>

                    <div className="flex flex-col min-w-[130px]">
                      <p className="text-gray-500 font-medium text-xs">
                        THANH TOÁN
                      </p>

                      <Badge className="mt-1 bg-indigo-100 text-indigo-700 border border-indigo-300 px-2 py-0.5 rounded-md text-xs">
                        {b.paymentMethod}
                      </Badge>
                    </div>

                    <div className="flex flex-col items-end min-w-[150px]">
                      <p
                        className={`text-2xl font-bold leading-none ${totalPriceClass}`}
                      >
                        {b.totalAmount?.toLocaleString()} ₫
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end mt-3">
                    <Link
                      href={`/admin/bookings/${b.id}`}
                      className="text-primary hover:underline text-sm font-semibold flex items-center gap-1"
                    >
                      Xem chi tiết <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-6 border-t mt-6">
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
