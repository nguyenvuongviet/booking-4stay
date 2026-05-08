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
          icon: <Clock className="w-3.5 h-3.5" />,
          bg: "bg-amber-500/10 border-amber-500/20",
          text: "text-amber-600 dark:text-amber-400",
          label: "Chờ thanh toán",
        };
      case BookingStatus.CHECKED_IN:
        return {
          icon: <DoorOpen className="w-3.5 h-3.5" />,
          bg: "bg-blue-500/10 border-blue-500/20",
          text: "text-blue-600 dark:text-blue-400",
          label: "Đã nhận phòng",
        };
      case BookingStatus.CONFIRMED:
        return {
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
          bg: "bg-emerald-500/10 border-emerald-500/20",
          text: "text-emerald-600 dark:text-emerald-400",
          label: "Đã xác nhận",
        };
      case BookingStatus.PARTIALLY_PAID:
        return {
          icon: <Coins className="w-3.5 h-3.5" />,
          bg: "bg-teal-500/10 border-teal-500/20",
          text: "text-teal-600 dark:text-teal-400",
          label: "Đã cọc (30%)",
        };
      case BookingStatus.CANCELLED || BookingStatus.CANCELLED_BY_ADMIN:
        return {
          icon: <XCircle className="w-3.5 h-3.5" />,
          bg: "bg-rose-500/10 border-rose-500/20",
          text: "text-rose-600 dark:text-rose-400",
          label: "Đã hủy",
        };
      case BookingStatus.CHECKED_OUT:
        return {
          icon: <LogOut className="w-3.5 h-3.5" />,
          bg: "bg-slate-500/10 border-slate-500/20",
          text: "text-slate-600 dark:text-slate-400",
          label: "Đã trả phòng",
        };
      case BookingStatus.WAITING_REFUND:
        return {
          icon: <RefreshCw className="w-3.5 h-3.5 animate-spin" />,
          bg: "bg-orange-500/10 border-orange-500/20",
          text: "text-orange-600 dark:text-orange-400",
          label: "Đang chờ hoàn tiền",
        };
      case BookingStatus.REFUNDED:
        return {
          icon: <DollarSign className="w-3.5 h-3.5" />,
          bg: "bg-pink-500/10 border-pink-500/20",
          text: "text-pink-600 dark:text-pink-400",
          label: "Đã hoàn tiền",
        };
      default:
        return {
          icon: null,
          bg: "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700",
          text: "text-slate-500 dark:text-slate-400",
          label: "Trạng thái không xác định",
        };
    }
  };

  const { icon, bg, text, label } = getStatusConfig();

  return (
    <div
      className={`px-4 py-1.5 rounded-full flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider backdrop-blur-md border transition-all duration-300 ${bg} ${text} ${className}`}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
};
