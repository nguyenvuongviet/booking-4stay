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
}

export default function PaymentModal({
  open,
  onClose,
  type,
  onDepositNow,
  onDepositLater,
}: PaymentModalProps) {
  const title =
    type === "BANK_TRANSFER" ? "Xác nhận thanh toán" : "Xác nhận đặt cọc";
  const message =
    type === "BANK_TRANSFER"
      ? "Để giữ phòng, bạn cần thanh toán 100%. Bạn muốn thanh toán ngay hay để sau?"
      : "Để giữ phòng, bạn cần thanh toán 30% tiền cọc. Bạn muốn thanh toán ngay hay để sau?";

  const laterLabel = "Để sau";
  const nowLabel =
    type === "BANK_TRANSFER" ? "Thanh toán ngay" : "Đặt cọc ngay";

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

        <div className="border rounded-lg p-3 bg-gray-50 text-sm text-gray-600 mt-2">
          <strong>Lưu ý:</strong> Phòng sẽ được giữ tạm thời trong 24h cho đến
          khi thanh toán{" "}
          {type === "BANK_TRANSFER" ? "đủ qua PayOS" : "tiền cọc qua tiền mặt"}.
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
