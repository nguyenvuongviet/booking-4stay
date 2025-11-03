import { Card } from "@/components/ui/card";
import { Review } from "@/types/room";
import { Star, UserRound } from "lucide-react";
import React from "react";

interface RoomReviewsTabProps {
  reviews: Review[];
  formatDate: (date?: string | Date | null) => string;
}

const RoomReviewsTab: React.FC<RoomReviewsTabProps> = ({
  reviews,
  formatDate,
}) => {
  return (
    <Card className="p-6 space-y-4">
      <h3 className="text-xl font-bold text-warm-900 mb-4 border-b pb-2">
        Đánh giá khách hàng
      </h3>
      {reviews.length ? (
        reviews.map((r) => (
          <div key={r.id} className="border p-4 rounded-lg bg-white shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-3">
                {r.user?.avatar ? (
                  <img
                    src={r.user.avatar}
                    alt={r.user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <UserRound className="w-6 h-6 text-warm-500" />
                )}
                <p className="font-semibold text-warm-900 text-base">
                  {r.user?.name || "Ẩn danh"}
                </p>
              </div>
              <div className="flex items-center text-yellow-500">
                <Star className="w-4 h-4 fill-yellow-500" />
                <span className="ml-1 text-lg font-bold">{r.rating}</span>
              </div>
            </div>
            <p className="text-sm text-warm-700 italic">"{r.comment}"</p>
            <p className="text-xs text-muted-foreground mt-2 text-right">
              Đánh giá vào: {formatDate(r.createdAt)}
            </p>
          </div>
        ))
      ) : (
        <p className="text-center text-muted-foreground py-8">
          Chưa có đánh giá nào.
        </p>
      )}
    </Card>
  );
};

export default RoomReviewsTab;
