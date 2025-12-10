import { ReviewItem as ReviewItemType } from "@/models/Review";
import { Star } from "lucide-react";
import React from "react";
import { UserAvatar } from "../UserAvatar";

export const ReviewItem: React.FC<{ review: ReviewItemType }> = ({
  review,
}) => {
  const { rating, comment, createdAt, user } = review;

  const renderStars = (count: number) => {
    const fullStars = Math.floor(count);
    const hasHalfStar = count - fullStars >= 0.5;

    return (
      <span className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => {
          if (i < fullStars) {
            return <Star key={i} size={16} fill="#facc15" stroke="#facc15" />;
          } else if (i === fullStars && hasHalfStar) {
            return (
              <Star
                key={i}
                size={16}
                fill="url(#halfGradient)"
                stroke="#facc15"
              />
            );
          } else {
            return <Star key={i} size={16} fill="none" stroke="#d1d5db" />;
          }
        })}
        <svg width="0" height="0">
          <defs>
            <linearGradient id="halfGradient">
              <stop offset="50%" stopColor="#facc15" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
        </svg>
      </span>
    );
  };

  return (
    <div className="border-b py-4">
      <div className="flex items-center gap-3 mb-2">
        <UserAvatar avatarUrl={user?.avatar} fullName={user.name} size="md" />
        <div>
          <p className="elegant-sans text-foreground">{user.name}</p>
          <p className="text-sm text-muted">
            {new Date(createdAt).toLocaleDateString("vi-VN")}
          </p>
        </div>
      </div>

      <p className="relative flex items-center text-xs text-muted">
        {renderStars(rating)} ({rating})
      </p>

      <p className="mt-2 text-muted-foreground ">{comment}</p>
    </div>
  );
};
