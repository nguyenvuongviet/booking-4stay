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
import { cancel_booking } from "@/services/bookingApi";
import { Info, Loader2, XCircle } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export const BookingCancelSection = ({
  booking,
  onCancel,
}: {
  booking: Booking;
   onCancel?: (id: number | string, data: { reason: string; refundAmount: number | null }) => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [refundAmount, setRefundAmount] = useState<number | null>(null);

  // Example refund policy — adjust this based on your real policy
  const calculateRefund = (checkInDate: string) => {
    const now = new Date();
    const checkIn = new Date(checkInDate);
    const diffDays = Math.ceil(
      (checkIn.getTime() - now.getTime()) / (1000 * 3600 * 24)
    );

    if (diffDays >= 7) return booking.totalAmount; // 100% refund
    if (diffDays >= 3) return booking.totalAmount * 0.5; // 50% refund
    return 0; // no refund
  };

  const handleCancelClick = () => {
    const refund = calculateRefund(booking.checkIn);
    setRefundAmount(refund);
    setOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!reason.trim()) {
      toast.error("Please enter a reason for cancellation.");
      return;
    }

    try {
      setLoading(true);
      // Simulate API call
      const res = await cancel_booking(booking.id, reason);
      console.log("Cancel booking response:", res);

      toast.success(
        `Booking has been cancelled. ${
          refundAmount && refundAmount > 0
            ? `Refunded ${refundAmount.toLocaleString()} VND.`
            : "No refund according to policy."
        }`
      );

      onCancel?.(booking.id, { reason, refundAmount });
      setOpen(false);
      setReason("");
    } catch (err) {
      toast.error("Failed to cancel booking.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="destructive"
        className="rounded-xl flex items-center gap-2 bg-red-500"
        onClick={handleCancelClick}
        disabled={loading}
      >
        <XCircle className="w-4 h-4" />
        {loading ? "Cancelling..." : "Cancel Booking"}
      </Button>

      {/* Confirmation Popup */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-red-600">
              Confirm Cancel
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Cancellation Policy */}
            <div className="rounded-xl bg-background/25 text-sm text-primary">
              <div className="flex items-center gap-2 font-semibold">
                <Info className="w-4 h-4" />
                Cancellation Policy:
              </div>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
                <li>Cancel 7+ days before check-in → Full refund (100%).</li>
                <li>Cancel 3–6 days before check-in → 50% refund.</li>
                <li>Cancel within 2 days → No refund.</li>
              </ul>
            </div>
            <p className="text-sm text-muted-foreground">
              Please enter your reason for canceling this booking:
            </p>
            <Textarea
              placeholder="Enter your reason..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-xl"
            />

            {refundAmount !== null && (
              <div className="p-3 rounded-xl bg-muted text-sm">
                <p>
                  💰 <strong>Refund amount:</strong>{" "}
                  {refundAmount > 0 ? (
                    <span className="text-green-600 font-semibold">
                      {refundAmount.toLocaleString()} VND
                    </span>
                  ) : (
                    <span className="text-red-500 font-medium">No refund</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  (According to the current cancellation policy)
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="rounded-xl hover:cursor-pointer hover:bg-secondary/50 "
            >
              Close
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmCancel}
              disabled={loading}
              className="rounded-xl hover:cursor-pointer hover:bg-red-500"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
