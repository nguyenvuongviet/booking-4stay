"use client";

import {
  applyMessageToConversations,
  applyNotificationToConversations,
  getSocketUrl,
  getStoredAccessToken,
  isChatPage,
  toNotificationPayload,
} from "@/_helper/chat-realtime.helper";
import {
  ChatNotificationPayload,
  IConversation,
  IMessage,
  TypingUser,
} from "@/types/chat";
import { IUser } from "@/models/User";
import { Dispatch, RefObject, SetStateAction, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

type UseChatSocketParams = {
  user: IUser | null;
  activeConversationRef: RefObject<IConversation | null>;
  conversationsRef: RefObject<IConversation[]>;
  pathnameRef: RefObject<string>;
  refreshConversations: () => Promise<void>;
  showMessageToast: (payload: ChatNotificationPayload) => void;
  setConversations: Dispatch<SetStateAction<IConversation[]>>;
  setActiveConversation: Dispatch<SetStateAction<IConversation | null>>;
  setMessages: Dispatch<SetStateAction<IMessage[]>>;
  setIsTyping: Dispatch<SetStateAction<boolean>>;
  setTypingUser: Dispatch<SetStateAction<TypingUser | null>>;
};

export function useChatSocket({
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
}: UseChatSocketParams) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!user) {
      setSocket(null);
      setConversations([]);
      setActiveConversation(null);
      setMessages([]);
      return;
    }

    refreshConversations();

    const accessToken = getStoredAccessToken();
    if (!accessToken) return;

    const socketClient = io(`${getSocketUrl()}/chat`, {
      auth: { token: accessToken },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    setSocket(socketClient);

    socketClient.on("connect", () => {
      console.log("[Socket] Connected");
      if (activeConversationRef.current) {
        socketClient.emit("join_conversation", {
          conversationId: activeConversationRef.current.id,
          markRead: isChatPage(pathnameRef.current),
        });
      }
    });

    socketClient.on("new_message", (message: IMessage) => {
      const activeConversation = activeConversationRef.current;
      const isActiveInboxConversation =
        isChatPage(pathnameRef.current) &&
        activeConversation?.id === message.conversationId;
      const isOwnMessage = String(message.senderId) === String(user.id);

      if (isActiveInboxConversation && activeConversation) {
        setMessages((previousMessages) => {
          if (previousMessages.some((item) => item.id === message.id)) {
            return previousMessages;
          }
          return [...previousMessages, message];
        });

        if (!isOwnMessage && isChatPage(pathnameRef.current)) {
          socketClient.emit("join_conversation", {
            conversationId: activeConversation.id,
            markRead: true,
          });
        }
      } else {
        if (!isOwnMessage) showMessageToast(toNotificationPayload(message));
      }

      setConversations((previousConversations) => {
        const found = previousConversations.some(
          (conversation) => conversation.id === message.conversationId,
        );

        if (!found) {
          refreshConversations();
          return previousConversations;
        }

        return applyMessageToConversations({
          conversations: previousConversations,
          message,
          userId: user.id,
          increaseUnread: !isActiveInboxConversation && !isOwnMessage,
        });
      });
    });

    socketClient.on(
      "read_status_updated",
      (payload: { conversationId: number; readBy: number }) => {
        if (activeConversationRef.current?.id !== payload.conversationId) {
          return;
        }

        setMessages((previousMessages) =>
          previousMessages.map((message) =>
            message.senderId !== payload.readBy
              ? { ...message, isRead: true }
              : message,
          ),
        );
      },
    );

    socketClient.on(
      "typing_status",
      (payload: {
        conversationId: number;
        senderId: number;
        isTyping: boolean;
      }) => {
        const activeConversation = activeConversationRef.current;
        if (!activeConversation || payload.conversationId !== activeConversation.id) {
          return;
        }

        setIsTyping(payload.isTyping);
        if (!payload.isTyping) {
          setTypingUser(null);
          return;
        }

        const sender =
          activeConversation.guestId === payload.senderId
            ? activeConversation.guest
            : activeConversation.host;

        setTypingUser({
          firstName: sender.firstName,
          lastName: sender.lastName,
        });
      },
    );

    socketClient.on("receive_message", (payload: ChatNotificationPayload) => {
      const knownConversation = conversationsRef.current.some(
        (conversation) => conversation.id === payload.conversationId,
      );

      if (!knownConversation) {
        refreshConversations();
        showMessageToast(payload);
        return;
      }

      setConversations((previousConversations) =>
        applyNotificationToConversations({
          conversations: previousConversations,
          payload,
          activeConversationId: activeConversationRef.current?.id,
          userId: user.id,
          isInboxPage: isChatPage(pathnameRef.current),
        }),
      );
      showMessageToast(payload);
    });

    socketClient.on(
      "unread_notification",
      (payload: { conversationId: number }) => {
        if (activeConversationRef.current?.id !== payload.conversationId) {
          refreshConversations();
        }
      },
    );

    return () => {
      socketClient.disconnect();
    };
  }, [
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
  ]);

  return socket;
}
