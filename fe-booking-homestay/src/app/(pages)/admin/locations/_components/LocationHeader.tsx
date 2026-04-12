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
    <div className="relative group p-8 rounded-3xl overflow-hidden mb-8 border border-white/10 shadow-2xl">
      <div className="absolute inset-0 bg-linear-to-br from-cyan-500/10 via-purple-500/10 to-transparent" />
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/20 blur-[100px] rounded-full group-hover:bg-cyan-500/30 transition-all duration-700" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/20 blur-[100px] rounded-full group-hover:bg-purple-500/30 transition-all duration-700" />

      <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <h1 className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-linear-to-r from-cyan-500 via-purple-500 to-indigo-500">
              Quản lý Vị trí
            </h1>
          </div>
          <p className="text-muted-foreground font-medium max-w-md">
            Hệ thống quản lý Quốc gia, Tỉnh thành, Quận huyện và Phường xã với
            chuẩn phân cấp chuẩn xác.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <RefreshButton onRefresh={onRefresh} />
          <Button
            onClick={onAdd}
            className="
              h-12 px-8 rounded-2xl font-bold bg-linear-to-r from-cyan-600 to-blue-600 
              hover:from-cyan-500 hover:to-blue-500 text-white shadow-xl shadow-cyan-500/20 
              transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center gap-2
            "
          >
            <Plus className="w-5 h-5" />
            Thêm Vị trí
          </Button>
        </div>
      </div>
    </div>
  );
}
