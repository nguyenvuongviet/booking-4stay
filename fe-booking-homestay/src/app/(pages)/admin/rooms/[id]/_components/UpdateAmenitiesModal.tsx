"use client";

import { Button } from "@/_components/ui/button";
import { Checkbox } from "@/_components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/_components/ui/dialog";
import { getAmenityIcon } from "@/constants/amenity-icons";
import { cn } from "@/lib/utils";
import type { Amenity } from "@/types/room";

interface Props {
  open: boolean;
  onClose: () => void;
  allAmenities: Amenity[];
  values: number[];
  updateValues: (ids: number[]) => void;
  onSubmit: () => void;
  loading: boolean;
}

export function UpdateAmenitiesModal({
  open,
  onClose,
  allAmenities,
  values,
  updateValues,
  onSubmit,
  loading,
}: Props) {
  const toggle = (id: number) => {
    const set = new Set(values);
    set.has(id) ? set.delete(id) : set.add(id);
    updateValues([...set]);
  };

  const grouped = Object.groupBy(allAmenities, (a) => a.category || "Khác");

  const newLocal =
    "max-h-95 overflow-y-auto space-y-5 pr-1.5 beautiful-scrollbar py-2";
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100%-2rem)] sm:max-w-2xl p-5 sm:p-6 rounded-2xl max-h-[85vh] overflow-y-auto beautiful-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white">
            Cập nhật tiện nghi
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Chọn các tiện nghi mà phòng này cung cấp
          </DialogDescription>
        </DialogHeader>

        <div className={newLocal}>
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="space-y-2.5">
              <h3 className="text-[10px] sm:text-xs font-bold uppercase text-primary tracking-wider">
                {category}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {items?.map((a) => {
                  const isChecked = values.includes(a.id);
                  return (
                    <label
                      key={a.id}
                      className={cn(
                        "flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer select-none transition-all duration-200",
                        isChecked
                          ? "border-primary/60 bg-primary/5 dark:bg-primary/10 shadow-2xs"
                          : "border-slate-200/80 dark:border-slate-800/80 hover:border-slate-350 dark:hover:border-slate-650 hover:bg-slate-50/50 dark:hover:bg-slate-850/50",
                      )}
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => toggle(a.id)}
                        className="border-slate-400 dark:border-slate-650"
                      />

                      <div
                        className={cn(
                          "flex items-center gap-2 font-medium text-xs sm:text-sm transition-colors",
                          isChecked
                            ? "text-primary dark:text-primary-light font-semibold"
                            : "text-slate-700 dark:text-slate-300",
                        )}
                      >
                        {getAmenityIcon(a.name)}
                        <span>{a.name}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          {allAmenities.length === 0 && (
            <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 italic py-2">
              Không có tiện nghi nào khả dụng.
            </p>
          )}
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
