import { Message } from "@/types/chatbot";

export const SUGGESTIONS = [
  "Gợi ý phòng ở Đà Nẵng",
  "Địa điểm đang có phòng",
  "Ưu đãi khách hàng thân thiết",
  "Chính sách hoàn hủy",
];

export const INITIAL_MESSAGES: Message[] = [
  {
    id: 1,
    role: "assistant",
    content:
      "Xin chào. Mình là trợ lý AI của 4Stay. Bạn cần tìm phòng, xem chính sách hay kiểm tra ưu đãi thành viên?",
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  },
];

export const STORAGE_KEY = "4stay_chat_history";

export const ERROR_MESSAGES = {
  DEFAULT:
    "Hiện tại tôi đang gặp khó khăn khi kết nối. Bạn vui lòng thử lại sau.",

  OFFLINE: "Bạn đang offline. Vui lòng kiểm tra kết nối mạng.",

  RATE_LIMIT:
    "Hệ thống AI đang quá tải hoặc đã hết lượt sử dụng. Bạn vui lòng thử lại sau.",

  TIMEOUT: "Yêu cầu đang mất quá nhiều thời gian xử lý. Vui lòng thử lại.",

  SERVER_ERROR: "Máy chủ AI đang gặp sự cố. Vui lòng thử lại sau ít phút.",

  UNAUTHORIZED: "Hệ thống AI chưa được cấu hình đúng.",

  REQUEST_FAILED:
    "Hiện tại tôi đang gặp khó khăn khi kết nối. Bạn vui lòng thử lại sau giây lát.",

  EMPTY: "Tôi chưa hiểu. Bạn hỏi rõ hơn được không?",
};
