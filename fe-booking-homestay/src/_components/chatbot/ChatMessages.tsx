"use client";

import { RefObject } from "react";

import ChatBubble from "./ChatBubble";
import TypingIndicator from "./TypingIndicator";

import { Message } from "@/types/chatbot";

type Props = {
  messages: Message[];
  isLoading: boolean;
  bottomRef: RefObject<HTMLDivElement | null>;
};

export default function ChatMessages({
  messages,
  isLoading,
  bottomRef,
}: Props) {
  return (
    <div className="relative flex flex-1 flex-col gap-5 overflow-y-auto px-4 py-6 scrollbar-hide">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-linear-to-b from-white/10 to-transparent" />

      {messages.map((message, index) => (
        <div
          key={message.id}
          className="animate-in fade-in slide-in-from-bottom-2 duration-300"
          style={{ animationDelay: `${Math.min(index * 35, 180)}ms` }}
        >
          <ChatBubble message={message} />
        </div>
      ))}

      {isLoading && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <TypingIndicator />
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
