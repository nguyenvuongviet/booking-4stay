"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Booking } from "@/models/Booking";
import { Loader2, Star } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export const ReviewSection = ({
  booking,
  onReview,
}: {
  booking: Booking;
  onReview?: (
    bookingId: number | string,
    rating: number,
    comment: string
  ) => Promise<void>;
}) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState(booking.review?.comment || "");
  const [rate, setRate] = useState<number | null>(
    booking.review?.rating || null
  );
  const isReviewed = !!booking.isReview;

  const handleSubmit = async () => {
    if (!rate || rate <= 0 || rate > 5) {
      toast.error("Please enter a rating from 0 to 5!");
      return;
    }
    if (!comment.trim()) {
      toast.error("Please write your comment!");
      return;
    }

    try {
      setLoading(true);
      await onReview?.(booking.id, rate, comment);
      toast.success("Thank you for your review!");
      setOpen(false);
    } catch (err) {
      toast.error("Failed to submit review!");
    } finally {
      setLoading(false);
    }
  };

  const fullStars = Math.floor(rate ?? 0);
  const hasHalfStar = rate ? rate - fullStars >= 0.5 : false;

  return (
    <>
      <Button
        variant={isReviewed ? "outline" : "secondary"}
        className="rounded-xl flex items-center gap-2"
        onClick={() => setOpen(true)}
      >
        {isReviewed ? "View Review" : "Write Review"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg elegant-sanserif text-primary">
              {isReviewed ? "Your Review" : "Write a Review"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Rating */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Enter your rating (0–5):
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={rate ?? ""}
                  onChange={(e) => setRate(parseFloat(e.target.value))}
                  disabled={isReviewed}
                  className="w-20 text-center border rounded-md p-1 focus:ring-2 focus:ring-primary"
                />
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => {
                    if (i < fullStars)
                      return (
                        <Star
                          key={i}
                          size={20}
                          fill="#facc15"
                          stroke="#facc15"
                        />
                      );
                    if (i === fullStars && hasHalfStar)
                      return (
                        <Star
                          key={i}
                          size={20}
                          fill="url(#halfGradient)"
                          stroke="#facc15"
                        />
                      );
                    return (
                      <Star key={i} size={20} fill="none" stroke="#d1d5db" />
                    );
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
              </div>
            </div>

            {/* Comment */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Share your experience:
              </p>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={isReviewed}
                placeholder="Write your comment here..."
                className="w-full min-h-[100px] resize-none wrap-break-word whitespace-pre-wrap overflow-y-auto rounded-lg border border-border p-2 focus:ring-2 focus:ring-primary transition-all"
                rows={4}
              />
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <Button
              className="rounded-xl"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Close
            </Button>
            {!isReviewed && (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-primary text-white hover:bg-primary/80 rounded-xl"
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Submit Review
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
