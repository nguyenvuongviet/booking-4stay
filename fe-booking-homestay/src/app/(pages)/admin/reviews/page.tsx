"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/UserAvatar";
import { formatDate } from "@/lib/utils/date";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  RefreshCcw,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { StarRating } from "../_components/star-rating";
import { useReviewList } from "./_hooks/useReviewList";

export default function ReviewsPage() {
  const {
    loading,
    filtered,
    paged,
    page,
    pageCount,
    setPage,
    search,
    setSearch,
    ratingFilter,
    setRatingFilter,
    sortType,
    setSortType,
    removeReview,
    refresh,
  } = useReviewList();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý đánh giá</h1>
          <p className="text-muted-foreground mt-1">
            Theo dõi và kiểm soát các đánh giá của khách hàng
          </p>
        </div>

        <Button variant="outline" onClick={refresh}>
          <RefreshCcw className="w-4 h-4 mr-1" /> Làm mới
        </Button>
      </div>

      <Card className="p-4 rounded-xl shadow-sm">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 text-gray-400" />
            <Input
              placeholder="Tìm theo tên khách hoặc nội dung đánh giá..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              variant={ratingFilter === null ? "default" : "outline"}
              onClick={() => setRatingFilter(null)}
              className="rounded-full px-4"
            >
              Tất cả
            </Button>

            {[5, 4, 3, 2, 1].map((n) => (
              <Button
                key={n}
                variant={ratingFilter === n ? "default" : "outline"}
                onClick={() => setRatingFilter(n)}
                className="rounded-full px-4 flex items-center gap-1"
              >
                {n} <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
              </Button>
            ))}

            <Button
              variant="outline"
              className="px-5 rounded-full"
              onClick={() =>
                setSortType(sortType === "newest" ? "oldest" : "newest")
              }
            >
              ↕ {sortType === "newest" ? "Mới nhất" : "Cũ nhất"}
            </Button>
          </div>
        </div>
      </Card>

      {loading && (
        <div className="py-10 text-center text-gray-500">
          Đang tải đánh giá...
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="py-12 text-center text-gray-500">
          Không có đánh giá nào.
        </div>
      )}

      <div className="space-y-4">
        {paged.map((review) => (
          <Card
            key={review.id}
            className="p-5 rounded-xl shadow-sm hover:shadow-md transition"
          >
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex gap-4 items-start md:w-[25%]">
                <UserAvatar
                  avatarUrl={review.user?.avatar}
                  fullName={review.user?.name}
                  className="w-14 h-14 border"
                />

                <div>
                  <p className="font-semibold">{review.user?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(review.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex-1 text-gray-800 text-sm leading-relaxed">
                {review.comment}
              </div>

              <div className="flex flex-col items-end justify-between gap-3 md:w-24">
                <StarRating value={Math.round(Number(review.rating))} />

                <div className="flex gap-2">
                  {review.bookingId && (
                    <Link
                      href={`/admin/bookings/${review.bookingId}`}
                      className="p-2 hover:bg-gray-100 rounded transition"
                    >
                      <ExternalLink className="w-4 h-4 text-gray-600" />
                    </Link>
                  )}

                  <button
                    onClick={() => removeReview(review.id)}
                    className="p-2 hover:bg-red-100 rounded transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {!loading && filtered.length > 0 && (
        <div className="flex justify-between items-center pt-4">
          <p className="text-sm text-gray-500">
            Trang {page}/{pageCount}
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={page === pageCount}
              onClick={() => setPage(page + 1)}
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
