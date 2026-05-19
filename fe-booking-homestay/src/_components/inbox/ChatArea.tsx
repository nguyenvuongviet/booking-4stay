"use client";

import { getImageUrl, getPartner } from "@/_helper/chat.helper";
import { IConversation, IMessage } from "@/context/ChatContext";
import { ArrowLeft, Send, Smile, Sparkles } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";
import MessageBubble from "./MessageBubble";
import QuickTemplates from "./QuickTemplates";
import TypingIndicator from "./TypingIndicator";

interface Props {
  userId: number | string;
  activeConversation: IConversation;
  messages: IMessage[];
  isLoadingMessages: boolean;
  isTyping: boolean;
  typingUser: { firstName: string; lastName: string } | null;
  inputText: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSend: (e?: React.FormEvent) => void;
  onSelectTemplate: (t: string) => void;
  onBack?: () => void;
  onToggleInfo?: () => void;
}

export default function ChatArea({
  userId,
  activeConversation,
  messages,
  isLoadingMessages,
  isTyping,
  typingUser,
  inputText,
  onInputChange,
  onSend,
  onSelectTemplate,
  onBack,
  onToggleInfo,
}: Props) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const partner = getPartner(activeConversation, userId);
  const isHost = String(activeConversation.hostId) === String(userId);

  return (
    <div className="flex h-full flex-col bg-transparent">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-white/30 dark:border-white/10 bg-white/20 dark:bg-black/20 backdrop-blur-2xl shrink-0 shadow-[0_4px_30px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-3">
          {/* Back to list (mobile) */}
          {onBack && (
            <button
              onClick={onBack}
              className="flex md:hidden items-center justify-center h-9 w-9 rounded-full  dark:border-white/10 bg-white/50 dark:bg-white/5 text-muted-foreground hover:bg-white/80 dark:hover:bg-white/10 hover:text-primary transition-all duration-200 cursor-pointer shrink-0 shadow-md"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}

          {/* Partner avatar */}
          <div className="relative h-10 w-10 rounded-2xl overflow-hidden bg-secondary border border-border shrink-0">
            {partner.avatar ? (
              <Image
                src={getImageUrl(partner.avatar) || ""}
                alt={partner.firstName}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-linear-to-tr from-primary/20 to-blue-500/20 text-sm font-extrabold text-primary">
                {partner.firstName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-sm font-extrabold tracking-tight text-foreground">
              {partner.firstName} {partner.lastName}
            </h2>
            {/* <div className="flex items-center gap-1.5 mt-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">Đang hoạt động</span>
            </div> */}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Room context banner (hidden on very small screens) */}
          {/* {activeConversation.room && (
            <div className="hidden sm:flex items-center gap-2 rounded-2xl bg-white/30 dark:bg-white/5 border border-white/40 dark:border-white/10 p-2 px-3 text-xs max-w-[200px] truncate shadow-inner backdrop-blur-md">
              <div className="relative h-7 w-10 rounded-lg overflow-hidden shrink-0 bg-secondary border border-border">
                {activeConversation.room.imageUrl ? (
                  <Image src={getImageUrl(activeConversation.room.imageUrl) || ""} alt="Room" fill className="object-cover" unoptimized />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px]">🏡</div>
                )}
              </div>
              <div className="truncate min-w-0">
                <p className="font-bold truncate text-foreground text-[11px] leading-tight">
                  {activeConversation.room.name}
                </p>
                <span className="text-[10px] text-primary font-semibold">
                  {parseFloat(activeConversation.room.price.toString()).toLocaleString("vi-VN")}đ/đêm
                </span>
              </div>
            </div>
          )} */}

          {/* Toggle info panel button (visible when lg panel is hidden) */}
          {onToggleInfo && (
            <button
              onClick={onToggleInfo}
              className="lg:hidden flex items-center justify-center h-9 px-3 rounded-xl border border-white/20 dark:border-white/10 bg-white/50 dark:bg-white/5 text-muted-foreground hover:bg-white/80 dark:hover:bg-white/10 hover:text-foreground transition-all cursor-pointer text-xs font-semibold gap-1.5 shadow-sm"
              title="Thông tin liên hệ"
            >
              <span className="hidden sm:inline">Thông tin</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Messages feed */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-2 scrollbar-hide bg-transparent">
        {isLoadingMessages ? (
          <div className="flex flex-col items-center justify-center h-full space-y-2">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-xs text-muted-foreground">
              Đang tải lịch sử...
            </span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-60">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 border border-primary/20 mb-4">
              <Sparkles className="h-8 w-8 text-primary animate-pulse" />
            </div>
            <h4 className="text-sm font-bold text-foreground">
              Bắt đầu trò chuyện
            </h4>
            <p className="text-xs text-muted-foreground max-w-xs mt-1.5 leading-relaxed">
              Hãy gửi lời chào đầu tiên để trao đổi thông tin phòng đặt nhé!
            </p>
          </div>
        ) : (
          messages.map((m, idx) => {
            const isMe = String(m.senderId) === String(userId);
            const prevMsg = idx > 0 ? messages[idx - 1] : null;
            const showDateHeader =
              !prevMsg ||
              new Date(m.createdAt).toDateString() !==
                new Date(prevMsg.createdAt).toDateString();
            return (
              <MessageBubble
                key={m.id}
                message={m}
                isMe={isMe}
                showDateHeader={showDateHeader}
                partnerName={`${partner.firstName} ${partner.lastName}`}
                partnerAvatar={partner.avatar}
              />
            );
          })
        )}
        {isTyping && typingUser && (
          <TypingIndicator
            partnerName={`${typingUser.firstName} ${typingUser.lastName}`}
            partnerAvatar={partner.avatar}
          />
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4">
        <QuickTemplates isHost={isHost} onSelect={onSelectTemplate} />

        <form onSubmit={onSend} className="flex items-center gap-3 mt-2.5">
          <div
            className="
              relative flex items-center gap-2.5
              rounded-3xl w-full
              border border-slate-200 bg-white/50
              px-4 py-1.5
              shadow-inner
              transition-all duration-300 ease-out
              focus-within:border-primary
              focus-within:bg-white
              focus-within:ring-4
              focus-within:ring-primary/8 
              focus-within:shadow-md"
          >
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer mr-2.5"
            >
              <Smile className="h-5 w-5" />
            </button>
            <input
              type="text"
              placeholder="Nhập nội dung nhắn..."
              value={inputText}
              onChange={onInputChange}
              className="w-full flex-1 bg-transparent text-[13.5px] placeholder:text-muted text-foreground outline-none py-1.5"
            />
            {/* <button
              type="button"
              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer ml-2.5"
            >
              <Paperclip className="h-5 w-5" />
            </button> */}
          </div>
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="
              group relative flex h-10 w-10 shrink-0 items-center justify-center
              overflow-hidden rounded-full
              bg-linear-to-br from-primary to-primary/50
              text-white
              shadow-md
              transition-all duration-300 ease-out
              hover:-translate-y-0.5 hover:scale-105 hover:shadow-[0_4px_12px_rgba(17,84,160,0.3)]
              active:scale-98
              disabled:pointer-events-none
              disabled:opacity-30
              cursor-pointer"
          >
            <Send className="h-4.5 w-4.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
