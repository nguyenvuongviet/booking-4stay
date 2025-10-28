"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Star, Eye, Trash2 } from "lucide-react";

const reviews = [
  {
    id: 1,
    guest: "John Doe",
    property: "Beach Villa",
    rating: 5,
    comment: "Amazing place! Highly recommended.",
    date: "2025-01-15",
    status: "Published",
  },
  {
    id: 2,
    guest: "Jane Smith",
    property: "Mountain Cabin",
    rating: 4,
    comment: "Great location, clean and comfortable.",
    date: "2025-01-14",
    status: "Published",
  },
  {
    id: 3,
    guest: "Mike Johnson",
    property: "City Apartment",
    rating: 5,
    comment: "Perfect for a city getaway!",
    date: "2025-01-13",
    status: "Pending",
  },
  {
    id: 4,
    guest: "Sarah Williams",
    property: "Beachfront House",
    rating: 3,
    comment: "Good but needs some maintenance.",
    date: "2025-01-12",
    status: "Published",
  },
  {
    id: 5,
    guest: "Tom Brown",
    property: "Forest Retreat",
    rating: 4,
    comment: "Peaceful and relaxing atmosphere.",
    date: "2025-01-11",
    status: "Published",
  },
];

export default function ReviewsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reviews</h1>
        <p className="text-muted-foreground mt-1">
          Manage guest reviews and ratings
        </p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search reviews..." className="pl-10" />
            </div>
          </div>
          <Button variant="outline" className="gap-2 bg-transparent">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card
            key={review.id}
            className="p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold">{review.guest}</h3>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {review.property}
                </p>
                <p className="text-sm mb-3">{review.comment}</p>
                <p className="text-xs text-muted-foreground">{review.date}</p>
              </div>
              <div className="flex flex-col gap-2 ml-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                    review.status === "Published"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {review.status}
                </span>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-muted rounded transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-destructive/10 rounded transition-colors">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
