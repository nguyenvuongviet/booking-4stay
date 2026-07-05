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
import { BedItemDto, BedType } from "@/types/room";
import { Plus, Trash2 } from "lucide-react";

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
      <DialogContent className="w-[calc(100%-2rem)] sm:max-w-lg p-5 sm:p-6 rounded-2xl max-h-[85vh] overflow-y-auto beautiful-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
            Cập nhật giường
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Thay đổi loại và số lượng giường trong phòng.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-75 overflow-y-auto pr-1.5 beautiful-scrollbar py-2">
          {beds.map((b, index) => (
            <div
              key={index}
              className="grid grid-cols-[2fr_1fr_1.2fr] gap-2 items-center"
            >
              <select
                className="h-9.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-1.5 text-xs sm:text-sm outline-none focus:border-primary/50 text-slate-700 dark:text-slate-350 font-medium cursor-pointer"
                value={b.type}
                onChange={(e) => handleChange(index, "type", e.target.value)}
              >
                {Object.values(BedType).map((t) => (
                  <option key={t} value={t}>
                    Giường {t}
                  </option>
                ))}
              </select>

              <Input
                type="number"
                value={b.quantity}
                onChange={(e) =>
                  handleChange(index, "quantity", Number(e.target.value))
                }
                className="h-9.5 text-xs sm:text-sm rounded-xl"
                min={1}
              />

              <Button
                onClick={() => handleRemove(index)}
                className="h-9.5 rounded-xl text-xs font-semibold px-2.5 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/40 border border-red-100/50 dark:border-red-900/30"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xoá</span>
              </Button>
            </div>
          ))}

          <Button
            onClick={handleAdd}
            variant="outline"
            className="w-full h-9 rounded-xl text-xs sm:text-sm cursor-pointer gap-1.5 border-dashed border-slate-300 hover:border-primary/50"
          >
            <Plus className="w-4 h-4" /> Thêm giường
          </Button>
        </div>

        <DialogFooter className="flex flex-row justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/60 mt-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="h-9 rounded-xl text-xs sm:text-sm px-4 cursor-pointer"
          >
            Huỷ
          </Button>
          <Button
            disabled={loading}
            onClick={onSubmit}
            className="h-9 bg-primary text-white hover:bg-primary/90 rounded-xl text-xs sm:text-sm px-4 cursor-pointer"
          >
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
