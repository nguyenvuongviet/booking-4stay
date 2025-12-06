export const BOOKING_STATUS_MAP = {
  ALL: {
    label: "Tất cả",
    colorClass: "",
  },
  PENDING: {
    label: "Chờ duyệt",
    colorClass: "bg-yellow-100 text-yellow-800 border border-yellow-300",
  },
  PARTIALLY_PAID: {
    label: "Thanh toán một phần",
    colorClass: "bg-amber-100 text-amber-800 border border-amber-300",
  },
  CONFIRMED: {
    label: "Đã xác nhận",
    colorClass: "bg-green-100 text-green-800 border border-green-300",
  },
  CHECKED_IN: {
    label: "Đã nhận phòng",
    colorClass: "bg-blue-100 text-blue-800 border border-blue-300",
  },
  CHECKED_OUT: {
    label: "Đã trả phòng",
    colorClass: "bg-purple-100 text-purple-800 border border-purple-300",
  },
  CANCELLED: {
    label: "Đã hủy",
    colorClass: "bg-red-100 text-red-800 border border-red-300",
  },
  WAITING_REFUND: {
    label: "Chờ hoàn tiền",
    colorClass: "bg-orange-100 text-orange-800 border border-orange-300",
  },
  REFUNDED: {
    label: "Đã hoàn tiền",
    colorClass: "bg-pink-100 text-pink-800 border border-pink-300",
  },
};

const DEFAULT_STATUS = {
  label: "Không rõ",
  colorClass: "bg-gray-100 text-gray-600 border",
};

export function getStatusInfo(status: string) {
  return (
    BOOKING_STATUS_MAP[status as keyof typeof BOOKING_STATUS_MAP] ||
    DEFAULT_STATUS
  );
}

export function translateStatus(status: string) {
  return getStatusInfo(status).label;
}

export function getStatusColorClasses(status: string) {
  return getStatusInfo(status).colorClass;
}
