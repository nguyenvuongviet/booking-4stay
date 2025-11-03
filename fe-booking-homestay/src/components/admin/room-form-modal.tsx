"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import type { Room, CreateRoomDto, UpdateRoomDto } from "@/types/room";

interface RoomFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditMode?: boolean; // true: chỉnh sửa, false: thêm mới
  initialData?: Room | null;
  onSubmit: (data: CreateRoomDto | UpdateRoomDto) => Promise<void>;
  saving?: boolean;
}

export function RoomFormModal({
  open,
  onOpenChange,
  isEditMode = false,
  initialData = null,
  onSubmit,
  saving = false,
}: RoomFormModalProps) {
  const { toast } = useToast();

  const [form, setForm] = useState<CreateRoomDto | UpdateRoomDto>({
    name: "",
    description: "",
    price: 0,
    adultCapacity: 1,
    childCapacity: 0,
    locationId: 0,
  });

  // 🔄 Đồng bộ dữ liệu khi mở modal hoặc thay đổi initialData
  useEffect(() => {
    if (isEditMode && initialData) {
      setForm({
        name: initialData.name,
        description: initialData.description ?? "",
        price: initialData.price,
        adultCapacity: initialData.adultCapacity,
        childCapacity: initialData.childCapacity ?? 0,
        // locationId: initialData.location?.id || 0,
      });
    } else {
      setForm({
        name: "",
        description: "",
        price: 0,
        adultCapacity: 1,
        childCapacity: 0,
        locationId: 0,
      });
    }
  }, [initialData, open, isEditMode]);

  // ✅ Gửi dữ liệu form
  const handleSave = async () => {
    if (!form.name || !form.price || !form.adultCapacity) {
      toast({
        variant: "destructive",
        title: "Thiếu thông tin bắt buộc",
        description: "Vui lòng nhập đầy đủ tên, giá và sức chứa người lớn.",
      });
      return;
    }

    await onSubmit({
      ...form,
      price: Number(form.price),
      adultCapacity: Number(form.adultCapacity),
      childCapacity: Number(form.childCapacity ?? 0),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Chỉnh sửa phòng" : "Thêm phòng mới"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Cập nhật thông tin chi tiết của phòng."
              : "Nhập thông tin để tạo phòng mới."}
          </DialogDescription>
        </DialogHeader>

        {/* FORM */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
          {/* Tên phòng */}
          <div>
            <Label htmlFor="name">Tên phòng</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              placeholder="Phòng Deluxe view biển"
              required
            />
          </div>

          {/* Giá */}
          <div>
            <Label htmlFor="price">Giá / đêm (₫)</Label>
            <Input
              id="price"
              type="number"
              min={0}
              value={form.price}
              onChange={(e) =>
                setForm((s) => ({ ...s, price: Number(e.target.value) }))
              }
              placeholder="500000"
              required
            />
          </div>

          {/* Sức chứa NL */}
          <div>
            <Label htmlFor="adultCapacity">Sức chứa (Người lớn)</Label>
            <Input
              id="adultCapacity"
              type="number"
              min={1}
              value={form.adultCapacity}
              onChange={(e) =>
                setForm((s) => ({
                  ...s,
                  adultCapacity: Number(e.target.value),
                }))
              }
            />
          </div>

          {/* Sức chứa TE */}
          <div>
            <Label htmlFor="childCapacity">Sức chứa (Trẻ em)</Label>
            <Input
              id="childCapacity"
              type="number"
              min={0}
              value={form.childCapacity ?? 0}
              onChange={(e) =>
                setForm((s) => ({
                  ...s,
                  childCapacity: Number(e.target.value),
                }))
              }
            />
          </div>

          {/* Mô tả */}
          <div className="col-span-full">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              rows={3}
              value={form.description ?? ""}
              onChange={(e) =>
                setForm((s) => ({ ...s, description: e.target.value }))
              }
              placeholder="Nhập mô tả chi tiết của phòng..."
            />
          </div>

          {/* Vị trí */}
          <div className="col-span-full">
            <Label>Vị trí (Location ID)</Label>
            <Select
              value={form.locationId ? String(form.locationId) : ""}
              onValueChange={(v) =>
                setForm((s) => ({ ...s, locationId: Number(v) }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn vị trí" />
              </SelectTrigger>
              <SelectContent>
                {/* ⚠️ TODO: sau này load động từ API /location/all */}
                <SelectItem value="1">Hà Nội</SelectItem>
                <SelectItem value="2">Đà Nẵng</SelectItem>
                <SelectItem value="3">TP. Hồ Chí Minh</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {saving ? "Đang lưu..." : isEditMode ? "Lưu thay đổi" : "Tạo phòng"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
