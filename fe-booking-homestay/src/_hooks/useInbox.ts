"use client";

import { getPartner } from "@/_helper/chat.helper";
import { useAuth } from "@/context/auth-context";
import { IConversation, useRealtimeChat } from "@/context/ChatContext";
import { useMemo, useRef, useState } from "react";

export type FilterType = "all" | "unread";

export function useInbox() {
  const { user } = useAuth();
  const { conversations, sendMessage, sendTypingStatus } = useRealtimeChat();

  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  // Mobile: null = danh sách, "chat" = khung chat
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Danh sách hội thoại đã lọc theo search + tab
  const filteredConversations = useMemo(() => {
    if (!user) return [];
    return conversations.filter((conv: IConversation) => {
      const partner = getPartner(conv, user.id);
      const partnerName =
        `${partner.firstName} ${partner.lastName}`.toLowerCase();
      const roomName = conv.room?.name.toLowerCase() ?? "";
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        partnerName.includes(q) || roomName.includes(q);
      if (filterType === "unread") {
        return matchesSearch && (conv.unreadCount ?? 0) > 0;
      }
      return matchesSearch;
    });
  }, [conversations, searchQuery, filterType, user]);

  // Gửi tin nhắn
  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText("");
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      sendTypingStatus(false);
    }
  };

  // Xử lý thay đổi input (typing indicator)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    sendTypingStatus(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => sendTypingStatus(false), 2000);
  };

  // Gửi luôn một template
  const handleSelectTemplate = (template: string) => {
    sendMessage(template);
  };

  return {
    user,
    inputText,
    setInputText,
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    mobileView,
    setMobileView,
    filteredConversations,
    handleSend,
    handleInputChange,
    handleSelectTemplate,
  };
}
