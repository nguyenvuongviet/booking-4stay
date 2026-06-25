"use client";

import { Button } from "@/_components/ui/button";
import { recomputeAllUserLevels } from "@/services/admin/loyaltyApi";
import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { ConfirmDialog } from "./ConfirmDialog";

export function RecomputeButton({ onDone }: { onDone?: () => void }) {
  const [loading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleAction = async () => {
    setConfirmOpen(false);

    await toast.promise(
      recomputeAllUserLevels(),
      {
        loading: "Đang quét và tính toán lại cấp độ người dùng...",
        success: (res) => {
          if (onDone) onDone();
          return `Thành công! Đã cập nhật cho ${res.totalUpdated} người dùng.`;
        },
        error: (err) => {
          console.error(err);
          return "Có lỗi xảy ra khi tính toán lại cấp độ.";
        },
      },
      {
        style: { minWidth: "300px" },
      },
    );
  };

  return (
    <>
      <Button
        variant="outline"
        disabled={loading}
        onClick={() => setConfirmOpen(true)}
        className="flex items-center gap-2"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4 text-amber-600" />
        )}
        <span>{loading ? "Đang xử lý..." : "Tính lại cấp độ"}</span>
      </Button>

      <ConfirmDialog
        open={confirmOpen}
        title="Xác nhận tính lại cấp độ"
        description="Hệ thống sẽ tính toán lại cấp độ loyalty cho toàn bộ người dùng. Bạn có chắc muốn tiếp tục?"
        confirmText="Tiếp tục"
        cancelText="Hủy"
        onConfirm={handleAction}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
