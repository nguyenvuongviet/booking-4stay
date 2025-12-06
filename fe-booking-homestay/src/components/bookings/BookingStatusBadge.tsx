import { useLang } from "@/context/lang-context";
import { CheckCheck, CheckCircle, Clock, XCircle } from "lucide-react";
import React from "react";

interface BookingStatusBadgeProps {
  status:
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "CHECKED_IN"
  | "CHECKED_OUT"
  | "PARTIALLY_PAID"
  | "WAITING_REFUND"
  | "REFUNDED";
  className?: string;
}

export const BookingStatusBadge: React.FC<BookingStatusBadgeProps> = ({
  status,
  className = "",
}) => {
  const { t } = useLang();
  const getStatusStyles = () => {
    switch (status) {
      case "PENDING":
        return {
          icon: <Clock className="w-4 h-4" />,
          color: "bg-yellow-100 text-yellow-700 text-sm",
          label: t("Pending"),
        };
      case "CHECKED_IN":
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          color: "bg-green-100 text-green-700 text-sm",
          label: t("Confirmed"),
        };
      case "CONFIRMED":
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          color: "bg-green-100 text-green-700 text-sm",
          label: t("Confirmed"),
        };
      case "PARTIALLY_PAID":
        return {
          icon: <CheckCheck className="w-4 h-4" />,
          color: "bg-blue-100 text-blue-700 text-sm",
          label: t("Confirmed"),
        };
      case "CANCELLED":
        return {
          icon: <XCircle className="w-4 h-4" />,
          color: "bg-red-100 text-red-700 text-sm",
          label: t("Cancelled"),
        };
      case "CHECKED_OUT":
        return {
          icon: <CheckCheck className="w-4 h-4" />,
          color: "bg-blue-100 text-blue-700 text-sm",
          label: t("Completed"),
        };
      case "WAITING_REFUND":
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          color: "bg-red-100 text-red-700 text-sm",
          label: t("Refund"),
        };
      case "REFUNDED":
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          color: "bg-red-100 text-red-700 text-sm",
          label: t("Refunded"),
        };
      default:
        return {
          icon: null,
          color: "bg-gray-400",
          label: "Unknown",
        };
    }
  };

  const { icon, color, label } = getStatusStyles();

  return (
    <div
      className={`px-3 py-2 rounded-xl flex items-center gap-1 shadow-sm ${color} ${className}`}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
};
