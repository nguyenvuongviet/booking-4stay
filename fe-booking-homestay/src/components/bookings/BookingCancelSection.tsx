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
import { useLang } from "@/context/lang-context";
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
  const {t} = useLang();
  // Example refund policy — adjust this based on your real policy
  const calculateRefund = (checkInDate: string) => {
    const now = new Date();
    const checkIn = new Date(checkInDate);
    const diffDays = Math.ceil(
      (checkIn.getTime() - now.getTime()) / (1000 * 3600 * 24)
    );

    if (diffDays >= 7) return booking.paidAmount; // 100% refund
    if (diffDays >= 3) return booking.paidAmount * 0.5; // 50% refund
    return 0; // no refund
  };

  const handleCancelClick = () => {
    const refund = calculateRefund(booking.checkIn);
    setRefundAmount(refund);
    setOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!reason.trim()) {
      toast.error("Vui lòng nhập lý do hủy đặt phòng");
      return;
    }

    try {
      setLoading(true);
      // Simulate API call
      const res = await cancel_booking(booking.id, reason);
      console.log("Cancel booking response:", res);

      toast.success(
        `Đơn đặt phòng đã được hủy thành công. ${
          refundAmount && refundAmount > 0
            ? `Hoàn ${refundAmount.toLocaleString()} VND.`
            : "Không hoàn tiền theo chính sách."
        }`
      );

      onCancel?.(booking.id, { reason, refundAmount });
      setOpen(false);
      setReason("");
    } catch (err) {
      toast.error("Hủy đặt phòng thất bại");
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
        {loading ? "Đang hủy..." : "Hủy đặt phòng"}
      </Button>

      {/* Confirmation Popup */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-red-600">
              Hủy đặt phòng!
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Cancellation Policy */}
            <div className="rounded-xl bg-background/25 text-sm text-primary">
              <div className="flex items-center gap-2 font-semibold">
                <Info className="w-4 h-4" />
                {t("Cancellation & Refund Policy")}
              </div>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
                <li>{t("Cancel 7 or more days before check-in → Full refund (100%)")}.</li>
                <li>{t("Cancel 3–6 days before check-in → 50% refund")}</li>
                <li>{t("Cancel within 2 days of check-in → No refund")}</li>
              </ul>
            </div>
            <p className="text-sm text-muted-foreground">
              Vui lòng nhập lý do để hủy đặt phòng:
            </p>
            <Textarea
              placeholder="Nhập lý do..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-xl"
            />

            {refundAmount !== null && (
              <div className="p-3 rounded-xl bg-accent/50 text-sm">
                <p>
                  <strong>Số tiền được hoàn trả:</strong>{" "}
                  {refundAmount > 0 ? (
                    <span className="text-green-600 font-semibold">
                      {refundAmount.toLocaleString()} VND
                    </span>
                  ) : (
                    <span className="text-red-500 font-medium">Không hoàn tiền</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  (Theo chính sách hoàn hủy của chúng tôi)
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
              {t("close")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmCancel}
              disabled={loading}
              className="rounded-xl hover:cursor-pointer hover:bg-red-500"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t("Submit")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
