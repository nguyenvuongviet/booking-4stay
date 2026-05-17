"use client";

import { Bot } from "lucide-react";

export default function TypingIndicator() {
  return (
    <div className="chat-msg-slide mb-4 flex justify-start">
      <div className="flex max-w-[80%] items-end gap-2.5">
        {/* Avatar */}
        <div className="relative flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-full border border-white/20 bg-linear-to-br from-primary to-primary/20 shadow-md transition-transform duration-300 hover:scale-105">
          <Bot className="relative z-10 h-5 w-5 text-white" />
        </div>

        {/* Bubble */}
        <div
          className="
            relative overflow-hidden
            rounded-2xl rounded-bl-xs
            border border-white/10
            bg-linear-to-br from-primary via-primary/90 to-primary/60
            px-4 py-3.5
            shadow-[0_8px_30px_rgba(17,84,160,0.1)]
          "
        >
          <div className="relative z-10 flex items-center gap-1.5">
            <div className="chat-typing-dot h-1.5 w-1.5 rounded-full bg-white/90" />
            <div className="chat-typing-dot h-1.5 w-1.5 rounded-full bg-white/90" />
            <div className="chat-typing-dot h-1.5 w-1.5 rounded-full bg-white/90" />
          </div>
        </div>
      </div>
    </div>
  );
}
