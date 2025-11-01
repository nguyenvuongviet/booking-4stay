import React from "react";
import { ReviewItem as ReviewItemType } from "@/models/Review";
import { Star } from "lucide-react";

export const ReviewItem: React.FC<{ review: ReviewItemType }> = ({
  review,
}) => {
  const { rating, comment, createdAt, user } = review;

  const renderStars = (count: number) => {
    const fullStars = Math.floor(count);
    const hasHalfStar = count - fullStars >= 0.5;

    return (
      <div className="flex gap-1">
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
      </div>
    );
  };

  return (
    <div className="border-b py-4">
      <div className="flex items-center gap-3 mb-2">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <p className="font-semibold text-gray-800">{user.name}</p>
          <p className="text-sm text-gray-500">
            {new Date(createdAt).toLocaleDateString("vi-VN")}
          </p>
        </div>
      </div>

      <p className="relative flex items-center text-sm text-muted-foreground">{renderStars(rating)} ({rating})</p>

      <p className="mt-2 text-gray-700">{comment}</p>
    </div>
  );
};
