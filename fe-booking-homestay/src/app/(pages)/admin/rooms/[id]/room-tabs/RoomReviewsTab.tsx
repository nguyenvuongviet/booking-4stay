"use client";

import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";
import { formatDate } from "@/lib/utils/date";

export default function RoomReviewsTab({ reviews }: { reviews: any[] }) {
  if (!reviews.length)
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">
          Chưa có đánh giá nào.
        </p>
      </Card>
    );

  return (
    <div className="space-y-4">
      {reviews.map((r) => (
        <Card key={r.id} className="p-5 flex gap-4">
          <div className="flex flex-col items-center">
            <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
            <span className="font-bold text-lg">{r.rating}</span>
          </div>

          <div className="flex-1">
            <p className="text-sm text-muted-foreground">
              {formatDate(r.createdAt)}
            </p>
            <p className="mt-1">{r.comment}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
