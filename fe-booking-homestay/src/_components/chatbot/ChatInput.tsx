"use client";

import { SendHorizonal, Square } from "lucide-react";

type Props = {
  input: string;
  setInput: (v: string) => void;
  onSend: () => void;
  onCancel: () => void;
  isLoading: boolean;
};

export default function ChatInput({
  input,
  setInput,
  onSend,
  onCancel,
  isLoading,
}: Props) {
  return (
    <div className="relative shrink-0 border-t border-slate-100/60 bg-white p-3.5">
      <div
        className="
          relative flex items-center gap-2.5
          rounded-3xl
          border border-slate-200 bg-white/50
          pl-4 pr-1.5 py-1.5
          shadow-inner
          transition-all duration-300 ease-out
          focus-within:border-primary
          focus-within:bg-white
          focus-within:ring-4
          focus-within:ring-primary/8
          focus-within:shadow-md
        "
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          disabled={isLoading}
          placeholder="Hỏi 4Stay AI về chuyến đi của bạn..."
          className="
            flex-1 bg-transparent px-1
            text-[13.5px]
            placeholder:text-muted
            outline-none
            disabled:opacity-50
          "
        />

        <button
          onClick={isLoading ? onCancel : onSend}
          disabled={!isLoading && !input.trim()}
          aria-label={isLoading ? "Dừng trả lời" : "Gửi tin nhắn"}
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
            cursor-pointer
          "
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />

          {isLoading ? (
            <Square className="relative z-10 h-3.5 w-3.5 fill-current animate-pulse" />
          ) : (
            <SendHorizonal className="relative z-10 h-4.5 w-4.5 translate-x-[0.5px]" />
          )}
        </button>
      </div>
    </div>
  );
}
