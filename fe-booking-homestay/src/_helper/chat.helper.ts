import { IConversation } from "@/context/ChatContext";

// Định dạng giờ hiển thị (HH:mm)
export function formatTime(dateStr: string): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

// Định dạng nhãn ngày cho feed tin nhắn. Trả về "Hôm nay" hoặc "Thứ X, ngày Y tháng Z"
export function formatDateHeader(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return "Hôm nay";
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  } catch {
    return "";
  }
}

// Xác định đối phương trong cuộc hội thoại
export function getPartner(
  conv: IConversation,
  userId: number | string
): IConversation["host"] | IConversation["guest"] {
  return String(conv.guestId) === String(userId) ? conv.host : conv.guest;
}

// Rút ngắn nội dung tin nhắn nếu quá dài
export function truncateMessage(content: string, maxLen = 40): string {
  if (!content) return "";
  return content.length > maxLen ? content.slice(0, maxLen) + "…" : content;
}

// Xử lý URL ảnh từ backend
export function getImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("http")) return url;

  // đảm bảo có gạch chéo đầu tiên
  let finalPath = url.startsWith("/") ? url : `/${url}`;

  // Nếu url không có extension, thêm .jpg mặc định theo cloudinary
  if (!/\.(jpg|jpeg|png|gif|webp|bmp|svg|mp4|pdf)$/i.test(finalPath)) {
    finalPath += ".jpg";
  }

  return `https://res.cloudinary.com/nguyenvuongviet/image/upload/v1758970908${finalPath}`;
}
