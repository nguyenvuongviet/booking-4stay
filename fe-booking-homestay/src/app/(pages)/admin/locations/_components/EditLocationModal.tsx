"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import { BaseLocation } from "@/services/admin/locationsApi";

type UITypes = "Country" | "Province" | "District" | "Ward";

interface Props {
  open: boolean;
  onClose: () => void;
  item: BaseLocation | null;
  parents: BaseLocation[];
  currentType: UITypes;
  onSubmit: (payload: any) => void;
}

export function EditLocationModal({
  open,
  onClose,
  item,
  parents,
  currentType,
  onSubmit,
}: Props) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [parentId, setParentId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const isCountry = currentType === "Country";
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open && item) {
      setName(item.name || "");
      setCode(item.code || "");

      if (currentType === "Province") setParentId(String(item.countryId));
      if (currentType === "District") setParentId(String(item.provinceId));
      if (currentType === "Ward") setParentId(String(item.districtId));

      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, item, currentType]);

  const parentLabel =
    currentType === "Province"
      ? "Country"
      : currentType === "District"
      ? "Province"
      : currentType === "Ward"
      ? "District"
      : "";

  const handleSubmit = async () => {
    const payload: any = {
      name,
      existingParentId:
        item?.countryId || item?.provinceId || item?.districtId || null,
    };

    if (isCountry) payload.code = code;
    else payload.parentId = parentId;

    onSubmit(payload);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cập nhật {currentType}</DialogTitle>
          <DialogDescription>Điều chỉnh thông tin bên dưới.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {!isCountry && (
            <div className="space-y-1">
              <label className="text-sm font-medium">{parentLabel}</label>
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
            <label className="text-sm font-medium">Tên</label>
            <Input
              ref={inputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {isCountry && (
            <div className="space-y-1">
              <label className="text-sm font-medium">Mã code</label>
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
          <Button onClick={handleSubmit}>Cập nhật</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
