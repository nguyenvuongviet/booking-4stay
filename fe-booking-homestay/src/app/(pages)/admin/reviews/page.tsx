"use client";

import { Input } from "@/_components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/_components/ui/select";
import { UserAvatar } from "@/_components/UserAvatar";
import { formatDate } from "@/lib/utils/date";
import { Search, Star, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Pagination } from "../_components/Pagination";
import { RefreshButton } from "../_components/RefreshButton";
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

  const [progress, setProgress] = useState(0);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

  useEffect(() => {
    if (!autoRefreshEnabled) {
      setProgress(0);
      return;
    }

    const duration = 15000;
    const intervalTime = 100;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          refresh();
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [autoRefreshEnabled, refresh]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Quản lý đánh giá
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Theo dõi và kiểm soát các đánh giá của khách hàng
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div
            onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
            className={`flex items-center gap-2 text-[11px] font-bold px-2.5 py-1.5 rounded-xl border select-none cursor-pointer transition-all ${
              autoRefreshEnabled
                ? "bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100"
                : "bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700 hover:bg-slate-200"
            }`}
            title={
              autoRefreshEnabled
                ? "Click để tạm dừng tự động làm mới"
                : "Click để bật tự động làm mới"
            }
          >
            <span className="relative flex h-1.5 w-1.5">
              {autoRefreshEnabled && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                  autoRefreshEnabled ? "bg-emerald-500" : "bg-slate-400"
                }`}
              ></span>
            </span>
            <span>
              {autoRefreshEnabled
                ? `Làm mới sau ${Math.max(1, Math.ceil(15 - (progress * 15) / 100))}s`
                : "Tự động làm mới: Tắt"}
            </span>
          </div>

          <RefreshButton
            onRefresh={async () => {
              await refresh();
              setProgress(0);
            }}
            label=""
            className="h-9 w-9 p-0 sm:w-auto sm:h-10 sm:px-4 sm:gap-2 cursor-pointer rounded-xl"
          />
        </div>
      </div>

      {/* Sleek Auto Refresh Progress Bar */}
      {autoRefreshEnabled && (
        <div className="w-full h-0.5 bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden -mt-2 sm:-mt-3">
          <div
            className="h-full bg-primary/70 transition-all duration-100 ease-linear rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Sticky Search & Filter Container */}
      <div className="sticky top-16 sm:top-20 z-30 -mx-4 px-4 py-3 sm:-mx-6 sm:px-6 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800 shadow-xs transition-all duration-300">
        <div className="p-3 sm:p-4 bg-card rounded-2xl border border-border/80 shadow-xs">
          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Tìm theo tên khách hoặc nội dung đánh giá..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-10 sm:h-11 w-full text-xs sm:text-sm bg-background dark:bg-slate-900 rounded-xl border border-border"
              />
            </div>

            {/* Selects Container */}
            <div className="flex items-center gap-2.5 sm:gap-3 w-full lg:w-auto shrink-0">
              {/* Star Filter Select */}
              <div className="flex-1 lg:w-44 lg:flex-none">
                <Select
                  value={ratingFilter === null ? "all" : String(ratingFilter)}
                  onValueChange={(val) =>
                    setRatingFilter(val === "all" ? null : Number(val))
                  }
                >
                  <SelectTrigger className="h-10 sm:h-11 w-full px-3.5 bg-background dark:bg-slate-900 border border-border rounded-xl text-xs sm:text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                    <SelectValue placeholder="Lọc số sao" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả sao</SelectItem>
                    <SelectItem value="5">⭐⭐⭐⭐⭐ 5 sao</SelectItem>
                    <SelectItem value="4">⭐⭐⭐⭐ 4 sao</SelectItem>
                    <SelectItem value="3">⭐⭐⭐ 3 sao</SelectItem>
                    <SelectItem value="2">⭐⭐ 2 sao</SelectItem>
                    <SelectItem value="1">⭐ 1 sao</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Type Select */}
              <div className="flex-1 lg:w-36 lg:flex-none">
                <Select
                  value={sortType}
                  onValueChange={(val: any) => setSortType(val)}
                >
                  <SelectTrigger className="h-10 sm:h-11 w-full px-3.5 bg-background dark:bg-slate-900 border border-border rounded-xl text-xs sm:text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                    <SelectValue placeholder="Sắp xếp" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">↕ Mới nhất</SelectItem>
                    <SelectItem value="oldest">↕ Cũ nhất</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Skeletons Loading */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="p-4 sm:p-5.5 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-card shadow-xs flex flex-col justify-between h-44 sm:h-48 animate-pulse"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-full shrink-0" />
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                  </div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20 shrink-0" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
                </div>
              </div>
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3 mt-4 pt-3" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filtered.length === 0 && (
        <div className="py-20 text-center text-slate-550 text-xs sm:text-sm">
          Không tìm thấy đánh giá nào phù hợp.
        </div>
      )}

      {/* Reviews Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paged.map((review) => (
            <div
              key={review.id}
              onClick={() => {
                if (review.bookingId) {
                  router.push(`/admin/bookings/${review.bookingId}`);
                }
              }}
              className={`p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-card shadow-2xs flex flex-col justify-between transition-all duration-300 ${
                review.bookingId
                  ? "cursor-pointer hover:border-primary/40 hover:shadow-xs hover:-translate-y-0.5"
                  : ""
              }`}
            >
              <div className="space-y-3.5">
                {/* Header: User Avatar & Name & Stars */}
                <div className="flex items-center gap-3">
                  <UserAvatar
                    size="md"
                    avatarUrl={review.user?.avatar}
                    fullName={review.user?.name}
                    className="w-10 h-10 shrink-0 border border-slate-100 dark:border-slate-800"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-xs sm:text-sm text-slate-850 dark:text-slate-200 truncate">
                      {review.user?.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/20 border border-amber-250/20 dark:border-amber-900/30 px-1.5 py-0.5 rounded-md shrink-0">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">
                          {review.rating}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-450 dark:text-slate-500">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Comment Body */}
                <p className="text-slate-650 dark:text-slate-300 text-xs sm:text-sm leading-relaxed line-clamp-4 wrap-break-word">
                  {review.comment || "— Không có nội dung đánh giá —"}
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2.5 mt-3.5 border-t border-slate-100 dark:border-slate-800/60">
                {review.bookingId ? (
                  <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">
                    <span className="hidden sm:inline">Mã đặt phòng: </span>
                    <span>#{review.bookingId}</span>
                  </span>
                ) : (
                  <span />
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeReview(review.id);
                  }}
                  className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-muted-foreground hover:text-red-650 rounded-lg transition-colors cursor-pointer"
                  title="Xóa đánh giá"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && filtered.length > 0 && (
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
