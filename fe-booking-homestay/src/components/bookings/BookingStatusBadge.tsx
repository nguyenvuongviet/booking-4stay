import React from "react";
import { CheckCircle, Clock, XCircle, CheckCheck } from "lucide-react";

interface BookingStatusBadgeProps {
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
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
          color: "bg-green-500",
          label: "Confirmed",
        };
      case "PENDING":
        return {
          icon: <Clock className="w-4 h-4" />,
          color: "bg-yellow-500",
          label: "Pending",
        };
      case "CANCELLED":
        return {
          icon: <XCircle className="w-4 h-4" />,
          color: "bg-red-500",
          label: "Cancelled",
        };
      case "COMPLETED":
        return {
          icon: <CheckCheck className="w-4 h-4" />,
          color: "bg-blue-500",
          label: "Completed",
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
      className={`text-white px-2 py-1 rounded-xl flex items-center gap-1 shadow-sm ${color} ${className}`}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
};
