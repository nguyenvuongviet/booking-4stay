"use client";

import {
  isChatPage,
  markConversationReadLocally,
  normalizeConversations,
} from "@/_helper/chat-realtime.helper";
import { getConversationUnreadCount } from "@/_helper/chat.helper";
import { useChatNotifications } from "@/_hooks/useChatNotifications";
import { useChatSocket } from "@/_hooks/useChatSocket";
import {
  createConversation,
  getConversations,
  getMessages,
} from "@/services/chatApi";
import {
  ChatContextType,
  IConversation,
  IMessage,
  TypingUser,
} from "@/types/chat";
import { usePathname } from "next/navigation";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";
import { useAuth } from "./auth-context";

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const pathname = usePathname();

  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [activeConversation, setActiveConversation] =
    useState<IConversation | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<TypingUser | null>(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const activeConversationRef = useRef<IConversation | null>(null);
  const conversationsRef = useRef<IConversation[]>([]);
  const pathnameRef = useRef(pathname);

  useEffect(() => {
    activeConversationRef.current = activeConversation;
  }, [activeConversation]);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  const refreshConversations = useCallback(async () => {
    if (!user) return;
    setIsLoadingConversations(true);
    try {
      const conversationList = await getConversations();
      setConversations(normalizeConversations(conversationList));
    } catch (error) {
      console.error("Lỗi khi tải danh sách hội thoại:", error);
    } finally {
      setIsLoadingConversations(false);
    }
  }, [user]);

  const markConversationAsRead = useCallback((conversationId: number) => {
    setConversations((previousConversations) =>
      markConversationReadLocally(previousConversations, conversationId),
    );
  }, []);

  const { showMessageToast } = useChatNotifications({
    enabled: Boolean(user),
    userId: user?.id,
    pathnameRef,
    activeConversationRef,
  });

  const socket = useChatSocket({
    user,
    activeConversationRef,
    conversationsRef,
    pathnameRef,
    refreshConversations,
    showMessageToast,
    setConversations,
    setActiveConversation,
    setMessages,
    setIsTyping,
    setTypingUser,
  });

  useEffect(() => {
    if (isChatPage(pathname) || !socket || !activeConversationRef.current) {
      return;
    }

    socket.emit("leave_conversation", {
      conversationId: activeConversationRef.current.id,
    });
    setActiveConversation(null);
    setMessages([]);
  }, [pathname, socket]);

  const selectConversation = useCallback(
    async (conversationId: number) => {
      setIsLoadingMessages(true);
      try {
        const found = conversations.find(
          (conversation) => conversation.id === conversationId,
        );
        if (!found) return;

        if (
          socket &&
          activeConversationRef.current &&
          activeConversationRef.current.id !== conversationId
        ) {
          socket.emit("leave_conversation", {
            conversationId: activeConversationRef.current.id,
          });
        }

        setActiveConversation(found);
        const messageList = await getMessages(conversationId, 40);
        setMessages(messageList);

        if (socket) {
          socket.emit("join_conversation", { conversationId, markRead: true });
        }
        markConversationAsRead(conversationId);
      } catch (error) {
        console.error("Lỗi khi tải lịch sử tin nhắn:", error);
      } finally {
        setIsLoadingMessages(false);
      }
    },
    [conversations, markConversationAsRead, socket],
  );

  const sendTypingStatus = useCallback(
    (typing: boolean) => {
      if (!socket || !activeConversation) return;
      socket.emit("typing", {
        conversationId: activeConversation.id,
        isTyping: typing,
      });
    },
    [activeConversation, socket],
  );

  const sendMessage = useCallback(
    (content: string) => {
      if (!socket || !activeConversation || !content.trim()) return;
      socket.emit("send_message", {
        conversationId: activeConversation.id,
        content: content.trim(),
      });
      sendTypingStatus(false);
    },
    [activeConversation, sendTypingStatus, socket],
  );

  const createOrGetConversation = useCallback(
    async (hostId: number, roomId?: number): Promise<number> => {
      try {
        const conversation = await createConversation(hostId, roomId);
        if (!conversation?.id) return 0;

        await refreshConversations();
        await selectConversation(conversation.id);
        return conversation.id;
      } catch (error) {
        console.error("Lỗi tạo cuộc trò chuyện:", error);
        toast.error("Không thể kết nối với Host lúc này.");
        return 0;
      }
    },
    [refreshConversations, selectConversation],
  );

  const unreadCount = conversations.reduce(
    (accumulator, conversation) =>
      user
        ? accumulator + getConversationUnreadCount(conversation, user.id)
        : accumulator,
    0,
  );

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
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useRealtimeChat must be used within ChatProvider");
  }
  return context;
};
