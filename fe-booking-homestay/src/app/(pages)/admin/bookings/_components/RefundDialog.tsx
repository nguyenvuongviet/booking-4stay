"use client";

import { Button } from "@/_components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/_components/ui/dialog";
import { Input } from "@/_components/ui/input";
import { Label } from "@/_components/ui/label";
import {
  confirmRefundDifference,
  refundBooking,
} from "@/services/admin/bookingsApi";
import {
  AlertTriangle,
  Banknote,
  CreditCard,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface Props {
  open: boolean;
  booking: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function RefundDialog({ open, booking, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [overrideAmount, setOverrideAmount] = useState<string>("");

  const refundAmount = Number(booking?.refundAmount || 0);
  const totalAmount = Number(booking?.totalAmount || 0);
  const paidAmount = Number(booking?.paidAmount || 0);
  const cancellationFee = Number(booking?.cancellationFee || 0);
  const isWaitingRefund = booking?.status === "WAITING_REFUND";

  useEffect(() => {
    if (open) {
      setOverrideAmount(refundAmount.toString());
    }
  }, [open, refundAmount]);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const finalAmount = Number(overrideAmount);
      if (isNaN(finalAmount) || finalAmount < 0) {
        toast.error("Số tiền không hợp lệ");
        return;
      }

      if (isWaitingRefund) {
        // Đơn đang chờ hoàn tiền (sau huỷ) → gọi refundBooking → REFUNDED
        await refundBooking(booking.id, finalAmount);
        toast.success("Hoàn tiền thành công — Đơn chuyển sang REFUNDED");
      } else {
        // Đơn có chênh lệch (sau sửa ngày) → gọi confirmRefundDifference → reset refundAmount
        await confirmRefundDifference(booking.id);
        toast.success("Đã xác nhận hoàn tiền chênh lệch");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Thao tác thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-amber-700">
            <Banknote className="w-5 h-5" />
            Hoàn tiền — Đơn #{booking.id}
          </DialogTitle>
          <DialogDescription>
            Xác nhận đã chuyển khoản hoàn tiền cho khách.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* Financial Summary */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Khách hàng</span>
              <span className="font-bold text-gray-900">
                {booking.guestInfo?.fullName || "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Tổng đơn</span>
              <span className="font-bold text-gray-900">
                {totalAmount.toLocaleString()}₫
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Đã thanh toán</span>
              <span className="font-bold text-green-600">
                {paidAmount.toLocaleString()}₫
              </span>
            </div>
            {cancellationFee > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500">Phí huỷ / Phạt</span>
                <span className="font-bold text-red-600">
                  -{cancellationFee.toLocaleString()}₫
                </span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="text-gray-700 font-bold">Số tiền cần hoàn</span>
              <span className="font-black text-amber-700 text-lg">
                {refundAmount.toLocaleString()}₫
              </span>
            </div>
          </div>

          {/* Bank Info */}
          {booking.bankInfo?.bankAccountNumber ? (
            <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200 space-y-1.5 text-sm">
              <p className="text-xs font-bold text-indigo-700 uppercase flex items-center gap-1">
                <CreditCard className="w-3 h-3" />
                Thông tin NH nhận hoàn tiền
              </p>
              <p className="text-indigo-900 font-medium">
                {booking.bankInfo.bankName} —{" "}
                {booking.bankInfo.bankAccountNumber}
              </p>
              <p className="text-indigo-900 font-medium">
                CTK: {booking.bankInfo.bankAccountName}
              </p>
            </div>
          ) : (
            <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 text-xs text-amber-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Khách chưa cung cấp thông tin ngân hàng. Vui lòng liên hệ khách
                trước khi hoàn tiền.
              </span>
            </div>
          )}

          {/* Override Amount (chỉ cho WAITING_REFUND - thương lượng) */}
          {isWaitingRefund && (
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-500 uppercase">
                Số tiền hoàn thực tế (₫) — có thể điều chỉnh
              </Label>
              <Input
                type="number"
                value={overrideAmount}
                onChange={(e) => setOverrideAmount(e.target.value)}
                className="rounded-xl"
              />
              <p className="text-[10px] text-gray-400 italic">
                Admin có thể tăng/giảm số tiền hoàn (thương lượng với khách).
                Tối đa: {paidAmount.toLocaleString()}₫
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl"
          >
            Huỷ bỏ
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={
              loading ||
              (isWaitingRefund &&
                (Number(overrideAmount) < 0 ||
                  Number(overrideAmount) > paidAmount))
            }
            className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Xác nhận đã hoàn tiền
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
