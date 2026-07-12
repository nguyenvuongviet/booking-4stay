"use client";

import { Button } from "@/_components/ui/button";
import { Plus } from "lucide-react";
import { RefreshButton } from "../../_components/RefreshButton";

interface LocationHeaderProps {
  onRefresh: () => void;
  onAdd: () => void;
  progress: number;
  autoRefreshEnabled: boolean;
  setAutoRefreshEnabled: (val: boolean) => void;
}

export function LocationHeader({
  onRefresh,
  onAdd,
  progress,
  autoRefreshEnabled,
  setAutoRefreshEnabled,
}: LocationHeaderProps) {
  return (
    <div className="space-y-4 pb-3 sm:pb-4 border-b">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Quản lý Vị trí
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400 mt-0.5 sm:mt-1">
            Hệ thống quản lý Quốc gia, Tỉnh thành, Quận huyện và Phường xã với
            chuẩn phân cấp chuẩn xác.
          </p>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <div
            onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
            className={`flex items-center gap-2 text-[11px] font-bold px-2.5 py-1.5 rounded-xl border select-none cursor-pointer transition-all ${
              autoRefreshEnabled
                ? "bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100"
                : "bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700 hover:bg-slate-200"
            }`}
            title={
              autoRefreshEnabled
                ? "Click để tạm dừng tự động làm mới"
                : "Click để bật tự động làm mới"
            }
          >
            <span className="relative flex h-1.5 w-1.5">
              {autoRefreshEnabled && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                  autoRefreshEnabled ? "bg-emerald-500" : "bg-slate-400"
                }`}
              ></span>
            </span>
            <span>
              {autoRefreshEnabled
                ? `Làm mới sau ${Math.max(1, Math.ceil(15 - (progress * 15) / 100))}s`
                : "Tự động làm mới: Tắt"}
            </span>
          </div>

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

      {/* Sleek Auto Refresh Progress Bar */}
      {autoRefreshEnabled && (
        <div className="w-full h-0.5 bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary/70 transition-all duration-100 ease-linear rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
