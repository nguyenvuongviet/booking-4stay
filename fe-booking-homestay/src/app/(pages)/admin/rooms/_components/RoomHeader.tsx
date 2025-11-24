"use client";

import { Button } from "@/components/ui/button";
import { Plus, RefreshCcw } from "lucide-react";

export function RoomHeader({ onRefresh, onAdd }: any) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-warm-900">Quản lý phòng</h1>
        <p className="text-warm-600 mt-1">
          Quản lý toàn bộ danh sách phòng trong hệ thống
        </p>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={onRefresh}>
          <RefreshCcw className="w-4 h-4 mr-1" />
          Làm mới
        </Button>

        <Button onClick={onAdd}>
          <Plus className="w-4 h-4 mr-1" />
          Thêm phòng
        </Button>
      </div>
    </div>
  );
}
