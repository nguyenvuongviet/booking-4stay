"use client";

import { Button } from "@/_components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/_components/ui/dialog";
import { Textarea } from "@/_components/ui/textarea";
import {
  adminForceCancel,
  CancelPreviewResult,
  getCancelPreview,
} from "@/services/admin/bookingsApi";
import { Ban, Calculator, Clock, Loader2, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface SmartCancelDialogProps {
  open: boolean;
  bookingId: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function SmartCancelDialog({
  open,
  bookingId,
  onClose,
  onSuccess,
}: SmartCancelDialogProps) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState<CancelPreviewResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open && bookingId) {
      setLoading(true);
      setError(null);
      setReason("");

      getCancelPreview(bookingId)
        .then((data) => {
          setPreview(data);
        })
        .catch((err) => {
          setError(
            err?.response?.data?.message ||
              "Không thể tải thông tin huỷ đơn. Vui lòng thử lại.",
          );
        })
        .finally(() => setLoading(false));
    }
  }, [open, bookingId]);

  const handleConfirm = async () => {
    if (!bookingId) return;
    setSubmitting(true);
    try {
      await adminForceCancel(bookingId, reason || "Admin huỷ đơn");
      toast.success("Huỷ đơn đặt phòng thành công");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Huỷ đơn thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  const getRefundLabel = (percent: number) => {
    if (percent >= 1) return "Hoàn 100%";
    if (percent > 0) return `Hoàn ${Math.round(percent * 100)}%`;
    return "Không hoàn tiền";
  };

  const getPolicyDescription = (daysLeft: number) => {
    if (daysLeft < 0) return "Đã quá ngày check-in";
    if (daysLeft === 0) return "Ngày check-in hôm nay";
    return `Còn ${daysLeft} ngày trước check-in`;
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-135 p-0 overflow-hidden bg-white rounded-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 pb-4 shrink-0">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-black text-gray-900">
              <Ban className="w-5 h-5 text-red-500" />
              Huỷ đơn đặt phòng
            </DialogTitle>
            <DialogDescription className="text-gray-500 mt-1">
              Hệ thống tự động tính toán số tiền hoàn trả theo chính sách.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto flex-1 border-y border-gray-100 space-y-5">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <p className="text-sm text-gray-500 font-medium">
                Đang tính toán chính sách...
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          {preview && !loading && (
            <>
              {/* Booking Summary */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 border border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Khách hàng</span>
                  <span className="font-bold text-gray-900">
                    {preview.guestName}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Phòng</span>
                  <span className="font-bold text-gray-900">
                    {preview.roomName}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tổng giá trị</span>
                  <span className="font-bold text-gray-900">
                    {preview.totalPrice.toLocaleString()}₫
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Đã thanh toán</span>
                  <span className="font-bold text-green-600">
                    {preview.paidAmount.toLocaleString()}₫
                  </span>
                </div>
              </div>

              {/* Policy Calculation */}
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 space-y-3">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-amber-600" />
                  <h4 className="font-bold text-amber-900 text-sm">
                    Kết quả tính toán chính sách
                  </h4>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span className="text-amber-800 font-medium">
                    {getPolicyDescription(preview.daysUntilCheckIn)}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4 text-amber-500" />
                  <span className="text-amber-800 font-medium">
                    Quy tắc áp dụng:{" "}
                    <strong>
                      {getRefundLabel(preview.appliedRefundPercent)}
                    </strong>
                  </span>
                </div>

                {/* Policy Rules Reference */}
                {preview.cancellationPolicy &&
                  preview.cancellationPolicy.length > 0 && (
                    <div className="bg-white/60 rounded-lg p-3 mt-2 space-y-1">
                      <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">
                        Bảng chính sách huỷ phòng
                      </p>
                      {[...preview.cancellationPolicy]
                        .sort((a, b) => b.daysBefore - a.daysBefore)
                        .map((rule, i) => (
                          <div
                            key={i}
                            className={`flex justify-between text-xs py-1 px-2 rounded ${
                              preview.daysUntilCheckIn >= rule.daysBefore &&
                              (i === 0 ||
                                preview.daysUntilCheckIn <
                                  preview.cancellationPolicy.sort(
                                    (a, b) => b.daysBefore - a.daysBefore,
                                  )[i - 1]?.daysBefore)
                                ? "bg-amber-200/50 font-bold"
                                : ""
                            }`}
                          >
                            <span>≥ {rule.daysBefore} ngày trước check-in</span>
                            <span>
                              Hoàn {Math.round(rule.refundPercent * 100)}%
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
              </div>

              {/* Result */}
              <div className="bg-white rounded-xl border-2 border-gray-200 p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-700">
                    Phí phạt huỷ
                  </span>
                  <span className="text-lg font-black text-red-600">
                    {preview.suggestedCancellationFee.toLocaleString()}₫
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-700">
                    Số tiền hoàn trả gợi ý
                  </span>
                  <span className="text-lg font-black text-green-600">
                    {preview.suggestedRefundAmount.toLocaleString()}₫
                  </span>
                </div>
              </div>

              {/* Reason */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">
                  Lý do huỷ đơn
                </label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ví dụ: Khách yêu cầu huỷ, sự cố kỹ thuật..."
                  className="min-h-20 rounded-xl border-gray-200 focus:ring-red-500"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-white flex items-center justify-end gap-3 shrink-0">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={submitting}
            className="rounded-full font-bold hover:bg-gray-100"
          >
            Huỷ bỏ
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={submitting || loading || !preview}
            className="rounded-full font-bold px-6 bg-red-600 hover:bg-red-700 text-white"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              "Xác nhận huỷ đơn"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
