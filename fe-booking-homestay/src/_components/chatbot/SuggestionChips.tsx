"use client";

import { SUGGESTIONS } from "@/constants/chatbot";
import { ChevronRight } from "lucide-react";

type Props = {
  onClick: (text: string) => void;
  isLoading: boolean;
};

export default function SuggestionChips({ onClick, isLoading }: Props) {
  return (
    <div className="p-2 shrink-0 flex gap-1 overflow-x-auto beautiful-scrollbar">
      {SUGGESTIONS.map((item, index) => (
        <button
          key={item}
          onClick={() => onClick(item)}
          disabled={isLoading}
          style={{ animationDelay: `${index * 50}ms` }}
          className="
            whitespace-nowrap flex items-center gap-1.5 rounded-full
            border border-slate-200/80 bg-white/70
            px-4 py-2 text-xs font-semibold text-muted-foreground
            transition-all duration-300 ease-out
            hover:-translate-y-0.5 
            hover:border-primary/50 hover:bg-primary/5 hover:text-primary
            hover:shadow-[0_4px_12px_rgba(17,84,160,0.06)]
            active:scale-95
            disabled:pointer-events-none
            disabled:opacity-30
            cursor-pointer
            animate-in fade-in slide-in-from-bottom-2
          "
        >
          {item}
          <ChevronRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" />
        </button>
      ))}
    </div>
  );
}
