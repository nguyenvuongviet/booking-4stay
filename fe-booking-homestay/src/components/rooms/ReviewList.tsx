import React, { useState, useEffect } from "react";
import { ReviewItem } from "./ReviewItem";
import { ReviewItem as ReviewItemType } from "@/models/Review";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { get_review } from "@/services/roomApi";
import { useLang } from "@/context/lang-context";

interface Props {
  roomId?: number | string;
  pageSize?: number;
}
export const ReviewList: React.FC<Props> = ({ roomId, pageSize = 3 }) => {
  const { t } = useLang();
  const [reviews, setReviews] = useState<ReviewItemType[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReviews = async () => {
    if (!roomId) return; // không load nếu roomId undefined
    try {
      setLoading(true);
      setError(null);

      const res = await get_review(roomId, page, pageSize);

      setReviews(res.data.items || []);
      setTotal(res.data.total || 0); // tổng số review
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError("Không thể tải đánh giá, vui lòng thử lại sau!");
    } finally {
      setLoading(false);
    }
  };

  // Load lại khi roomId, page, pageSize thay đổi
  useEffect(() => {
    loadReviews();
  }, [roomId, page, pageSize]);

  // Reset page khi đổi phòng
  useEffect(() => {
    setPage(1);
  }, [roomId]);

  const totalPages = Math.ceil(total / pageSize);

  // ---- UI States ----
  if (loading)
    return (
      <div className="rounded-xl border p-4 bg-white shadow-sm space-y-4 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4" /> {/* title skeleton */}
        {Array.from({ length: pageSize }).map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-md" />
        ))}
      </div>
    );

  if (error)
    return (
      <div className="rounded-xl border p-4 bg-white shadow-sm text-red-500">
        {error}
      </div>
    );

  if (!reviews.length)
    return (
      <div className="rounded-xl border p-4 bg-white shadow-sm text-gray-500 text-center">
        <p>{t("No reviews available for this room.")}</p>
      </div>
    );

  return (
    <div className="rounded-xl border p-4 bg-white shadow-sm">
      <h3 className="text-lg elegant-sans">{t("Reviews")} ({total})</h3>

      <div className="space-y-4">
        {reviews.map((r) => (
          <ReviewItem key={r.id} review={r} />
        ))}
      </div>

      {totalPages > 0 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          {/* Nút Trước */}
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm transition-all ${
              page <= 1
                ? "text-gray-400 border-gray-200 cursor-not-allowed"
                : "text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
          >
            <ChevronLeft size={20} className="text-muted-foreground"/>
          </button>

          {/* Số trang */}
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNumber = i + 1;
              const isActive = pageNumber === page;
              return (
                <button
                  key={pageNumber}
                  onClick={() => setPage(pageNumber)}
                  className={`w-8 h-8 rounded-md text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary text-white shadow"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}
          </div>

          {/* Nút Sau */}
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm transition-all ${
              page >= totalPages
                ? "text-gray-400 border-gray-200 cursor-not-allowed"
                : "text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
          >
            <ChevronRight size={20} className="text-muted-foreground"/>
          </button>
        </div>
      )}
    </div>
  );
};