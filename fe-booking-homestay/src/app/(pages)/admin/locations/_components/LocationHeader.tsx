"use client";

import { Button } from "@/components/ui/button";
import { RefreshCcw, Plus, Upload } from "lucide-react";

interface LocationHeaderProps {
  onRefresh: () => void;
  onAdd: () => void;
  openImport: () => void;
}

export function LocationHeader({
  onRefresh,
  onAdd,
  openImport,
}: LocationHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">Quản lý Vị trí</h1>
        <p className="text-muted-foreground">
          Country / Province / District / Ward
        </p>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" className="gap-2" onClick={onRefresh}>
          <RefreshCcw className="w-4 h-4" /> Làm mới
        </Button>

        <Button
          className="gap-2 bg-primary text-primary-foreground"
          onClick={onAdd}
        >
          <Plus className="w-4 h-4" /> Add New
        </Button>
        <Button
          variant="outline"
          className="gap-2 flex-shrink-0"
          onClick={openImport}
        >
          <Upload className="w-4 h-4" /> Import All
        </Button>
      </div>
    </div>
  );
}
