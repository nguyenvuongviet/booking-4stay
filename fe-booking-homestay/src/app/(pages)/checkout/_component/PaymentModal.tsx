"use client";

import { Button } from "@/_components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle
} from "@/_components/ui/dialog";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";
interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  type: "BANK_TRANSFER" | "CASH";
  onDepositNow: () => void;
  onDepositLater: () => void;
  isRemaining?: boolean;
}

export default function PaymentModal({
  open,
  onClose,
  type,
  onDepositNow,
  onDepositLater,
  isRemaining = false,
}: PaymentModalProps) {
  const isBankTransfer = type === "BANK_TRANSFER";

  const title = isRemaining
    ? "Xác nhận thanh toán"
    : isBankTransfer
      ? "Xác nhận thanh toán 100%"
      : "Xác nhận đặt cọc 30%";

  const message = isRemaining
    ? "Bạn có muốn tiến hành thanh toán số tiền còn lại ngay bây giờ để hoàn tất đơn đặt phòng?"
    : isBankTransfer
      ? "Để giữ phòng, bạn cần thanh toán 100%. Bạn muốn thanh toán ngay hay để sau?"
      : "Để giữ phòng, bạn cần thanh toán 30% tiền cọc. Bạn muốn thanh toán ngay hay để sau?";

  const nowLabel = isRemaining
    ? "Thanh toán ngay"
    : isBankTransfer
      ? "Thanh toán ngay"
      : "Đặt cọc ngay";

  const laterLabel = "Để sau";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-3xl p-6 gap-6 border-border/80 bg-card/95 backdrop-blur-md shadow-xl">
        {/* Header with Icon and Title */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 shadow-xs">
            <AlertTriangle className="w-6 h-6 stroke-2" />
          </div>
          <div className="space-y-1.5 flex-1">
            <DialogTitle className="text-xl font-extrabold text-foreground elegant-heading leading-tight">
              {title}
            </DialogTitle>
            <p className="text-sm text-muted-foreground leading-relaxed mt-1">
              {message}
            </p>
          </div>
        </div>

        {/* Warning Notes Box */}
        <div className="bg-amber-50/60 dark:bg-amber-950/10 border border-amber-200/60 dark:border-amber-800/30 rounded-2xl p-4 text-xs text-amber-800 dark:text-amber-300 leading-relaxed shadow-xs">
          <div className="flex gap-2.5">
            <span className="font-extrabold uppercase tracking-wider text-[10px] bg-amber-200/60 dark:bg-amber-800/40 px-1.5 py-0.5 rounded-md shrink-0 h-fit text-amber-800 dark:text-amber-200">
              Lưu ý
            </span>
            <div className="flex-1 text-gray-700 dark:text-gray-300">
              {isRemaining ? (
                <span>
                  Hệ thống sẽ ghi nhận thanh toán và cập nhật trạng thái đơn
                  hàng ngay sau khi giao dịch qua PayOS hoàn tất thành công.
                </span>
              ) : (
                <span>
                  Phòng sẽ được giữ tạm thời cho đến khi bạn hoàn tất thanh toán{" "}
                  <strong className="font-extrabold text-amber-900 dark:text-amber-100">
                    {type === "BANK_TRANSFER" ? "100%" : "30% tiền cọc"}
                  </strong>{" "}
                  qua PayOS. Sau thời gian quy định, đơn hàng sẽ tự động bị huỷ
                  nếu chưa nhận được thanh toán.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <DialogFooter className="flex flex-col gap-3 sm:flex-row sm:justify-end pt-2">
          <button
            type="button"
            onClick={() => {
              onDepositLater();
              onClose();
            }}
            className="flex items-center justify-center gap-2 w-full sm:w-auto h-11 px-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800/80 hover:border-gray-300 dark:hover:border-gray-700 text-gray-700 dark:text-gray-300 active:scale-[0.98] hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-xs transition-all duration-300 font-semibold text-sm cursor-pointer"
          >
            <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span>{laterLabel}</span>
          </button>

          <Button
            type="button"
            onClick={() => {
              onDepositNow();
              onClose();
            }}
            variant="gradient"
            className="flex items-center justify-center gap-2 w-full sm:w-auto h-11 px-6 text-sm"
          >
            <CheckCircle className="w-4 h-4 text-white" />
            <span>{nowLabel}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
