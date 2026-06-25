"use client";

import InboxPageContent from "@/_components/inbox/InboxPageContent";
import React from "react";

export default function AdminChatPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex h-[calc(100vh-7rem)] flex-col items-center justify-center rounded-xl border border-border bg-background text-foreground font-sans">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="mt-4 text-xs text-muted-foreground font-semibold tracking-tight">
            Đang tải hộp thư...
          </span>
        </div>
      }
    >
      <InboxPageContent routePath="/admin/chat" backHref="/admin" embedded />
    </React.Suspense>
  );
}
