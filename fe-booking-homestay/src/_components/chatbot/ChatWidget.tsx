"use client";

import { useRealtimeChat } from "@/context/ChatContext";
import { Bot, MessageCircle } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import ChatMessages from "./ChatMessages";
import SuggestionChips from "./SuggestionChips";

import { isChatPage } from "@/_helper/chat-realtime.helper";
import { useChatbot } from "@/_hooks/useChatbot";

export default function ChatWidget() {
  const pathname = usePathname();
  const router = useRouter();
  const { unreadCount } = useRealtimeChat();

  const {
    open,
    setOpen,
    setClose,
    input,
    setInput,
    messages,
    isLoading,
    handleSend,
    clearHistory,
    cancelRequest,
    bottomRef,
  } = useChatbot();

  // Ẩn toàn bộ widget khi đang ở trang /inbox hoặc các trang quản trị /admin
  if (isChatPage(pathname) || pathname?.startsWith("/admin")) return null;

  const handleClose = () => {
    setClose(true);
    setTimeout(() => {
      setOpen(false);
      setClose(false);
    }, 200);
  };

  return (
    <>
      {!open && (
        <div className="fixed bottom-1/12 right-6 z-50 flex flex-col items-center gap-6">
          {/* Nút 1: Inbox Realtime */}
          <button
            onClick={() => router.push("/inbox")}
            className="group relative flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:scale-105 hover:shadow-[0_0_24px_rgba(17,84,160,0.4)] animate-aura-1 cursor-pointer"
            aria-label="Mở hộp thư trò chuyện"
          >
            <div className="absolute inset-0 rounded-full bg-linear-to-br from-primary/60 via-primary/70 to-primary/60 opacity-100" />
            <div className="absolute -inset-0.5 rounded-full bg-primary/15 blur-md opacity-75 transition duration-300 group-hover:opacity-100 group-hover:blur-lg" />

            <MessageCircle className="relative z-10 h-6 w-6 text-white drop-shadow-sm transition-transform duration-300 group-hover:scale-110" />

            {/* Unread badge */}
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 z-20 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-extrabold text-white shadow-sm animate-bounce">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}

            {/* Tooltip */}
            <div className="pointer-events-none absolute right-15 scale-90 opacity-0 whitespace-nowrap rounded-full border border-slate-200/50 bg-white/95 px-4 py-2 text-xs text-muted-foreground shadow-[0_12px_36px_rgba(0,0,0,0.12)] backdrop-blur-md transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
              Hộp thư 💬
            </div>
          </button>

          {/* Nút 2: AI Chatbot */}
          <button
            onClick={() => setOpen(true)}
            className="group relative flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:scale-105 hover:shadow-[0_0_24px_rgba(17,84,160,0.4)] animate-aura-2 cursor-pointer chat-btn-pop"
            aria-label="Open Chat"
          >
            <div className="absolute inset-0 rounded-full bg-linear-to-br from-secondary/50 via-secondary/30 to-secondary/50 opacity-100" />
            <div className="absolute -inset-0.5 rounded-full bg-secondary/50 blur-md opacity-75 transition duration-300 group-hover:opacity-100 group-hover:blur-lg" />

            <Bot className="relative z-10 h-7 w-7 text-primary drop-shadow-sm transition-transform duration-300 group-hover:rotate-6" />

            {/* Online ping */}
            <span className="absolute right-0 top-0 z-20 flex h-4 w-4">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-white bg-green-500 shadow-sm" />
            </span>

            {/* Tooltip */}
            <div className="pointer-events-none absolute right-20 scale-90 opacity-0 whitespace-nowrap rounded-full border border-slate-200/50 bg-white/95 px-4 py-2 text-xs text-muted-foreground shadow-[0_12px_36px_rgba(0,0,0,0.12)] backdrop-blur-md transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
              4Stay AI ✨
            </div>
          </button>
        </div>
      )}

      {/* AI Chatbot panel */}
      {open && (
        <div
          className={`
            fixed bottom-4 right-5 z-50
            h-[min(620px,calc(100dvh-48px))]
            w-[min(450px,calc(100vw-32px))]
            overflow-hidden rounded-4xl
            bg-white/85 border border-white/40
            shadow-[0_32px_96px_-16px_rgba(0,0,0,0.18)]
            flex flex-col
            backdrop-blur-3xl
            ${open ? "chat-open" : "chat-close"}
          `}
        >
          <div className="absolute inset-0 bg-linear-to-b from-white/10 via-transparent to-white/5 pointer-events-none" />
          <div className="absolute -top-24 right-0 h-64 w-64 rounded-full bg-[#1154a0]/25 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 left-0 h-64 w-64 rounded-full bg-blue-400/15 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex h-full flex-col">
            <ChatHeader onClose={handleClose} onClear={clearHistory} />

            <div className="flex flex-1 flex-col overflow-hidden bg-slate-50/30">
              <ChatMessages
                messages={messages}
                isLoading={isLoading}
                bottomRef={bottomRef}
              />
              <SuggestionChips onClick={handleSend} isLoading={isLoading} />
            </div>

            <ChatInput
              input={input}
              setInput={setInput}
              onSend={() => handleSend()}
              onCancel={cancelRequest}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}
    </>
  );
}
