"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Room } from "@/types/room";
import { useEffect } from "react";
import { LocationSelector } from "../../_components/LocationSelector";
import { useRoomForm } from "../_hooks/useRoomForm";

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

  useEffect(() => {
    if (!open) return;
    resetForm();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {isEditMode ? "Cập nhật phòng" : "Thêm phòng mới"}
          </DialogTitle>
          <DialogDescription>
            Vui lòng nhập thông tin chi tiết về phòng để lưu lại.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Tên phòng</label>
            <Input
              placeholder="Ví dụ: Phòng Deluxe View Biển"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 space-y-1">
              <label className="text-sm font-medium">Giá phòng (VND)</label>
              <Input
                type="number"
                placeholder="500000"
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Số người lớn</label>
              <Input
                type="number"
                placeholder="2"
                value={form.adultCapacity}
                onChange={(e) => update("adultCapacity", e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Số trẻ em</label>
              <Input
                type="number"
                placeholder="2"
                value={form.childCapacity}
                onChange={(e) => update("childCapacity", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium block">Vị trí phòng</label>
            <LocationSelector
              key={open ? "open-true" : "open-false"}
              value={{
                countryId: form.countryId,
                provinceId: form.provinceId,
                districtId: form.districtId,
                wardId: form.wardId,
              }}
              autoFocus={isEditMode}
              onChange={(loc) => updateMany(loc)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Đường</label>
            <Input
              placeholder="Số nhà / Tên đường"
              value={form.street}
              onChange={(e) => update("street", e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Mô tả phòng</label>
            <Textarea
              placeholder="Nhập mô tả phòng..."
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              className="resize-none"
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Huỷ
          </Button>
          <Button disabled={loading} onClick={submit}>
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
