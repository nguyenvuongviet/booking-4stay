import React from "react";
import { ReviewItem as ReviewItemType } from "@/models/Review";
import { Star } from "lucide-react";

export const ReviewItem: React.FC<{ review: ReviewItemType }> = ({ review }) => {
  const { rating, comment, createdAt, user } = review;

  const renderStars = (count: number) => (
    <div className="flex gap-1 text-yellow-500">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={16}
          fill={i < Math.round(count) ? "#facc15" : "none"}
          stroke={i < Math.round(count) ? "#facc15" : "#d1d5db"}
        />
      ))}
    </div>
  );

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

      {renderStars(rating)}

      <p className="mt-2 text-gray-700">{comment}</p>
    </div>
  );
};
