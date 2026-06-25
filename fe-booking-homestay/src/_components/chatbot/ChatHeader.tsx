"use client";

import { Bot, Sparkles, X } from "lucide-react";

type Props = {
  onClose: () => void;
  onClear: () => void;
};

export default function ChatHeader({ onClose, onClear }: Props) {
  return (
    <div className="relative shrink-0 overflow-hidden border-b border-white/10 px-4 py-2.5">
      {/* Premium vibrant gradient background */}
      <div className="absolute inset-0 bg-linear-to-r from-primary via-primary/75 to-primary/50 opacity-100" />

      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/25 bg-white/15 shadow-inner backdrop-blur-md">
            <Bot className="h-7 w-7 text-white drop-shadow-md animate-bounce animate-duration-3000" />

            {/* Active online glowing dot */}
            <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 shadow-sm">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative h-1 w-1 rounded-full bg-white" />
            </span>
          </div>

          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-extrabold tracking-tight text-white drop-shadow-sm">
                4Stay AI
              </h2>
              <Sparkles className="h-4.5 w-4.5 text-amber-300 fill-amber-300/20 animate-pulse animate-duration-1500" />
            </div>

            <p className="text-[10px] text-white/80">Trợ lý AI thông minh</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* <button
            onClick={onClear}
            title="Xóa lịch sử chat"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white/80 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-300 hover:shadow-[0_0_12px_rgba(239,68,68,0.25)] active:scale-95 cursor-pointer"
          >
            <Trash2 className="h-4.5 w-4.5" />
          </button> */}

          <button
            onClick={onClose}
            title="Đóng chat"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/90 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/20 hover:rotate-90 active:scale-95 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
