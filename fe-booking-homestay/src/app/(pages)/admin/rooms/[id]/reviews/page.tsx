"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Star, Search, Filter } from "lucide-react";

export default function RoomReviewsPage({
  params,
}: {
  params: { id: string };
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");

  const reviews = [
    {
      id: "R001",
      guest: "John Doe",
      rating: 5,
      comment:
        "Amazing room with great views! The staff was very helpful and the amenities were top-notch.",
      date: "2025-01-10",
      verified: true,
    },
    {
      id: "R002",
      guest: "Jane Smith",
      rating: 4,
      comment:
        "Very comfortable, clean and spacious. Only minor issue was the WiFi connection.",
      date: "2025-01-05",
      verified: true,
    },
    {
      id: "R003",
      guest: "Mike Johnson",
      rating: 5,
      comment: "Perfect for our family vacation. Kids loved the balcony view!",
      date: "2024-12-28",
      verified: true,
    },
    {
      id: "R004",
      guest: "Sarah Williams",
      rating: 3,
      comment:
        "Good room but a bit noisy at night. Could use better soundproofing.",
      date: "2024-12-20",
      verified: true,
    },
  ];

  const stats = {
    average: 4.25,
    total: 45,
    distribution: { 5: 25, 4: 12, 3: 5, 2: 2, 1: 1 },
  };

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch = review.guest
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesRating =
      ratingFilter === "all" || review.rating === Number.parseInt(ratingFilter);
    return matchesSearch && matchesRating;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Guest Reviews</h1>
        <p className="text-muted-foreground mt-1">
          Manage and view all guest reviews for this room
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Average Rating */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Overall Rating</h3>
          <div className="flex items-center gap-4">
            <div className="text-5xl font-bold">{stats.average}</div>
            <div>
              <div className="flex gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.round(stats.average)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Based on {stats.total} reviews
              </p>
            </div>
          </div>
        </Card>

        {/* Rating Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Rating Distribution</h3>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-3">
                <span className="text-sm font-medium w-8">{rating}★</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400"
                    style={{
                      width: `${
                        ((stats.distribution[
                          rating as keyof typeof stats.distribution
                        ] || 0) /
                          stats.total) *
                        100
                      }%`,
                    }}
                  />
                </div>
                <span className="text-sm text-muted-foreground w-8">
                  {stats.distribution[
                    rating as keyof typeof stats.distribution
                  ] || 0}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by guest name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            />
          </div>

          {/* Rating Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <Card key={review.id} className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold">{review.guest}</p>
                  {review.verified && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{review.date}</p>
              </div>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted"
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-foreground">{review.comment}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
