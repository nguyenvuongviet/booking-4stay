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
import {
  createLoyaltyLevel,
  LoyaltyLevel,
  updateLoyaltyLevel,
} from "@/services/admin/loyaltyApi";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface LevelModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  editData?: LoyaltyLevel | null;
}

export default function LevelModal({
  open,
  onClose,
  onSaved,
  editData,
}: LevelModalProps) {
  const isEdit = !!editData;

  const [name, setName] = useState("");
  const [minPoints, setMinPoints] = useState<number | string>(0);
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (editData) {
      setName(editData.name);
      setMinPoints(editData.minPoints);
      setDescription(editData.description ?? "");
    } else {
      setName("");
      setMinPoints("");
      setDescription("");
    }
  }, [editData]);

  const handleSave = async () => {
    try {
      const payload = {
        name,
        minPoints: Number(minPoints),
        description,
      };

      if (isEdit && editData) {
        await updateLoyaltyLevel(editData.id, payload);
        toast.success("Cập nhật cấp độ thành công!");
      } else {
        await createLoyaltyLevel(payload);
        toast.success("Tạo cấp độ mới thành công!");
      }

      onSaved();
      onClose();
    } catch {
      toast.error("Không thể lưu cấp độ, vui lòng thử lại!");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-xl shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {isEdit ? "Chỉnh sửa cấp độ" : "Tạo cấp độ mới"}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? "Chình sửa cấp độ cơ bản." : "Tạo cấp độ cơ bản."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Tên cấp độ</label>
            <Input
              placeholder="Ví dụ: GOLD, SILVER, VIP..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Tên cấp độ hiển thị cho khách hàng.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Điểm tối thiểu</label>
            <Input
              type="number"
              placeholder="VD: 1000"
              value={minPoints}
              onChange={(e) => setMinPoints(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Số điểm tối thiểu để đạt cấp độ này.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Mô tả</label>
            <Input
              placeholder="Quyền lợi, ưu đãi dành cho cấp độ này..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="mt-3">
          <Button variant="outline" onClick={onClose} className="px-4">
            Hủy
          </Button>
          <Button onClick={handleSave} className="px-5 text-white">
            {isEdit ? "Lưu thay đổi" : "Tạo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
