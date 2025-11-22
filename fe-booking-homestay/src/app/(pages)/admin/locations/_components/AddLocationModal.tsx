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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useRef, useState } from "react";

import type { BaseLocation } from "@/services/admin/locationsApi";

type UITypes = "Country" | "Province" | "District" | "Ward";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (raw: { name: string; code?: string; parentId?: string }) => void;
  currentType: UITypes;
  parents: BaseLocation[];
}

const parentLabelMap: Partial<Record<UITypes, string>> = {
  Province: "Country",
  District: "Province",
  Ward: "District",
};

export function AddLocationModal({
  open,
  onClose,
  onSubmit,
  currentType,
  parents,
}: Props) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [parentId, setParentId] = useState("");

  const isCountry = currentType === "Country";
  const parentLabel = parentLabelMap[currentType] ?? "";

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setName("");
      setCode("");
      setParentId("");
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  const handleSubmit = () => {
    const raw: any = { name };
    if (isCountry) raw.code = code;
    else raw.parentId = parentId;

    onSubmit(raw);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Thêm {currentType}</DialogTitle>
          <DialogDescription>
            Vui lòng nhập thông tin để tạo mới {currentType}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {!isCountry && (
            <div className="space-y-1">
              <label className="text-sm font-medium">{parentLabel} *</label>
              <Select value={parentId} onValueChange={setParentId}>
                <SelectTrigger>
                  <SelectValue placeholder={`Chọn ${parentLabel}`} />
                </SelectTrigger>
                <SelectContent>
                  {parents.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium">Tên *</label>
            <Input
              ref={inputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {isCountry && (
            <div className="space-y-1">
              <label className="text-sm font-medium">Mã Code *</label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleSubmit}>Lưu</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
