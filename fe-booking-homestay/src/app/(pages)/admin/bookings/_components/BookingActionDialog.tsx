"use client";

import { InputDialog } from "@/app/(pages)/admin/bookings/_components/InputDialog";
import { BookingActionMode } from "../_hooks/useBookingActions";

interface Props {
  dialog: {
    open: boolean;
    mode: BookingActionMode | null;
    id: number | null;
    maxAmount?: number;
  };
  onCancel: () => void;
  onConfirm: (value: string) => void;
}

export function BookingActionDialog({ dialog, onCancel, onConfirm }: Props) {
  if (!dialog.mode) return null;

  const titles: Record<BookingActionMode, string> = {
    accept: "Nhập số tiền khách đã trả",
    reject: "Nhập lý do từ chối",
    refund: "Nhập số tiền hoàn",
  };

  const placeholders: Record<BookingActionMode, string> = {
    accept: "VD: 1500000",
    reject: "VD: Khách yêu cầu huỷ...",
    refund: "VD: 500000",
  };

  const confirmTexts: Record<BookingActionMode, string> = {
    accept: "Duyệt booking",
    reject: "Từ chối booking",
    refund: "Hoàn tiền",
  };

  return (
    <InputDialog
      open={dialog.open}
      title={titles[dialog.mode]}
      description={
        dialog.mode === "refund"
          ? `Số tiền tối đa có thể hoàn = ${dialog.maxAmount?.toLocaleString()}₫`
          : undefined
      }
      placeholder={placeholders[dialog.mode]}
      type={dialog.mode === "reject" ? "text" : "number"}
      confirmText={confirmTexts[dialog.mode]}
      defaultValue={
        dialog.mode === "refund" ? dialog.maxAmount?.toString() : ""
      }
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}
