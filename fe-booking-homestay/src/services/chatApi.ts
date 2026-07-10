import { IConversation, IMessage } from "@/types/chat";
import api from "./api";

type ApiEnvelope<T> = {
  data?: T;
};

// Helper: bóc tách dữ liệu từ wrapper của ResponseSuccessInterceptor hoặc raw
function unwrapArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    const envelope = data as ApiEnvelope<unknown>;
    if (Array.isArray(envelope.data)) return envelope.data as T[];
  }
  return [];
}

function unwrapObject<T>(data: unknown): T | null {
  if (data && typeof data === "object") {
    const envelope = data as ApiEnvelope<T>;
    return (envelope.data ?? data) as T;
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
  page = 1,
): Promise<IMessage[]> {
  const res = await api.get(
    `/message/conversations/${conversationId}/messages?limit=${limit}&page=${page}`,
  );
  return unwrapArray<IMessage>(res.data);
}

/**
 * Tạo mới hoặc lấy cuộc hội thoại giữa Guest và Host
 */
export async function createConversation(
  hostId: number,
  roomId?: number,
  guestId?: number,
): Promise<{ id: number } | null> {
  const res = await api.post("/message/conversations", {
    hostId,
    roomId,
    guestId,
  });
  return unwrapObject<{ id: number }>(res.data);
}

/**
 * Đánh dấu đã đọc tất cả tin nhắn của đối phương trong hội thoại
 */
export async function markConversationRead(
  conversationId: number,
): Promise<void> {
  await api.post(`/message/conversations/${conversationId}/read`);
}

export async function getPushPublicKey(): Promise<{
  publicKey: string;
  enabled: boolean;
}> {
  const res = await api.get("/message/push/public-key");
  return (
    unwrapObject<{ publicKey: string; enabled: boolean }>(res.data) ?? {
      publicKey: "",
      enabled: false,
    }
  );
}

export async function savePushSubscription(
  subscription: PushSubscription,
): Promise<void> {
  await api.post("/message/push/subscribe", subscription.toJSON());
}

export async function deletePushSubscriptions(): Promise<void> {
  await api.post("/message/push/unsubscribe");
}
