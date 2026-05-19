"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./auth-context";
import { STORAGE_KEYS } from "@/constants";
import { API_BASE_URL } from "@/constants/app.constant";
import toast from "react-hot-toast";
import {
  getConversations,
  getMessages,
  createConversation,
} from "@/services/chatApi";

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface IMessage {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender?: {
    id: number;
    firstName: string;
    lastName: string;
    avatar: string | "/default-avatar.png";
  };
}

export interface IConversation {
  id: number;
  guestId: number;
  hostId: number;
  roomId: number | null;
  createdAt: string;
  updatedAt: string;
  guest: {
    id: number;
    firstName: string;
    lastName: string;
    avatar: string | null;
    email: string;
  };
  host: {
    id: number;
    firstName: string;
    lastName: string;
    avatar: string | null;
    email: string;
  };
  room: {
    id: number;
    name: string;
    price: number;
    imageUrl: string | null;
  } | null;
  lastMessage: {
    id: number;
    content: string;
    senderId: number;
    isRead: boolean;
    createdAt: string;
  } | null;
  unreadCount?: number;
}

interface ChatContextType {
  socket: Socket | null;
  conversations: IConversation[];
  activeConversation: IConversation | null;
  messages: IMessage[];
  unreadCount: number;
  isTyping: boolean;
  typingUser: { firstName: string; lastName: string } | null;
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  selectConversation: (conversationId: number) => Promise<void>;
  sendMessage: (content: string) => void;
  sendTypingStatus: (isTyping: boolean) => void;
  createOrGetConversation: (hostId: number, roomId?: number) => Promise<number>;
  refreshConversations: () => Promise<void>;
  markConversationAsRead: (conversationId: number) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getSocketUrl = () => {
  if (!API_BASE_URL) return "http://localhost:3000";
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    return API_BASE_URL.replace(/\/api\/?$/, "");
  }
};

