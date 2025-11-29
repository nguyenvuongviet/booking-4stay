"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getAmenityIcon } from "@/constants/amenity-icons";
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Cập nhật tiện nghi
          </DialogTitle>
          <DialogDescription>
            Chọn các tiện nghi mà phòng này cung cấp
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[420px] overflow-y-auto space-y-6 pr-2">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="space-y-3">
              <h3 className="text-sm font-semibold uppercase text-primary">
                {category}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {items?.map((a) => (
                  <label
                    key={a.id}
                    className="flex items-center gap-3 p-2 rounded-lg border hover:bg-accent cursor-pointer transition"
                  >
                    <Checkbox
                      checked={values.includes(a.id)}
                      onCheckedChange={() => toggle(a.id)}
                    />

                    <div className="flex items-center gap-2">
                      {getAmenityIcon(a.name)}
                      <span className="text-sm">{a.name}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ))}

          {allAmenities.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Không có tiện nghi nào.
            </p>
          )}
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
