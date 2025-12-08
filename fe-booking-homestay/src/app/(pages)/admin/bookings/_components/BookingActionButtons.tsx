"use client";

import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

export function BookingActionButtons({
  status,
  id,
  paidAmount,
  onAccept,
  onReject,
  onRefund,
  className,
}: {
  status: string;
  id: number;
  paidAmount?: number;
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
  onRefund: (id: number, maxAmount: number) => void;
  className?: string;
}) {
  if (status === "PENDING")
    return (
      <div className={`flex items-center justify-center gap-2 ${className}`}>
        <Button
          size="sm"
          className="bg-green-600 text-white rounded-full"
          onClick={() => onAccept(id)}
        >
          <Check className="w-4 h-4" /> Duyệt
        </Button>

        <Button
          size="sm"
          className="rounded-full"
          variant="destructive"
          onClick={() => onReject(id)}
        >
          <X className="w-4 h-4" /> Huỷ
        </Button>
      </div>
    );

  if (status === "WAITING_REFUND")
    return (
      <Button
        size="sm"
        className={`bg-amber-600 rounded-full hover:bg-amber-700 text-white font-semibold ${className}`}
        onClick={() => onRefund(id, paidAmount || 0)}
      >
        Hoàn tiền
      </Button>
    );

  return <span className={`text-xs text-gray-400 italic ${className}`}>-</span>;
}
