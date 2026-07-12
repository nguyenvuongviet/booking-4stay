"use client";

import { Button } from "@/_components/ui/button";
import { Plus } from "lucide-react";
import { RefreshButton } from "../../_components/RefreshButton";

export function RoomHeader({
  onRefresh,
  onAdd,
  progress,
  autoRefreshEnabled,
  setAutoRefreshEnabled,
}: any) {
  return (
    <div className="space-y-4 pb-2 border-b">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Quản lý phòng
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Quản lý toàn bộ danh sách phòng trong hệ thống
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
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
