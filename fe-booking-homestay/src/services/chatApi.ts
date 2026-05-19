import api from "./api";
import { IConversation, IMessage } from "@/context/ChatContext";

// Helper: bóc tách dữ liệu từ wrapper của ResponseSuccessInterceptor hoặc raw
function unwrapArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && Array.isArray((data as any).data))
    return (data as any).data as T[];
  return [];
}

function unwrapObject<T>(data: unknown): T | null {
  if (data && typeof data === "object") {
    const d = data as any;
    return (d.data ?? d) as T;
  }
  return null;
}

/**
 * Lấy danh sách hội thoại của người dùng hiện tại
 */
export async function getConversations(): Promise<IConversation[]> {
  const res = await api.get("/message/conversations");
  return unwrapArray<IConversation>(res.data);
}

/**
 * Lấy lịch sử tin nhắn của một cuộc hội thoại (phân trang)
 */
export async function getMessages(
  conversationId: number,
  limit = 40,
  page = 1
): Promise<IMessage[]> {
  const res = await api.get(
    `/message/conversations/${conversationId}/messages?limit=${limit}&page=${page}`
  );
  return unwrapArray<IMessage>(res.data);
}

/**
 * Tạo mới hoặc lấy cuộc hội thoại giữa Guest và Host
 */
export async function createConversation(
  hostId: number,
  roomId?: number
): Promise<{ id: number } | null> {
  const res = await api.post("/message/conversations", { hostId, roomId });
  return unwrapObject<{ id: number }>(res.data);
}

/**
 * Đánh dấu đã đọc tất cả tin nhắn của đối phương trong hội thoại
 */
export async function markConversationRead(
  conversationId: number
): Promise<void> {
  await api.post(`/message/conversations/${conversationId}/read`);
}
