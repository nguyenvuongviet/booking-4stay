export const BOOKING_STATUS_MAP = {
  ALL: {
    label: "Tất cả",
    colorClass: "",
  },
  PENDING: {
    label: "Chờ duyệt",
    colorClass: "bg-yellow-100 text-yellow-800 border border-yellow-300",
  },
  CONFIRMED: {
    label: "Xác nhận",
    colorClass: "bg-green-100 text-green-800 border border-green-300",
  },
  CHECKED_IN: {
    label: "Nhận phòng",
    colorClass: "bg-blue-100 text-blue-800 border border-blue-300",
  },
  CHECKED_OUT: {
    label: "Trả phòng",
    colorClass: "bg-purple-100 text-purple-800 border border-purple-300",
  },
  CANCELLED: {
    label: "Đã hủy",
    colorClass: "bg-red-100 text-red-800 border border-red-300",
  },
  REFUNDED: {
    label: "Hoàn tiền",
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