// ─── Provider ────────────────────────────────────────────────────────────────

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<IConversation | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<{ firstName: string; lastName: string } | null>(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const activeConversationRef = useRef<IConversation | null>(null);
  useEffect(() => {
    activeConversationRef.current = activeConversation;
  }, [activeConversation]);

  // ── REST: Lấy danh sách hội thoại ─────────────────────────────────────────
  const refreshConversations = useCallback(async () => {
    if (!user) return;
    setIsLoadingConversations(true);
    try {
      const convList = await getConversations();
      const formatted = convList.map((conv) => {
        const count =
          conv.lastMessage &&
          !conv.lastMessage.isRead &&
          String(conv.lastMessage.senderId) !== String(user.id)
            ? 1
            : 0;
        return { ...conv, unreadCount: count };
      });
      setConversations(formatted);
    } catch (err) {
      console.error("Lỗi khi tải danh sách hội thoại:", err);
    } finally {
      setIsLoadingConversations(false);
    }
  }, [user]);

  // ── Local: Đánh dấu đã đọc ───────────────────────────────────────────────
  const markConversationAsRead = useCallback((conversationId: number) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? { ...c, unreadCount: 0, lastMessage: c.lastMessage ? { ...c.lastMessage, isRead: true } : null }
          : c
      )
    );
  }, []);

  // ── Socket setup ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) {
      if (socket) { socket.disconnect(); setSocket(null); }
      setConversations([]);
      setActiveConversation(null);
      setMessages([]);
      return;
    }

    refreshConversations();

    const currentUserRaw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!currentUserRaw) return;
    const { accessToken } = JSON.parse(currentUserRaw);

    const socketClient = io(`${getSocketUrl()}/chat`, {
      auth: { token: accessToken },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    setSocket(socketClient);

    socketClient.on("connect", () => {
      console.log("[Socket] Connected");
      if (activeConversationRef.current) {
        socketClient.emit("join_conversation", { conversationId: activeConversationRef.current.id });
      }
    });

    socketClient.on("new_message", (message: IMessage) => {
      const activeConv = activeConversationRef.current;

      if (activeConv && message.conversationId === activeConv.id) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
        if (String(message.senderId) !== String(user.id)) {
          socketClient.emit("join_conversation", { conversationId: activeConv.id });
        }
      } else {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === message.conversationId
              ? { ...c, unreadCount: (c.unreadCount || 0) + 1, lastMessage: message }
              : c
          )
        );
        if (String(message.senderId) !== String(user.id)) {
          toast.success(
            `Tin nhắn mới từ ${message.sender?.firstName ?? "Host"}: "${
              message.content.length > 30
                ? message.content.slice(0, 30) + "…"
                : message.content
            }"`,
            { icon: "💬", duration: 3000 }
          );
        }
      }

      setConversations((prev) => {
        const found = prev.find((c) => c.id === message.conversationId);
        if (!found) { refreshConversations(); return prev; }
        return prev
          .map((c) =>
            c.id === message.conversationId
              ? { ...c, lastMessage: message, updatedAt: new Date().toISOString() }
              : c
          )
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      });
    });

    socketClient.on("read_status_updated", (payload: { conversationId: number; readBy: number }) => {
      if (activeConversationRef.current?.id === payload.conversationId) {
        setMessages((prev) =>
          prev.map((m) => (m.senderId !== payload.readBy ? { ...m, isRead: true } : m))
        );
      }
    });

    socketClient.on("typing_status", (payload: { conversationId: number; senderId: number; isTyping: boolean }) => {
      const activeConv = activeConversationRef.current;
      if (activeConv && payload.conversationId === activeConv.id) {
        setIsTyping(payload.isTyping);
        if (payload.isTyping) {
          const isGuestSender = activeConv.guestId === payload.senderId;
          const userTyping = isGuestSender ? activeConv.guest : activeConv.host;
          setTypingUser({ firstName: userTyping.firstName, lastName: userTyping.lastName });
        } else {
          setTypingUser(null);
        }
      }
    });

    socketClient.on("unread_notification", (payload: { conversationId: number }) => {
      if (!activeConversationRef.current || activeConversationRef.current.id !== payload.conversationId) {
        refreshConversations();
      }
    });

    return () => { socketClient.disconnect(); };
  }, [user, refreshConversations]);

  // ── REST: Chọn conversation ───────────────────────────────────────────────
  const selectConversation = async (conversationId: number) => {
    setIsLoadingMessages(true);
    try {
      const found = conversations.find((c) => c.id === conversationId);
      if (!found) return;
      setActiveConversation(found);
      const msgList = await getMessages(conversationId, 40);
      setMessages(msgList);
      if (socket) socket.emit("join_conversation", { conversationId });
      markConversationAsRead(conversationId);
    } catch (err) {
      console.error("Lỗi khi tải lịch sử tin nhắn:", err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // ── Socket: Gửi tin nhắn ─────────────────────────────────────────────────
  const sendMessage = (content: string) => {
    if (!socket || !activeConversation || !content.trim()) return;
    socket.emit("send_message", { conversationId: activeConversation.id, content: content.trim() });
    sendTypingStatus(false);
  };

  const sendTypingStatus = (typing: boolean) => {
    if (!socket || !activeConversation) return;
    socket.emit("typing", { conversationId: activeConversation.id, isTyping: typing });
  };

  // ── REST: Tạo hoặc lấy conversation ─────────────────────────────────────
  const createOrGetConversation = async (hostId: number, roomId?: number): Promise<number> => {
    try {
      const conv = await createConversation(hostId, roomId);
      if (!conv?.id) return 0;
      await refreshConversations();
      await selectConversation(conv.id);
      return conv.id;
    } catch (err) {
      console.error("Lỗi tạo cuộc trò chuyện:", err);
      toast.error("Không thể kết nối với Host lúc này.");
      return 0;
    }
  };

  const unreadCount = conversations.reduce((acc, c) => acc + (c.unreadCount ?? 0), 0);

  return (
    <ChatContext.Provider
      value={{
        socket,
        conversations,
        activeConversation,
        messages,
        unreadCount,
        isTyping,
        typingUser,
        isLoadingConversations,
        isLoadingMessages,
        selectConversation,
        sendMessage,
        sendTypingStatus,
        createOrGetConversation,
        refreshConversations,
        markConversationAsRead,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useRealtimeChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useRealtimeChat must be used within ChatProvider");
  return ctx;
};
