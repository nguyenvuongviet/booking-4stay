"use client";

import {
  formatTime,
  getConversationUnreadCount,
  getImageUrl,
  getPartner,
} from "@/_helper/chat.helper";
import { IConversation } from "@/types/chat";
import Image from "next/image";

interface Props {
  conv: IConversation;
  userId: number | string;
  isSelected: boolean;
  onSelect: (id: number) => void;
}

export default function ConversationItem({
  conv,
  userId,
  isSelected,
  onSelect,
}: Props) {
  const partner = getPartner(conv, userId);
  const unread = getConversationUnreadCount(conv, userId);
  const isMe = conv.lastMessage
    ? String(conv.lastMessage.senderId) === String(userId)
    : false;

  return (
    <button
      onClick={() => onSelect(conv.id)}
      className={`flex w-full items-start gap-3 rounded-2xl px-3 py-3 mb-2 transition-all duration-200 text-left cursor-pointer relative border backdrop-blur-md ${
        isSelected
          ? "bg-primary/10 border-primary/30 shadow-md shadow-primary/10"
          : "bg-transparent border-border/50 hover:bg-white/30 dark:hover:bg-white/10 hover:border-primary/20 dark:hover:border-primary/10 shadow-none hover:shadow-sm"
      }`}
    >
      {/* Avatar */}
      <div className="relative h-11 w-11 shrink-0 rounded-2xl overflow-hidden bg-white/40 dark:bg-white/10 border border-white/40 dark:border-white/20 shadow-sm backdrop-blur-md">
        {partner.avatar ? (
          <Image
            src={getImageUrl(partner.avatar) || "/default-avatar.png"}
            alt={`${partner.firstName} ${partner.lastName}`}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-tr from-primary/20 to-blue-500/20 text-sm font-extrabold text-primary">
            {partner.firstName.charAt(0).toUpperCase()}
          </div>
        )}
        {/* Online indicator */}
        {/* <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-background shadow-sm" /> */}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <h4
            className={`text-sm font-bold truncate leading-tight ${unread > 0 ? "text-foreground" : "text-foreground/80"}`}
          >
            {partner.firstName} {partner.lastName}
          </h4>
          {/* Unread badge */}
          {unread > 0 && (
            <span className="ml-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white shadow-sm">
              {unread}
            </span>
          )}
        </div>

        {conv.room && (
          <span className="inline-block mb-0.5 text-[9px] font-medium bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded-lg truncate max-w-full backdrop-blur-sm">
            🏡 {conv.room.name}
          </span>
        )}

        <div className="flex items-center justify-between gap-2">
          <p
            className={`flex-1 text-xs truncate leading-relaxed ${
              unread > 0
                ? "font-semibold text-foreground"
                : "text-muted-foreground"
            }`}
          >
            {conv.lastMessage
              ? isMe
                ? `Bạn: ${conv.lastMessage.content}`
                : conv.lastMessage.content
              : "Chưa có tin nhắn"}
          </p>

          {conv.lastMessage && (
            <span className="shrink-0 whitespace-nowrap text-[10px] text-muted-foreground">
              {formatTime(conv.lastMessage.createdAt)}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
