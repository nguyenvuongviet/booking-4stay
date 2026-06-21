"use client";

import { Loader2 } from "lucide-react";

export default function Loader() {
  return (
    <div className="flex items-center justify-center min-h-50 w-full">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );
}
