"use client";

import { renderMarkdown } from "@/lib/markdown";
import { Message } from "@/types/chatbot";
import { Bot, User } from "lucide-react";

type Props = {
  message: Message;
};

export default function ChatBubble({ message }: Props) {
  const isBot = message.role === "assistant";
  const isError = Boolean(message.isError);

  return (
    <div
      className={`flex ${
        isBot ? "justify-start" : "justify-end"
      } chat-msg-slide`}
    >
      <div
        className={`flex max-w-[85%] items-end gap-2.5 ${
          isBot ? "" : "flex-row-reverse"
        }`}
      >
        {/* Avatar */}
        {isBot ? (
          <div className="relative flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary to-primary/20 shadow-md transition-transform duration-300 hover:scale-105">
            <Bot className="relative z-10 h-5 w-5 text-white" />
            <div className="absolute -inset-0.5 rounded-full bg-primary/20 blur-sm pointer-events-none" />
          </div>
        ) : (
          <div className="relative flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-200 shadow-sm transition-transform duration-300 hover:scale-105">
            <User className="h-5 w-5 text-secondary-foreground" />
          </div>
        )}

        {/* Content */}
        <div className="flex flex-col gap-1">
          {isBot ? (
            <div
              className={`
                relative overflow-hidden
                rounded-2xl rounded-bl-xs
                px-4 py-3
                text-[13.5px] leading-relaxed text-white
                shadow-[0_8px_30px_rgba(17,84,160,0.12)]
                border border-white/10
                bg-linear-to-br from-primary via-primary/90 to-primary/60
                transition-all duration-300
                ${isError ? "border-red-500/30 bg-linear-to-br bg-red-950/20 text-red-100 shadow-[0_8px_30px_rgba(239,68,68,0.08)]" : ""}
              `}
            >
              <div
                className="relative z-10 prose prose-invert prose-sm max-w-none chatbot-markdown text-[13px] leading-relaxed text-slate-50"
                dangerouslySetInnerHTML={{
                  __html: renderMarkdown(message.content),
                }}
              />
            </div>
          ) : (
            <div
              className="
                relative overflow-hidden
                rounded-2xl rounded-br-xs
                border border-slate-200/60
                bg-slate-100/90
                px-4 py-3
                text-[13px] leading-relaxed text-slate-800
                shadow-xs
                transition-colors duration-200
                hover:bg-slate-100
              "
            >
              <div className="relative z-10 whitespace-pre-wrap wrap-break-words font-medium text-secondary-foreground">
                {message.content}
              </div>
            </div>
          )}

          <span
            className={`px-1.5 text-[10px] tracking-wider text-muted-foreground uppercase ${
              isBot ? "" : "text-right"
            }`}
          >
            {message.time}
          </span>
        </div>
      </div>
    </div>
  );
}
