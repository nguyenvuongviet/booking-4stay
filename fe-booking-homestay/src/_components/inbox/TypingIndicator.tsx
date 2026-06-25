"use client";

import { getImageUrl } from "@/_helper/chat.helper";
import Image from "next/image";

interface Props {
  partnerName: string;
  partnerAvatar: string | null;
}

export default function TypingIndicator({ partnerName, partnerAvatar }: Props) {
  return (
    <div className="flex justify-start">
      <div className="flex items-end gap-2 max-w-[70%]">
        <div className="relative h-7 w-7 shrink-0 rounded-xl overflow-hidden bg-white/40 dark:bg-white/10 border border-white/40 dark:border-white/20 shadow-sm backdrop-blur-md">
          {partnerAvatar ? (
            <Image
              src={getImageUrl(partnerAvatar) || ""}
              alt={partnerName}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-linear-to-tr from-primary/20 to-blue-500/20 text-[10px] font-bold text-primary">
              {partnerName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="rounded-2xl px-4 py-2.5 bg-white/40 dark:bg-white/10 border border-white/40 dark:border-white/20 text-muted-foreground rounded-bl-none flex items-center gap-1.5 shadow-md backdrop-blur-md">
          <div className="flex gap-1 ml-1">
            <span
              className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <span
              className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <span
              className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
