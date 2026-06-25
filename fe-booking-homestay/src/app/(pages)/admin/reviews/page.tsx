"use client";

import { Button } from "@/_components/ui/button";
import { Card } from "@/_components/ui/card";
import { Input } from "@/_components/ui/input";
import { UserAvatar } from "@/_components/UserAvatar";
import { formatDate } from "@/lib/utils/date";
import { Search, Star, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Pagination } from "../_components/Pagination";
import { RefreshButton } from "../_components/RefreshButton";
import { StarRating } from "../_components/StarRating";
import { useReviewList } from "./_hooks/useReviewList";

export default function ReviewsPage() {
  const router = useRouter();
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
      <div className="flex items-center justify-between pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold">Quản lý đánh giá</h1>
          <p className="text-muted-foreground mt-1">
            Theo dõi và kiểm soát các đánh giá của khách hàng
          </p>
        </div>
        <RefreshButton onRefresh={refresh} />
      </div>

      <Card className="p-4 rounded-xl shadow-sm">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-65">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paged.map((review) => (
          <Card
            key={review.id}
            onClick={() => {
              if (review.bookingId) {
                router.push(`/admin/bookings/${review.bookingId}`);
              }
            }}
            className={`p-5 rounded-xl border border-slate-100 dark:border-slate-800/80 shadow-xs flex flex-col justify-between transition-all duration-300 ${
              review.bookingId
                ? "cursor-pointer hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5"
                : ""
            }`}
          >
            <div className="space-y-4">
              {/* Header: User Info & Stars */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3 items-center">
                  <UserAvatar
                    size="md"
                    avatarUrl={review.user?.avatar}
                    fullName={review.user?.name}
                  />
                  <div>
                    <p className="font-semibold text-sm text-foreground line-clamp-1">
                      {review.user?.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatDate(review.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="shrink-0">
                  <StarRating value={Math.round(Number(review.rating))} />
                </div>
              </div>

              {/* Comment Body */}
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-4 wrap-break-word">
                {review.comment}
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 mt-4 border-t border-border/40">
              <span className="text-[11px] text-muted-foreground font-medium">
                {review.bookingId ? `Mã đặt phòng: #${review.bookingId}` : ""}
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeReview(review.id);
                }}
                className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-muted-foreground hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                title="Xóa đánh giá"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {!loading && filtered.length > 0 && (
        <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
      )}
    </div>
  );
}
