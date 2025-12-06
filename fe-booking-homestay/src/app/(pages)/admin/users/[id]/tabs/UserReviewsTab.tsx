"use client";

import { Pagination } from "@/app/(pages)/admin/_components/Pagination";
import { Card } from "@/components/ui/card";
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
  const pageSize = 4;
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
    <Card className="p-6 rounded-xl shadow border border-gray-200">
      <h2 className="text-xl font-semibold mb-4 border-b pb-3 text-gray-800">
        Đánh giá của người dùng
      </h2>

      {loading && <p>Đang tải dữ liệu...</p>}
      {!loading && reviews.length === 0 && (
        <p className="text-gray-500 italic">Người dùng này chưa có đánh giá.</p>
      )}

      {!loading && reviews.length > 0 && (
        <>
          <div className="space-y-4">
            {pagedItems.map((rv) => (
              <div
                key={rv.id}
                className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all p-4"
              >
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-dashed border-gray-300">
                  <div className="flex items-center gap-3">
                    <Image
                      src={rv.user.avatar || "/avatar.png"}
                      alt="Avatar"
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover border"
                    />

                    <div>
                      <p className="font-semibold text-gray-900 leading-tight">
                        {rv.user.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Booking #{rv.bookingId}
                      </p>
                    </div>
                  </div>

                  <StarRating value={rv.rating} />
                </div>

                <div className="flex items-start gap-3">
                  <MessageCircle className="w-5 h-5 text-gray-400 mt-1" />
                  <p className="text-gray-700 text-sm leading-relaxed flex-1">
                    {rv.comment || "— Không có nội dung đánh giá —"}
                  </p>
                </div>

                <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    {formatDate(rv.createdAt)}
                  </p>
                  <Link
                    href={`/admin/bookings/${rv.bookingId}`}
                    className="text-blue-500 hover:text-blue-600 text-sm font-medium flex items-center gap-1"
                  >
                    Xem chi tiết booking <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
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
