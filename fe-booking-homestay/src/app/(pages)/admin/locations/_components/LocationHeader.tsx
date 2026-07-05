"use client";

import { Button } from "@/_components/ui/button";
import { Plus } from "lucide-react";
import { RefreshButton } from "../../_components/RefreshButton";

interface LocationHeaderProps {
  onRefresh: () => void;
  onAdd: () => void;
}

export function LocationHeader({ onRefresh, onAdd }: LocationHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 sm:pb-4 border-b gap-3 sm:gap-4">
      <div>
        <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Quản lý Vị trí
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400 mt-0.5 sm:mt-1">
          Hệ thống quản lý Quốc gia, Tỉnh thành, Quận huyện và Phường xã với
          chuẩn phân cấp chuẩn xác.
        </p>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <RefreshButton onRefresh={onRefresh} />
        <Button
          onClick={onAdd}
          className="h-9 sm:h-10 px-3 sm:px-4 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium bg-primary hover:bg-primary/90 text-white shadow-sm flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          Thêm Vị trí
        </Button>
      </div>
    </div>
  );
}
