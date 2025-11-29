import { CheckCheck, CheckCircle, Clock, XCircle } from "lucide-react";
import React from "react";

interface BookingStatusBadgeProps {
  status:
    | "PENDING"
    | "CONFIRMED"
    | "CANCELLED"
    | "COMPLETED"
    | "CHECKED_OUT"
    | "REDEEMED";
  className?: string;
}

export const BookingStatusBadge: React.FC<BookingStatusBadgeProps> = ({
  status,
  className = "",
}) => {
  const getStatusStyles = () => {
    switch (status) {
      case "CONFIRMED":
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          color: "bg-green-100 text-green-700",
          label: "Confirmed",
        };
      case "PENDING":
        return {
          icon: <Clock className="w-4 h-4" />,
          color: "bg-yellow-100 text-yellow-700",
          label: "Pending",
        };
      case "CANCELLED":
        return {
          icon: <XCircle className="w-4 h-4" />,
          color: "bg-red-100 text-red-700",
          label: "Cancelled",
        };
      case "COMPLETED":
        return {
          icon: <CheckCheck className="w-4 h-4" />,
          color: "bg-blue-100 text-blue-700",
          label: "Completed",
        };
      case "CHECKED_OUT":
        return {
          icon: <CheckCheck className="w-4 h-4" />,
          color: "bg-blue-100 text-blue-700",
          label: "Completed",
        };
      case "REDEEMED":
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          color: "bg-red-100 text-red-700",
          label: "Redeemed",
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
      className={`px-2 py-1 rounded-xl flex items-center gap-1 shadow-sm ${color} ${className}`}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
};
