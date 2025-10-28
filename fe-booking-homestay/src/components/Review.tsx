import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { useState } from "react";

export default function ReviewsPopover({ hotel }: { hotel: any }) {
  const [isReviewsPopoverOpen, setIsReviewsPopoverOpen] = useState(false);
  const [isReviewPopoverOpen, setIsReviewPopoverOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    userName: "",
    rating: 0,
    comment: "",
  });

  const handleSubmitReview = () => {
    console.log("Review submitted:", reviewForm);
    setIsReviewPopoverOpen(false);
  };

  return (
    <Popover open={isReviewsPopoverOpen} onOpenChange={setIsReviewsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline">View Reviews</Button>
      </PopoverTrigger>

      <PopoverContent className="max-w-5xl w-[800px] max-h-[80vh] overflow-y-auto p-0">
        <div className="sticky top-0 bg-white border-b px-6 py-4 z-10 flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            Guest reviews for {hotel.name}
          </h2>
          <button
            onClick={() => setIsReviewsPopoverOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Badge className="bg-blue-600 text-white text-lg px-3 py-1">
              {hotel.reviews.overall}
            </Badge>
            <div>
              <p className="font-semibold">{hotel.reviews.ratingLabel}</p>
              <p className="text-sm text-gray-600">
                {hotel.reviews.totalReviews.toLocaleString()} reviews
              </p>
            </div>
          </div>

          {/* 👉 Nút mở popover viết review */}
          <Popover
            open={isReviewPopoverOpen}
            onOpenChange={setIsReviewPopoverOpen}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                Write a review
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[400px] p-5">
              <h3 className="font-semibold text-lg mb-3">Write a Review</h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Your Name</label>
                  <Input
                    value={reviewForm.userName}
                    onChange={(e) =>
                      setReviewForm({
                        ...reviewForm,
                        userName: e.target.value,
                      })
                    }
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Rating</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <button
                        key={num}
                        onClick={() =>
                          setReviewForm({ ...reviewForm, rating: num })
                        }
                        className={`w-8 h-8 rounded-md border text-sm font-semibold transition-colors ${
                          reviewForm.rating === num
                            ? "bg-teal-600 border-teal-600 text-white"
                            : "border-gray-300 hover:border-teal-400"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Comment</label>
                  <Textarea
                    value={reviewForm.comment}
                    onChange={(e) =>
                      setReviewForm({
                        ...reviewForm,
                        comment: e.target.value,
                      })
                    }
                    placeholder="Share your experience..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsReviewPopoverOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitReview}
                    disabled={
                      !reviewForm.userName ||
                      !reviewForm.rating ||
                      !reviewForm.comment
                    }
                    className="bg-teal-600 text-white hover:bg-teal-700"
                  >
                    Submit
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Các phần còn lại của danh sách review */}
        <div className="px-6 py-6">{/* ... review list ... */}</div>
      </PopoverContent>
    </Popover>
  );
}
