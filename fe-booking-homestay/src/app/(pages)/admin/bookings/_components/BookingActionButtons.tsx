"use client";

import { Button } from "@/_components/ui/button";
import { parseAbsoluteDate } from "@/lib/utils";
import { BookingStatus } from "@/types/booking";
import { Banknote, CheckCircle, Edit, LogOut, X } from "lucide-react";
import { useState } from "react";
import { StatusChangeDialog } from "./StatusChangeDialog";

export function BookingActionButtons({
  status,
  id,
  booking,
  onEdit,
  onCancel,
  onRefund,
  onStatusUpdated,
  className,
}: {
  status: string;
  id: number;
  booking?: any;
  onEdit?: (id: number) => void;
  onCancel: (id: number) => void;
  onRefund: (booking: any) => void;
  onStatusUpdated?: () => void;
  className?: string;
}) {
  const [statusChangeData, setStatusChangeData] = useState<{
    open: boolean;
    status: BookingStatus | null;
  }>({ open: false, status: null });

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
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const checkInDate = booking ? parseAbsoluteDate(booking.checkIn) : null;
  const checkOutDate = booking ? parseAbsoluteDate(booking.checkOut) : null;

  if (checkInDate) checkInDate.setHours(0, 0, 0, 0);

  if (checkOutDate) checkOutDate.setHours(0, 0, 0, 0);

  const isCheckInDateOrLater = checkInDate
    ? today.getTime() >= checkInDate.getTime()
    : true;
  const isCheckOutDateOrLater = checkOutDate
    ? today.getTime() >= checkOutDate.getTime()
    : true;

  const canCheckIn =
    [BookingStatus.CONFIRMED, BookingStatus.PARTIALLY_PAID].includes(
      status as BookingStatus,
    ) && isCheckInDateOrLater;

  const canCheckOut =
    status === BookingStatus.CHECKED_IN && isCheckOutDateOrLater;

  const handleStatusChange = (newStatus: BookingStatus) => {
    setStatusChangeData({ open: true, status: newStatus });
  };

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
      {canCheckIn && (
        <Button
          size="sm"
          className="h-7 sm:h-8 px-2.5 sm:px-3.5 text-[10px] sm:text-xs rounded-full shadow-sm font-bold flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-750 dark:hover:bg-emerald-800 transition-all duration-200 active:scale-95 cursor-pointer hover:shadow-md hover:shadow-emerald-500/35 border-none"
          onClick={() => handleStatusChange(BookingStatus.CHECKED_IN)}
        >
          <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Nhận phòng
        </Button>
      )}

      {canCheckOut && (
        <Button
          size="sm"
          className="h-7 sm:h-8 px-2.5 sm:px-3.5 text-[10px] sm:text-xs rounded-full shadow-sm font-bold flex items-center gap-1 bg-indigo-600 hover:bg-indigo-750 text-white dark:bg-indigo-700 dark:hover:bg-indigo-800 transition-all duration-200 active:scale-95 cursor-pointer hover:shadow-md hover:shadow-indigo-500/35 border-none"
          onClick={() => handleStatusChange(BookingStatus.CHECKED_OUT)}
        >
          <LogOut className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Trả phòng
        </Button>
      )}

      {canEdit && onEdit && (
        <Button
          size="sm"
          variant="outline"
          className="h-7 sm:h-8 px-2.5 sm:px-3.5 text-[10px] sm:text-xs rounded-full shadow-sm font-bold flex items-center gap-1 border-gray-300 hover:border-sky-500 hover:bg-sky-100/70 hover:text-sky-700 dark:border-slate-700 dark:hover:border-sky-500 dark:hover:bg-sky-900/40 dark:hover:text-sky-300 transition-all duration-200 active:scale-95 cursor-pointer"
          onClick={() => onEdit(id)}
        >
          <Edit className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Sửa
        </Button>
      )}

      {canCancel && (
        <Button
          size="sm"
          className="h-7 sm:h-8 px-2.5 sm:px-3.5 text-[10px] sm:text-xs rounded-full shadow-sm font-bold flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800 transition-all duration-200 active:scale-95 cursor-pointer hover:shadow-md hover:shadow-red-500/35 border-none"
          onClick={() => onCancel(id)}
        >
          <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Huỷ
        </Button>
      )}

      {canRefund && (
        <Button
          size="sm"
          className="h-7 sm:h-8 px-2.5 sm:px-3.5 text-[10px] sm:text-xs rounded-full shadow-sm font-bold flex items-center gap-1 bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800 text-white transition-all duration-200 active:scale-95 cursor-pointer hover:shadow-md hover:shadow-amber-500/35 border-none"
          onClick={() => onRefund(booking)}
        >
          <Banknote className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Hoàn tiền
        </Button>
      )}

      <StatusChangeDialog
        open={statusChangeData.open}
        bookingId={id}
        newStatus={statusChangeData.status}
        onClose={() => setStatusChangeData({ open: false, status: null })}
        onSuccess={onStatusUpdated}
      />
    </div>
  );
}
