"use client";

import { Button } from "@/_components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/_components/ui/dialog";
import { Input } from "@/_components/ui/input";
import { Textarea } from "@/_components/ui/textarea";
import type { Room } from "@/types/room";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { LocationSelector } from "../../_components/location-selector";
import { useRoomForm } from "../_hooks/useRoomForm";

const MapPicker = dynamic(
  () => import("../../_components/MapPicker").then((m) => m.MapPicker),
  {
    ssr: false,
    loading: () => <div className="h-70 bg-muted rounded-lg animate-pulse" />,
  },
);

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Room | null;
  isEditMode?: boolean;
}

export function RoomFormModal({
  open,
  onClose,
  onSuccess,
  initialData = null,
  isEditMode = false,
}: Props) {
  const { form, resetForm, update, updateMany, submit, loading } = useRoomForm({
    onSuccess,
    initialData,
    isEditMode,
  });

  const [locationNames, setLocationNames] = useState({
    provinceName: "",
    wardName: "",
  });

  useEffect(() => {
    if (!open) return;
    resetForm();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100%-2rem)] sm:max-w-3xl p-5 sm:p-6 rounded-2xl max-h-[90vh] overflow-y-auto beautiful-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white">
            {isEditMode ? "Cập nhật phòng" : "Thêm phòng mới"}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Vui lòng nhập thông tin chi tiết về phòng để lưu lại.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          <div className="space-y-1">
            <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
              Tên phòng
            </label>
            <Input
              placeholder="Ví dụ: Phòng Deluxe View Biển"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="h-9.5 text-xs sm:text-sm rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                Giá phòng (VND)
              </label>
              <Input
                type="number"
                placeholder="500000"
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
                className="h-9.5 text-xs sm:text-sm rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                Số người lớn
              </label>
              <Input
                type="number"
                placeholder="2"
                value={form.adultCapacity}
                onChange={(e) => update("adultCapacity", e.target.value)}
                className="h-9.5 text-xs sm:text-sm rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                Số trẻ em
              </label>
              <Input
                type="number"
                placeholder="2"
                value={form.childCapacity}
                onChange={(e) => update("childCapacity", e.target.value)}
                className="h-9.5 text-xs sm:text-sm rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 block">
              Vị trí phòng
            </label>
            <LocationSelector
              key={open ? "open-true" : "open-false"}
              value={{
                countryId: form.countryId,
                provinceId: form.provinceId,
                wardId: form.wardId,
              }}
              autoFocus={isEditMode}
              onChange={(loc) => {
                const { _provinceName, _wardName, ...rest } = loc;
                updateMany(rest);
                setLocationNames({
                  provinceName: _provinceName || "",
                  wardName: _wardName || "",
                });
              }}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
              Đường
            </label>
            <Input
              placeholder="Nhập đầy đủ để lấy tọa độ chính xác: số nhà, tên đường, quận, thành phố"
              value={form.street}
              onChange={(e) => update("street", e.target.value)}
              className="h-9.5 text-xs sm:text-sm rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 block">
              Vị trí trên bản đồ
            </label>
            <MapPicker
              lat={form.latitude}
              lng={form.longitude}
              address={form.street || undefined}
              provinceName={locationNames.provinceName || undefined}
              wardName={locationNames.wardName || undefined}
              onChange={(lat, lng) => {
                update("latitude", lat);
                update("longitude", lng);
              }}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
              Mô tả phòng
            </label>
            <Textarea
              placeholder="Nhập mô tả phòng..."
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              className="resize-none rounded-xl text-xs sm:text-sm"
              rows={4}
            />
          </div>
        </div>

        <DialogFooter className="flex flex-row justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/60">
          <Button
            variant="outline"
            onClick={onClose}
            className="h-9 rounded-xl text-xs sm:text-sm px-4 cursor-pointer"
          >
            Huỷ
          </Button>
          <Button
            disabled={loading}
            onClick={submit}
            className="h-9 bg-primary text-white hover:bg-primary/90 rounded-xl text-xs sm:text-sm px-4 cursor-pointer"
          >
            {loading
              ? isEditMode
                ? "Đang lưu..."
                : "Đang tạo..."
              : isEditMode
                ? "Lưu thay đổi"
                : "Tạo phòng"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
