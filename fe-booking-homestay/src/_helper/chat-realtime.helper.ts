import { STORAGE_KEYS } from "@/constants";
import { API_BASE_URL } from "@/constants/app.constant";
import {
  ChatNotificationPayload,
  IConversation,
  IMessage,
} from "@/types/chat";

export function getSocketUrl() {
  if (!API_BASE_URL) return "http://localhost:3000";
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    return API_BASE_URL.replace(/\/api\/?$/, "");
  }
}

export function isChatPage(pathname: string) {
  return pathname === "/inbox" || pathname === "/admin/chat";
}

export function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const currentUserRaw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!currentUserRaw) return null;
    return JSON.parse(currentUserRaw)?.accessToken ?? null;
  } catch {
    return null;
  }
}

export function normalizeConversations(
  conversations: IConversation[],
): IConversation[] {
  return conversations.map((conversation) => ({
    ...conversation,
    unreadCount: conversation.unreadCount ?? 0,
  }));
}

export function sortConversationsByUpdatedAt(
  conversations: IConversation[],
): IConversation[] {
  return [...conversations].sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export function markConversationReadLocally(
  conversations: IConversation[],
  conversationId: number,
): IConversation[] {
  return conversations.map((conversation) =>
    conversation.id === conversationId
      ? {
          ...conversation,
          unreadCount: 0,
          lastMessage: conversation.lastMessage
            ? { ...conversation.lastMessage, isRead: true }
            : null,
        }
      : conversation,
  );
}

export function applyNotificationToConversations({
  conversations,
  payload,
  activeConversationId,
  userId,
  isInboxPage,
}: {
  conversations: IConversation[];
  payload: ChatNotificationPayload;
  activeConversationId?: number;
  userId?: string | number;
  isInboxPage: boolean;
}): IConversation[] {
  const isActiveInboxConversation =
    isInboxPage && activeConversationId === payload.conversationId;

  return sortConversationsByUpdatedAt(
    conversations.map((conversation) => {
      if (conversation.id !== payload.conversationId) return conversation;

      const alreadyApplied = conversation.lastMessage?.id === payload.id;
      const shouldIncreaseUnread =
        !isActiveInboxConversation &&
        String(payload.senderId) !== String(userId) &&
        !alreadyApplied;
      const nextUnreadCount = isActiveInboxConversation
        ? 0
        : typeof payload.unreadCount === "number"
          ? payload.unreadCount
          : shouldIncreaseUnread
            ? (conversation.unreadCount ?? 0) + 1
            : (conversation.unreadCount ?? 0);

      return {
        ...conversation,
        unreadCount: nextUnreadCount,
        lastMessage: {
          id: payload.id,
          content: payload.content,
          senderId: payload.senderId,
          isRead: isActiveInboxConversation,
          createdAt: payload.createdAt,
        },
        updatedAt: new Date(payload.createdAt).toISOString(),
      };
    }),
  );
}

export function applyMessageToConversations({
  conversations,
  message,
  userId,
  increaseUnread,
}: {
  conversations: IConversation[];
  message: IMessage;
  userId?: string | number;
  increaseUnread: boolean;
}): IConversation[] {
  return sortConversationsByUpdatedAt(
    conversations.map((conversation) => {
      if (conversation.id !== message.conversationId) return conversation;

      const unreadCount = increaseUnread
        ? typeof message.unreadCount === "number"
          ? message.unreadCount
          : (conversation.unreadCount ?? 0) + 1
        : (conversation.unreadCount ?? 0);

      return {
        ...conversation,
        unreadCount,
        lastMessage: {
          id: message.id,
          content: message.content,
          senderId: message.senderId,
          isRead:
            String(message.senderId) === String(userId)
              ? message.isRead
              : increaseUnread
                ? false
                : (conversation.lastMessage?.isRead ?? message.isRead),
          createdAt: message.createdAt,
        },
        updatedAt: new Date(message.createdAt).toISOString(),
      };
    }),
  );
}

export function toNotificationPayload(
  message: IMessage,
): ChatNotificationPayload {
  return {
    id: message.id,
    conversationId: message.conversationId,
    senderId: message.senderId,
    senderName: message.sender?.firstName,
    content: message.content,
    isRead: message.isRead,
    unreadCount: message.unreadCount,
    createdAt: message.createdAt,
  };
}

export function getMessagePreview(content: string, maxLength = 40) {
  return content.length > maxLength
    ? `${content.slice(0, maxLength)}...`
    : content;
}
