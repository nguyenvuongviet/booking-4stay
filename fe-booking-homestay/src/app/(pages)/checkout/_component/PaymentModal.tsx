"use client";

import { Button } from "@/_components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-gray-700 leading-relaxed">{message}</p>

        <div className="border border-yellow-100 rounded-xl p-4 bg-yellow-50/50 text-[13px] text-gray-600 mt-2">
          <strong>Lưu ý:</strong>{" "}
          {isRemaining ? (
            <span>
              Hệ thống sẽ ghi nhận thanh toán và cập nhật trạng thái đơn hàng
              ngay sau khi giao dịch qua PayOS hoàn tất thành công.
            </span>
          ) : (
            <span>
              Phòng sẽ được giữ tạm thời cho đến khi bạn hoàn tất thanh toán{" "}
              <strong>
                {type === "BANK_TRANSFER" ? "100%" : "30% tiền cọc"}
              </strong>{" "}
              qua PayOS. Sau thời gian quy định, đơn hàng sẽ tự động bị huỷ nếu
              chưa nhận được thanh toán.
            </span>
          )}
        </div>

        <DialogFooter className="flex flex-col gap-3 sm:flex-row sm:justify-end pt-3">
          <Button
            variant="outline"
            className="flex items-center gap-2 w-full sm:w-auto"
            onClick={() => {
              onDepositLater();
              onClose();
            }}
          >
            <Clock className="w-4 h-4" /> {laterLabel}
          </Button>

          <Button
            className="flex items-center gap-2 w-full sm:w-auto"
            onClick={() => {
              onDepositNow();
              onClose();
            }}
          >
            <CheckCircle className="w-4 h-4" /> {nowLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
