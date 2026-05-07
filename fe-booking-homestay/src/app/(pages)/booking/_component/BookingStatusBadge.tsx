import { useLang } from "@/context/lang-context";
import { BookingStatus } from "@/types/booking";
import {
  CheckCircle2,
  Clock,
  Coins,
  DollarSign,
  DoorOpen,
  LogOut,
  RefreshCw,
  XCircle,
} from "lucide-react";
import React from "react";

interface BookingStatusBadgeProps {
  status: BookingStatus;
  className?: string;
}

export const BookingStatusBadge: React.FC<BookingStatusBadgeProps> = ({
  status,
  className = "",
}) => {
  const { t } = useLang();

  const getStatusConfig = () => {
    switch (status) {
      case BookingStatus.PENDING:
        return {
          icon: <Clock className="w-4 h-4 animate-pulse" />,
          bg: "bg-amber-50 border border-amber-200/60",
          text: "text-amber-700 font-semibold",
          label: "Chờ thanh toán",
        };
      case BookingStatus.CHECKED_IN:
        return {
          icon: <DoorOpen className="w-4 h-4" />,
          bg: "bg-emerald-50 border border-emerald-200/60",
          text: "text-emerald-700 font-semibold",
          label: "Đã nhận phòng",
        };
      case BookingStatus.CONFIRMED:
        return {
          icon: <CheckCircle2 className="w-4 h-4" />,
          bg: "bg-emerald-50 border border-emerald-200/60",
          text: "text-emerald-700 font-semibold",
          label: "Đã xác nhận",
        };
      case BookingStatus.PARTIALLY_PAID:
        return {
          icon: <Coins className="w-4 h-4" />,
          bg: "bg-teal-50 border border-teal-200/60",
          text: "text-teal-700 font-semibold",
          label: "Đã cọc (30%)",
        };
      case BookingStatus.CANCELLED || BookingStatus.CANCELLED_BY_ADMIN:
        return {
          icon: <XCircle className="w-4 h-4" />,
          bg: "bg-rose-50 border border-rose-200/60",
          text: "text-rose-700 font-semibold",
          label: "Đã hủy",
        };
      case BookingStatus.CHECKED_OUT:
        return {
          icon: <LogOut className="w-4 h-4" />,
          bg: "bg-gray-50 border border-gray-200/60",
          text: "text-gray-700 font-semibold",
          label: "Đã trả phòng",
        };
      case BookingStatus.WAITING_REFUND:
        return {
          icon: <RefreshCw className="w-4 h-4 animate-spin" />,
          bg: "bg-orange-50 border border-orange-200/60",
          text: "text-orange-700 font-semibold",
          label: "Đang chờ hoàn tiền",
        };
      case BookingStatus.REFUNDED:
        return {
          icon: <DollarSign className="w-4 h-4" />,
          bg: "bg-pink-50 border border-pink-200/60",
          text: "text-pink-700 font-semibold",
          label: "Đã hoàn tiền",
        };
      default:
        return {
          icon: null,
          bg: "bg-gray-100 border border-gray-200",
          text: "text-gray-500 font-medium",
          label: "Trạng thái không xác định",
        };
    }
  };

  const { icon, bg, text, label } = getStatusConfig();

  return (
    <div
      className={`px-3.5 py-1.5 rounded-full flex items-center gap-1.5 text-xs shadow-sm tracking-wide transition-all duration-300 ${bg} ${text} ${className}`}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
};
