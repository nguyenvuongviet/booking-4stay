"use client";

import { Button } from "@/_components/ui/button";
import { Plus } from "lucide-react";
import { RefreshButton } from "../../_components/RefreshButton";

export function RoomHeader({ onRefresh, onAdd }: any) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Quản lý phòng
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Quản lý toàn bộ danh sách phòng trong hệ thống
        </p>
      </div>

      <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
        <RefreshButton
          onRefresh={onRefresh}
          className="h-9! w-9! p-0! sm:w-auto! sm:h-9! sm:px-3! rounded-lg cursor-pointer border border-border/80 shrink-0"
        />
        <Button
          onClick={onAdd}
          className="bg-primary text-white hover:bg-primary/90 gap-1.5 h-9 text-xs sm:text-sm px-3 rounded-lg cursor-pointer shadow-xs shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Thêm phòng
        </Button>
      </div>
    </div>
  );
}
