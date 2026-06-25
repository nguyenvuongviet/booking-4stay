"use client";

import { getConversationUnreadCount } from "@/_helper/chat.helper";
import { FilterType } from "@/_hooks/useInbox";
import { IConversation } from "@/types/chat";
import { ArrowLeft, Inbox, MessageSquare, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import ConversationItem from "./ConversationItem";

interface Props {
  userId: number | string;
  conversations: IConversation[];
  filteredConversations: IConversation[];
  activeConversationId?: number;
  isLoading: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterType: FilterType;
  setFilterType: (f: FilterType) => void;
  onSelect: (id: number) => void;
  backHref?: string;
}

export default function ConversationList({
  userId,
  conversations,
  filteredConversations,
  activeConversationId,
  isLoading,
  searchQuery,
  setSearchQuery,
  filterType,
  setFilterType,
  onSelect,
  backHref,
}: Props) {
  const router = useRouter();
  const hasUnread = conversations.some(
    (c) => getConversationUnreadCount(c, userId) > 0,
  );

  return (
    <div className="flex h-full flex-col border-r border-white/30 dark:border-white/10 bg-white/20 dark:bg-black/20 backdrop-blur-2xl shadow-[8px_0_30px_-15px_rgba(0,0,0,0.1)]">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-4 border-b border-white/30 dark:border-white/10 shrink-0 bg-white/10 dark:bg-black/10">
        {/* Nút Back về trang trước */}
        <button
          onClick={() => (backHref ? router.push(backHref) : router.back())}
          className="flex items-center justify-center h-9 w-9 rounded-full  dark:border-white/10 bg-white/50 dark:bg-white/5 text-muted-foreground hover:bg-white/80 dark:hover:bg-white/10 hover:text-primary transition-all duration-200 cursor-pointer shrink-0 shadow-md"
          title="Quay lại"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <Inbox className="h-5 w-5 text-primary" />
          <div className="min-w-0">
            <h1 className="text-base font-extrabold tracking-tight text-foreground truncate">
              Hộp thư
            </h1>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-2 pb-4 shrink-0">
        <div className="flex items-center gap-2 rounded-2xl border border-primary/20 dark:border-white/10 bg-white/30 dark:bg-white/5 px-3 py-2.5 focus-within:border-primary/50 focus-within:bg-white/50 dark:focus-within:bg-white/10 shadow-inner backdrop-blur-md transition-all duration-300">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Tìm khách hàng hoặc chủ homestay..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-[13px] text-foreground placeholder-muted outline-none"
          />
        </div>
      </div>

      {/*  Filter tabs  */}
      <div className="flex gap-2 px-4 pb-2 border-b border-white/30 dark:border-white/10 text-xs shrink-0">
        <button
          onClick={() => setFilterType("all")}
          className={`flex-1 rounded-xl py-2 font-semibold transition-all cursor-pointer backdrop-blur-sm ${
            filterType === "all"
              ? "bg-primary/90 text-white shadow-[0_4px_12px_rgba(17,84,160,0.3)] border border-primary/50"
              : "text-muted-foreground bg-secondary/10 dark:bg-secondary/10 hover:bg-primary/40 dark:hover:bg-primary/10 hover:text-white"
          }`}
        >
          Tất cả
        </button>
        <button
          onClick={() => setFilterType("unread")}
          className={`flex-1 rounded-xl py-2 font-semibold transition-all cursor-pointer relative backdrop-blur-sm ${
            filterType === "unread"
              ? "bg-primary/90 text-white shadow-[0_4px_12px_rgba(17,84,160,0.3)] border border-primary/50"
              : "text-muted-foreground bg-secondary/10 dark:bg-secondary/10 hover:bg-primary/40 dark:hover:bg-primary/10 hover:text-white"
          }`}
        >
          Chưa đọc
          {hasUnread && (
            <span className="absolute top-2 right-3 h-2 w-2 rounded-full bg-red-500" />
          )}
        </button>
      </div>

      {/* ── Conversation list ───────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1 custom-scrollbar">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-xs text-muted-foreground">
              Đang tải cuộc trò chuyện...
            </span>
          </div>
        ) : filteredConversations.length === 0 ? (
          // message trống
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/5 border border-primary/10 mb-3">
              <MessageSquare className="h-8 w-8 text-primary/50" />
            </div>
            <span className="text-sm font-semibold text-foreground">
              Không có hội thoại
            </span>
            <p className="text-[11px] text-muted-foreground mt-1.5 max-w-50 leading-relaxed">
              {filterType === "unread"
                ? "Bạn đã đọc hết toàn bộ tin nhắn rồi!"
                : "Hãy truy cập trang Homestay và chọn Nhắn tin với Host!"}
            </p>
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <ConversationItem
              key={conv.id}
              conv={conv}
              userId={userId}
              isSelected={activeConversationId === conv.id}
              onSelect={onSelect}
            />
          ))
        )}
      </div>
    </div>
  );
}
