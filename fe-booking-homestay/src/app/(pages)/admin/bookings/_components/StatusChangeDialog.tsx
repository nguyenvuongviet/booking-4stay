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
import { updateBookingStatus } from "@/services/admin/bookingsApi";
import { BookingStatus } from "@/types/booking";
import {
  Banknote,
  CheckCircle,
  ClipboardEdit,
  Loader2,
  LogOut,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface Props {
  open: boolean;
  bookingId: number;
  newStatus: BookingStatus | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function StatusChangeDialog({
  open,
  bookingId,
  newStatus,
  onClose,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");
  const [surcharge, setSurcharge] = useState("");

  useEffect(() => {
    if (open) {
      setReason("");
      setSurcharge("");
    }
  }, [open]);

  if (!newStatus) return null;

  const isCheckIn = newStatus === BookingStatus.CHECKED_IN;
  const isCheckOut = newStatus === BookingStatus.CHECKED_OUT;

  const handleConfirm = async () => {
    const surchargeNum = surcharge.trim() ? Number(surcharge) : 0;
    if (isNaN(surchargeNum) || surchargeNum < 0) {
      toast.error("Số tiền phụ thu không hợp lệ");
      return;
    }

    setLoading(true);
    try {
      await updateBookingStatus(
        bookingId,
        newStatus,
        reason.trim(),
        surchargeNum || undefined,
      );
      toast.success(
        isCheckIn ? "Nhận phòng thành công!" : "Trả phòng thành công!",
      );
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Cập nhật trạng thái thất bại",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !loading && onClose()}>
      <DialogContent className="max-w-md rounded-2xl p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-850 dark:text-slate-150">
            {isCheckIn ? (
              <>
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                Xác nhận Nhận phòng (Check-in)
              </>
            ) : (
              <>
                <LogOut className="w-5 h-5 text-indigo-600" />
                Xác nhận Trả phòng (Check-out)
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-slate-500 pt-1.5 leading-relaxed">
            {isCheckIn
              ? `Vui lòng xác nhận khách đã đến nhận phòng cho Booking #${bookingId}. Bạn có thể nhập thêm số tiền phụ thu và ghi chú phát sinh.`
              : `Vui lòng xác nhận khách đã làm thủ tục trả phòng cho Booking #${bookingId}. Nhập tiền phụ thu trả muộn, hỏng hóc (nếu có) để tự động tính vào doanh thu.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-4">
          {/* Surcharge input field */}
          <div className="space-y-2">
            <label className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <Banknote className="w-3.5 h-3.5 text-emerald-600" />
              Số tiền phụ thu phát sinh (VND)
            </label>
            <input
              type="number"
              min="0"
              className="w-full h-9.5 px-3 text-xs sm:text-sm border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent outline-none focus:border-primary/50 text-slate-700 dark:text-slate-200 transition-all shadow-2xs placeholder:text-slate-450 font-bold"
              placeholder="0 (Nếu không có phụ thu)"
              value={surcharge}
              onChange={(e) => setSurcharge(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Note text field */}
          <div className="space-y-2">
            <label className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <ClipboardEdit className="w-3.5 h-3.5 text-blue-600" />
              Nội dung ghi chú lý do phụ thu (Tùy chọn)
            </label>
            <textarea
              className="w-full min-h-21.25 p-3 text-xs sm:text-sm border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent outline-none focus:border-primary/50 text-slate-700 dark:text-slate-200 transition-all resize-none shadow-2xs placeholder:text-slate-400"
              placeholder={
                isCheckOut
                  ? "Ví dụ: Phụ thu trả phòng muộn 3 tiếng, phụ thu hỏng ly..."
                  : "Ví dụ: Nhận phòng sớm trước 2 tiếng..."
              }
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <DialogFooter className="flex sm:justify-end gap-2.5 sm:gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button
            variant="outline"
            className="rounded-full px-4 text-xs font-bold border-gray-300 dark:border-slate-700 cursor-pointer h-9 shadow-2xs"
            onClick={onClose}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            disabled={loading}
            className={`rounded-full px-5 text-xs font-bold cursor-pointer h-9 text-white border-none shadow-md flex items-center gap-1.5 ${
              isCheckIn
                ? "bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-500/25"
                : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/25"
            }`}
            onClick={handleConfirm}
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>{isCheckIn ? "Xác nhận Nhận phòng" : "Xác nhận Trả phòng"}</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
