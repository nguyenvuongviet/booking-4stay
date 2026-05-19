"use client";

import InboxPageContent from "@/_components/inbox/InboxPageContent";
import React from "react";

export default function InboxPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground font-sans">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="mt-4 text-xs text-muted-foreground font-semibold tracking-tight">
            Đang tải hộp thư...
          </span>
        </div>
      }
    >
      <InboxPageContent />
    </React.Suspense>
  );
}
