"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LocationSelector } from "../../_components/LocationSelector";
import { useRoomForm } from "../_hooks/useRoomForm";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function RoomFormModal({ open, onClose, onSuccess }: Props) {
  const { form, update, updateMany, submit, loading } = useRoomForm(onSuccess);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thêm phòng mới</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <Input
            placeholder="Tên phòng"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />

          <Input
            type="number"
            placeholder="Giá phòng (VND)"
            value={form.price}
            onChange={(e) => update("price", e.target.value)}
          />

          <Input
            type="number"
            placeholder="Số người lớn"
            value={form.adultCapacity}
            onChange={(e) => update("adultCapacity", e.target.value)}
          />

          <Input
            type="number"
            placeholder="Số trẻ em"
            value={form.childCapacity}
            onChange={(e) => update("childCapacity", e.target.value)}
          />

          {/* LOCATION SELECTOR */}
          <div className="md:col-span-2">
            <LocationSelector
              value={{
                countryId: form.countryId,
                provinceId: form.provinceId,
                districtId: form.districtId,
                wardId: form.wardId,
              }}
              onChange={(loc) => updateMany(loc)}
            />
          </div>

          <Input
            placeholder="Số nhà / Tên đường"
            value={form.street}
            onChange={(e) => update("street", e.target.value)}
            className="md:col-span-2"
          />

          <Textarea
            placeholder="Mô tả phòng"
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            className="md:col-span-2"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Huỷ
          </Button>
          <Button disabled={loading} onClick={submit}>
            {loading ? "Đang tạo..." : "Tạo phòng"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
