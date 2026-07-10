import type { Socket } from "socket.io-client";

export interface IMessage {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  isRead: boolean;
  unreadCount?: number;
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

export type ChatNotificationPayload = {
  id: number;
  conversationId: number;
  senderId: number;
  senderName?: string;
  content: string;
  isRead?: boolean;
  unreadCount?: number;
  createdAt: string;
};

export type TypingUser = {
  firstName: string;
  lastName: string;
};

export interface ChatContextType {
  socket: Socket | null;
  conversations: IConversation[];
  activeConversation: IConversation | null;
  messages: IMessage[];
  unreadCount: number;
  isTyping: boolean;
  typingUser: TypingUser | null;
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  selectConversation: (conversationId: number) => Promise<void>;
  sendMessage: (content: string) => void;
  sendTypingStatus: (isTyping: boolean) => void;
  createOrGetConversation: (
    hostId: number,
    roomId?: number,
    guestId?: number,
  ) => Promise<number>;
  refreshConversations: () => Promise<void>;
  markConversationAsRead: (conversationId: number) => void;
}
