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
import { BedItemDto, BedType } from "@/types/room";

interface Props {
  open: boolean;
  onClose: () => void;
  beds: BedItemDto[];
  updateBeds: (beds: BedItemDto[]) => void;
  onSubmit: () => void;
  loading: boolean;
}

export function UpdateBedsModal({
  open,
  onClose,
  beds,
  updateBeds,
  onSubmit,
  loading,
}: Props) {
  const handleChange = (index: number, field: keyof BedItemDto, value: any) => {
    const next = [...beds];
    next[index] = { ...next[index], [field]: value };
    updateBeds(next);
  };

  const handleAdd = () => {
    updateBeds([...beds, { type: BedType.SINGLE, quantity: 1 }]);
  };

  const handleRemove = (index: number) => {
    updateBeds(beds.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Cập nhật giường</DialogTitle>
          <DialogDescription>
            Thay đổi loại và số lượng giường trong phòng.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[350px] overflow-y-auto">
          {beds.map((b, index) => (
            <div key={index} className="grid grid-cols-3 gap-2 items-center">
              <select
                className="border rounded p-2"
                value={b.type}
                onChange={(e) => handleChange(index, "type", e.target.value)}
              >
                {Object.values(BedType).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              <Input
                type="number"
                value={b.quantity}
                onChange={(e) =>
                  handleChange(index, "quantity", Number(e.target.value))
                }
              />

              <Button
                variant="destructive"
                onClick={() => handleRemove(index)}
                className="w-full"
              >
                Xoá
              </Button>
            </div>
          ))}

          <Button onClick={handleAdd} variant="outline">
            Thêm giường
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Huỷ
          </Button>
          <Button disabled={loading} onClick={onSubmit}>
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
