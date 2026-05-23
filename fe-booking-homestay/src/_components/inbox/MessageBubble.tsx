"use client";

import {
  formatDateHeader,
  formatTime,
  getImageUrl,
} from "@/_helper/chat.helper";
import { IMessage } from "@/types/chat";
import { Check, CheckCheck } from "lucide-react";
import Image from "next/image";

interface Props {
  message: IMessage;
  isMe: boolean;
  showDateHeader: boolean;
  partnerName: string;
  partnerAvatar: string | null;
}

export default function MessageBubble({
  message,
  isMe,
  showDateHeader,
  partnerName,
  partnerAvatar,
}: Props) {
  return (
    <div className="space-y-2">
      {/* Date header */}
      {showDateHeader && (
        <div className="flex justify-center py-2">
          <span className="rounded-full bg-white/30 dark:bg-white/10 border border-white/40 dark:border-white/20 px-3.5 py-1 text-[10px] font-semibold text-muted-foreground shadow-sm backdrop-blur-md">
            {formatDateHeader(message.createdAt)}
          </span>
        </div>
      )}

      {/* Bubble */}
      <div className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}>
        <div
          className={`flex items-end gap-2 max-w-[78%] sm:max-w-[72%] ${
            isMe ? "flex-row-reverse" : "flex-row"
          }`}
        >
          {/* Partner avatar */}
          {!isMe && (
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
          )}

          {/* Bubble + metadata */}
          <div className="space-y-1 min-w-0 max-w-full">
            <div
              className={`rounded-2xl px-4 py-2.5 shadow-md backdrop-blur-md text-sm leading-relaxed whitespace-pre-wrap wrap-break-words border ${
                isMe
                  ? `relative overflow-hidden rounded-2xl rounded-br-xs px-4 py-3 text-[13.5px] leading-relaxed text-white shadow-[0_8px_30px_rgba(17,84,160,0.12)] 
                  border border-white/10 bg-linear-to-br from-primary via-primary/90 to-primary/60 transition-all duration-300`
                  : `relative overflow-hidden rounded-2xl rounded-bl-xs border border-slate-200/60 bg-slate-100/90 px-4 py-3
                  text-[13px] leading-relaxed text-slate-800 shadow-xs transition-colors duration-200 hover:bg-slate-100`
              }`}
            >
              {message.content}
            </div>

            {/* Time + read status */}
            <div
              className={`flex items-center gap-1 text-[10px] text-muted-foreground ${
                isMe ? "justify-end" : "justify-start"
              }`}
            >
              <span>{formatTime(message.createdAt)}</span>
              {isMe &&
                (message.isRead ? (
                  <span title="Đã đọc">
                    <CheckCheck className="h-3 w-3 text-primary" />
                  </span>
                ) : (
                  <span title="Đã gửi">
                    <Check className="h-3 w-3 text-muted-foreground" />
                  </span>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
