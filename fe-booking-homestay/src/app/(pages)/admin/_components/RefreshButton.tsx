"use client";

import { Button } from "@/_components/ui/button";
import { RefreshCcw } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

interface RefreshButtonProps {
  onRefresh: () => Promise<void> | void;
  label?: string;
  className?: string;
}

export function RefreshButton({
  onRefresh,
  label = "Làm mới",
  className,
}: RefreshButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    try {
      setLoading(true);
      await onRefresh();
      toast.success("Làm mới thành công!");
    } catch (error) {
      console.error("Lỗi khi làm mới:", error);
      toast.error("Không thể làm mới, vui lòng thử lại!");
    } finally {
      setTimeout(() => setLoading(false), 400);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleClick}
      disabled={loading}
      className={`flex items-center justify-center gap-2 ${className}`}
    >
      <RefreshCcw className={`w-4 h-4 shrink-0 ${loading ? "animate-spin" : ""}`} />
      {label && (
        <span className="hidden sm:inline whitespace-nowrap">
          {loading ? "Đang làm mới..." : label}
        </span>
      )}
    </Button>
  );
}
