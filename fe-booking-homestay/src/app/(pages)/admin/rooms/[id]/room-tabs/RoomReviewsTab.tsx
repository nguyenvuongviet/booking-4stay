"use client";

import { Pagination } from "@/app/(pages)/admin/_components/Pagination";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UserAvatar } from "@/components/UserAvatar";
import { formatDate } from "@/lib/utils/date";
import { Review } from "@/types/review";
import { ExternalLink, Star } from "lucide-react";
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
    <div className="flex items-center gap-3 w-full">
      <p className="w-6 font-medium">{star}★</p>
      <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-yellow-400"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-sm text-muted-foreground w-6 text-right">{count}</p>
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
        : +new Date(a.createdAt) - +new Date(b.createdAt)
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
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4 rounded-xl shadow-sm">
          <p className="font-semibold text-lg">Đánh giá tổng thể</p>
          <p className="text-4xl font-bold mt-3">{stats.avg}</p>
          <div className="mt-2">
            <StarRating value={Math.round(Number(stats.avg))} />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Dựa trên {stats.total} đánh giá
          </p>
        </Card>

        <Card className="p-6 rounded-xl shadow-sm">
          <p className="font-semibold text-lg">Phân phối xếp hạng</p>
          <div className="mt-4 space-y-3">
            <RatingBar star={5} count={stats.counts[5]} total={stats.total} />
            <RatingBar star={4} count={stats.counts[4]} total={stats.total} />
            <RatingBar star={3} count={stats.counts[3]} total={stats.total} />
            <RatingBar star={2} count={stats.counts[2]} total={stats.total} />
            <RatingBar star={1} count={stats.counts[1]} total={stats.total} />
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Button
          onClick={() => {
            setRatingFilter(null);
            setPage(1);
          }}
          variant={ratingFilter === null ? "default" : "outline"}
          className="px-5 rounded-full"
        >
          Tất cả
        </Button>

        {[5, 4, 3, 2, 1].map((star) => (
          <Button
            key={star}
            onClick={() => {
              setRatingFilter(star);
              setPage(1);
            }}
            variant={ratingFilter === star ? "default" : "outline"}
            className="px-4 rounded-full gap-1"
          >
            {star} <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
          </Button>
        ))}

        <Button
          variant="outline"
          onClick={() => {
            setSortType(sortType === "newest" ? "oldest" : "newest");
            setPage(1);
          }}
          className="px-5 rounded-full"
        >
          ↕ {sortType === "newest" ? "Mới nhất" : "Cũ nhất"}
        </Button>
      </div>

      <div className="space-y-4">
        {paged.map((review) => (
          <Card
            key={review.id}
            className="p-5 flex flex-col md:flex-row gap-4 rounded-xl border shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-start gap-4 w-full md:w-[25%] shrink-0">
              <UserAvatar
                size="lg"
                avatarUrl={review.user?.avatar}
                fullName={review.user?.name}
              />

              <div>
                <p className="font-semibold text-base">{review.user?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(review.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-base leading-relaxed text-gray-900">
                {review.comment}
              </p>
            </div>

            <div className="flex flex-col items-end justify-between gap-2 md:w-20 shrink-0">
              <StarRating value={Math.round(Number(review.rating))} />

              {review.bookingId && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={`/admin/bookings/${review.bookingId}`}
                        className="opacity-70 hover:opacity-100 transition"
                      >
                        <ExternalLink className="w-5 h-5 text-gray-600" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent className="text-xs py-1 px-2">
                      Xem chi tiết booking
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </Card>
        ))}

        {filtered.length === 0 && (
          <p className="text-center text-gray-500 py-6">
            Không có đánh giá nào.
          </p>
        )}
      </div>

      {pageCount > 0 && (
        <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
      )}
    </div>
  );
}
