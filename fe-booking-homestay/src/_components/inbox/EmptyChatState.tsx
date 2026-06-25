"use client";

import { MessageSquare } from "lucide-react";

interface Props {
  filterType: "all" | "unread";
}

export default function EmptyChatState({ filterType }: Props) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6 bg-transparent">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/40 dark:border-white/10 bg-white/40 dark:bg-white/5 shadow-xl backdrop-blur-2xl mb-5">
        <MessageSquare className="h-10 w-10 text-primary/60" />
      </div>
      <h2 className="text-lg font-extrabold tracking-tight text-foreground">
        Chưa chọn cuộc trò chuyện
      </h2>
      <p className="mt-2 text-sm text-muted-foreground max-w-xs leading-relaxed">
        {filterType === "unread"
          ? "Bạn đã đọc hết toàn bộ tin nhắn rồi!"
          : "Chọn một liên hệ từ danh sách hoặc truy cập Homestay để bắt đầu kết nối ngay."}
      </p>
    </div>
  );
}
