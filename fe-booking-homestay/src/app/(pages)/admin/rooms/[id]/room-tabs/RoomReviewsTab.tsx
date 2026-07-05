"use client";

import { Card } from "@/_components/ui/card";
import { UserAvatar } from "@/_components/UserAvatar";
import { Pagination } from "@/app/(pages)/admin/_components/Pagination";
import { formatDate } from "@/lib/utils/date";
import { Review } from "@/types/review";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { StarRating } from "../../../_components/StarRating";

function RatingBar({
  star,
  count,
  total,
}: {
  star: number;
  count: number;
  total: number;
}) {
  const percent = total ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2 sm:gap-3 w-full">
      <p className="w-6 font-medium text-xs sm:text-sm">{star}★</p>
      <div className="flex-1 h-2.5 sm:h-3 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-yellow-400 rounded-full transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-xs sm:text-sm text-muted-foreground w-6 text-right">
        {count}
      </p>
    </div>
  );
}

function calculateRatingStats(reviews: any[]) {
  const total = reviews.length;
  const counts = {
    5: reviews.filter((r) => Math.floor(r.rating) === 5).length,
    4: reviews.filter((r) => Math.floor(r.rating) === 4).length,
    3: reviews.filter((r) => Math.floor(r.rating) === 3).length,
    2: reviews.filter((r) => Math.floor(r.rating) === 2).length,
    1: reviews.filter((r) => Math.floor(r.rating) === 1).length,
  };
  const avg =
    total > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1)
      : 0;
  return { total, avg, counts };
}

export default function RoomReviewsTab({ reviews }: { reviews: Review[] }) {
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [sortType, setSortType] = useState<"newest" | "oldest">("newest");

  const pageSize = 10;
  const [page, setPage] = useState(1);

  const stats = calculateRatingStats(reviews);

  const filtered = useMemo(() => {
    let data = [...reviews];

    if (ratingFilter)
      data = data.filter((r) => Math.floor(r.rating) === ratingFilter);

    data.sort((a, b) =>
      sortType === "newest"
        ? +new Date(b.createdAt) - +new Date(a.createdAt)
        : +new Date(a.createdAt) - +new Date(b.createdAt),
    );

    return data;
  }, [reviews, ratingFilter, sortType]);

  const pageCount =
    filtered.length > 0 ? Math.ceil(filtered.length / pageSize) : 0;

  const paged =
    pageCount > 0 ? filtered.slice((page - 1) * pageSize, page * pageSize) : [];

  useEffect(() => {
    setPage(1);
  }, [ratingFilter, sortType]);

  return (
    <div className="space-y-4 sm:space-y-6 mt-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
        <Card className="p-3.5 sm:p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 bg-card shadow-2xs flex flex-col justify-center">
          <p className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
            Đánh giá tổng thể
          </p>
          <div className="flex items-baseline gap-2 mt-2 sm:mt-3">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              {stats.avg}
            </span>
            <span className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 font-medium">
              / 5.0
            </span>
          </div>
          <div className="mt-2">
            <StarRating value={Math.round(Number(stats.avg))} />
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1.5">
            Dựa trên {stats.total} đánh giá từ khách hàng
          </p>
        </Card>

        <Card className="p-3.5 sm:p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 bg-card shadow-2xs">
          <p className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
            Phân phối xếp hạng
          </p>
          <div className="mt-2 sm:mt-3 space-y-1.5 sm:space-y-2">
            <RatingBar star={5} count={stats.counts[5]} total={stats.total} />
            <RatingBar star={4} count={stats.counts[4]} total={stats.total} />
            <RatingBar star={3} count={stats.counts[3]} total={stats.total} />
            <RatingBar star={2} count={stats.counts[2]} total={stats.total} />
            <RatingBar star={1} count={stats.counts[1]} total={stats.total} />
          </div>
        </Card>
      </div>

      {/* Filter row: select combobox + sort */}
      <div className="flex items-center gap-2 sm:gap-3">
        <select
          value={ratingFilter ?? "all"}
          onChange={(e) => {
            setRatingFilter(
              e.target.value === "all" ? null : Number(e.target.value),
            );
            setPage(1);
          }}
          className="h-9 sm:h-9.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-1.5 text-xs sm:text-sm outline-none focus:border-primary/50 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
        >
          <option value="all">Tất cả sao</option>
          <option value="5">5 Sao ⭐</option>
          <option value="4">4 Sao ⭐</option>
          <option value="3">3 Sao ⭐</option>
          <option value="2">2 Sao ⭐</option>
          <option value="1">1 Sao ⭐</option>
        </select>

        <select
          value={sortType}
          onChange={(e) => {
            setSortType(e.target.value as "newest" | "oldest");
            setPage(1);
          }}
          className="h-9 sm:h-9.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-1.5 text-xs sm:text-sm outline-none focus:border-primary/50 text-slate-700 dark:text-slate-300 font-medium cursor-pointer ml-auto"
        >
          <option value="newest">Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
        </select>
      </div>

      {/* Reviews list */}
      <div className="space-y-3 sm:space-y-4">
        {paged.map((review) => (
          <Card
            key={review.id}
            className="p-3.5 sm:p-5 flex flex-col gap-3 sm:gap-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs bg-card"
          >
            {/* Header: User Avatar & Name, Stars top-right */}
            <div className="flex items-start gap-2.5 sm:gap-3 pb-2.5 sm:pb-3 border-b border-dashed border-slate-100 dark:border-slate-800/60">
              <UserAvatar
                size="md"
                avatarUrl={review.user?.avatar}
                fullName={review.user?.name}
                className="w-9 h-9 sm:w-10 sm:h-10 border border-slate-100 dark:border-slate-800 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-xs sm:text-sm text-slate-850 dark:text-slate-200 truncate">
                      {review.user?.name}
                    </p>
                    <span className="text-[10px] text-slate-450 dark:text-slate-500 mt-0.5 block">
                      <span className="hidden sm:inline">Booking </span>#
                      {review.bookingId}
                    </span>
                  </div>
                  <div className="shrink-0">
                    <StarRating value={Math.floor(review.rating)} />
                  </div>
                </div>
              </div>
            </div>

            {/* Comment Body */}
            <div className="text-xs sm:text-sm leading-relaxed text-slate-650 dark:text-slate-300">
              <p className="wrap-break-word">
                {review.comment || "— Không có nội dung đánh giá —"}
              </p>
            </div>

            {/* Footer details */}
            <div className="flex justify-between items-center mt-0.5 sm:mt-1.5 pt-2 sm:pt-2.5 border-t border-slate-100 dark:border-slate-800/40">
              <span className="text-[10px] sm:text-xs text-slate-400">
                {formatDate(review.createdAt)}
              </span>

              {review.bookingId && (
                <Link
                  href={`/admin/bookings/${review.bookingId}`}
                  className="text-primary hover:text-primary/80 text-[11px] sm:text-sm font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Chi tiết booking</span>
                  <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </Link>
              )}
            </div>
          </Card>
        ))}

        {filtered.length === 0 && (
          <p className="text-center text-slate-400 dark:text-slate-500 italic py-6 text-xs sm:text-sm">
            Không có đánh giá nào phù hợp.
          </p>
        )}
      </div>

      {pageCount > 0 && (
        <div className="pt-2">
          <Pagination
            page={page}
            pageCount={pageCount}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
