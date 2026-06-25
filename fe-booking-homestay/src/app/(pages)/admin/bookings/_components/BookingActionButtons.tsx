"use client";

import { Button } from "@/_components/ui/button";
import { BookingStatus } from "@/types/booking";
import { Banknote, Edit, X } from "lucide-react";

export function BookingActionButtons({
  status,
  id,
  booking,
  onEdit,
  onCancel,
  onRefund,
  className,
}: {
  status: string;
  id: number;
  booking?: any;
  onEdit?: (id: number) => void;
  onCancel: (id: number) => void;
  onRefund: (booking: any) => void;
  className?: string;
}) {
  const refundAmount = Number(booking?.refundAmount || 0);

  const canEdit = [
    BookingStatus.PENDING,
    BookingStatus.CONFIRMED,
    BookingStatus.PARTIALLY_PAID,
    BookingStatus.CHECKED_IN,
  ].includes(status as BookingStatus);

  const canCancel = [
    BookingStatus.PENDING,
    BookingStatus.CONFIRMED,
    BookingStatus.PARTIALLY_PAID,
    BookingStatus.CHECKED_IN,
  ].includes(status as BookingStatus);

  const canRefund = refundAmount > 0 && status !== BookingStatus.REFUNDED;

  if (
    [
      BookingStatus.CANCELLED,
      BookingStatus.CANCELLED_BY_ADMIN,
      BookingStatus.REFUNDED,
      BookingStatus.CHECKED_OUT,
    ].includes(status as BookingStatus) &&
    !canRefund
  ) {
    return (
      <div
        className={`flex items-center justify-center gap-1.5 opacity-40 grayscale ${className}`}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
          Khóa
        </span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center gap-2 flex-wrap ${className}`}
    >
      {canEdit && onEdit && (
        <Button
          size="sm"
          variant="outline"
          className="rounded-full shadow-sm font-semibold flex items-center gap-1 border-gray-300 hover:border-sky-500 hover:bg-sky-100/70 hover:text-sky-700 dark:border-slate-700 dark:hover:border-sky-500 dark:hover:bg-sky-900/40 dark:hover:text-sky-300 transition-all duration-200 active:scale-95 cursor-pointer"
          onClick={() => onEdit(id)}
        >
          <Edit className="w-4 h-4" /> Sửa
        </Button>
      )}

      {canCancel && (
        <Button
          size="sm"
          className="rounded-full shadow-sm font-semibold flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800 transition-all duration-200 active:scale-95 cursor-pointer hover:shadow-md hover:shadow-red-500/35 border-none"
          onClick={() => onCancel(id)}
        >
          <X className="w-4 h-4" /> Huỷ
        </Button>
      )}

      {canRefund && (
        <Button
          size="sm"
          className="rounded-full shadow-sm font-semibold flex items-center gap-1 bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800 text-white transition-all duration-200 active:scale-95 cursor-pointer hover:shadow-md hover:shadow-amber-500/35 border-none"
          onClick={() => onRefund(booking)}
        >
          <Banknote className="w-4 h-4" /> Hoàn tiền
        </Button>
      )}
    </div>
  );
}
