"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { RefreshButton } from "../../_components/RefreshButton";

export function RoomHeader({ onRefresh, onAdd }: any) {
  return (
    <div className="flex items-center justify-between pb-4 border-b">
      <div>
        <h1 className="text-3xl font-bold text-warm-900">Quản lý phòng</h1>
        <p className="text-warm-600 mt-1">
          Quản lý toàn bộ danh sách phòng trong hệ thống
        </p>
      </div>

      <div className="flex gap-2">
        <RefreshButton onRefresh={onRefresh} />
        <Button onClick={onAdd}>
          <Plus className="w-4 h-4 mr-1" />
          Thêm phòng
        </Button>
      </div>
    </div>
  );
}
