"use client";

import { Card } from "@/_components/ui/card";
import { Pagination } from "@/app/(pages)/admin/_components/Pagination";
import { formatDate } from "@/lib/utils/date";
import { getReviewsUser } from "@/services/admin/usersApi";
import { Review } from "@/types/review";
import { ArrowRight, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { StarRating } from "../../../_components/StarRating";

export default function UserReviewsTab({
  userId,
  refreshKey,
}: {
  userId: number;
  refreshKey: number;
}) {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const pageSize = 6;
  const [page, setPage] = useState(1);

  async function loadData() {
    try {
      setLoading(true);
      const data = await getReviewsUser(userId);
      setReviews(data);
    } catch (err) {
      console.error("Load reviews error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [userId, refreshKey]);

  useEffect(() => setPage(1), [reviews.length]);

  const pageCount = Math.max(1, Math.ceil(reviews.length / pageSize));
  const pagedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return reviews.slice(start, start + pageSize);
  }, [reviews, page]);

  return (
    <Card className="p-4 sm:p-6 rounded-2xl border border-border shadow-xs">
      <h2 className="text-base sm:text-lg font-bold mb-4 border-b border-border pb-3 text-slate-850 dark:text-slate-100">
        Đánh giá của người dùng
      </h2>

      {loading && (
        <div className="space-y-4 animate-pulse">
          {Array.from({ length: 2 }).map((_, idx) => (
            <div
              key={idx}
              className="p-4 bg-card rounded-2xl border border-border/80 shadow-2xs flex flex-col gap-3.5"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-dashed border-border/85">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-full shrink-0" />
                  <div className="space-y-1.5">
                    <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-24" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-16" />
                  </div>
                </div>
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20" />
              </div>

              {/* Comment text */}
              <div className="flex items-start gap-2.5">
                <div className="w-4 h-4 bg-slate-200 dark:bg-slate-800 rounded shrink-0 mt-0.5" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-4/5" />
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-800/40">
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-20" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-28" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && reviews.length === 0 && (
        <p className="text-slate-400 dark:text-slate-500 italic text-xs py-2">
          Người dùng này chưa viết đánh giá nào.
        </p>
      )}

      {!loading && reviews.length > 0 && (
        <>
          <div className="space-y-4">
            {pagedItems.map((rv) => (
              <div
                key={rv.id}
                className="rounded-2xl border border-border bg-card shadow-2xs hover:shadow-xs hover:border-primary/30 transition-all duration-205 p-4"
              >
                {/* Header info */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-dashed border-border/80">
                  <div className="flex items-center gap-3">
                    <Image
                      src={rv.user.avatar || "/avatar.png"}
                      alt="Avatar"
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover border border-border shrink-0"
                    />

                    <div>
                      <p className="font-semibold text-xs sm:text-sm text-slate-850 dark:text-slate-200 leading-tight">
                        {rv.user.name}
                      </p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                        Booking #{rv.bookingId}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <StarRating value={rv.rating} />
                  </div>
                </div>

                {/* Comment comment */}
                <div className="flex items-start gap-2.5">
                  <MessageCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <p className="text-slate-650 dark:text-slate-300 text-xs sm:text-sm leading-relaxed flex-1 wrap-break-word">
                    {rv.comment || "— Không có nội dung đánh giá —"}
                  </p>
                </div>

                {/* Footer details */}
                <div className="flex justify-between items-center mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-800/40">
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    {formatDate(rv.createdAt)}
                  </p>
                  <Link
                    href={`/admin/bookings/${rv.bookingId}`}
                    className="text-primary hover:text-primary/80 text-xs sm:text-sm font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    Chi tiết booking <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
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
