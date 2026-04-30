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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/_components/ui/select";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import type { BaseLocation } from "@/services/admin/locationsApi";

const MapPicker = dynamic(
  () => import("../../_components/MapPicker").then((m) => m.MapPicker),
  {
    ssr: false,
    loading: () => (
      <div className="h-50 bg-muted rounded-lg animate-pulse" />
    ),
  }
);

type UITypes = "Country" | "Province" | "District" | "Ward";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (raw: {
    name: string;
    code?: string;
    parentId?: string;
    latitude?: number;
    longitude?: number;
  }) => void;
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
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const isCountry = currentType === "Country";
  const isProvince = currentType === "Province";
  const parentLabel = parentLabelMap[currentType] ?? "";

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setName("");
      setCode("");
      setParentId("");
      setLatitude(null);
      setLongitude(null);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  const handleSubmit = () => {
    const raw: any = { name };
    if (isCountry) raw.code = code;
    else raw.parentId = parentId;

    if (isProvince) {
      if (latitude !== null) raw.latitude = latitude;
      if (longitude !== null) raw.longitude = longitude;
    }

    onSubmit(raw);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={isProvince ? "max-w-2xl" : "max-w-md"}>
        <DialogHeader>
          <DialogTitle>Thêm {currentType}</DialogTitle>
          <DialogDescription>
            Vui lòng nhập thông tin để tạo mới {currentType}.
          </DialogDescription>
        </DialogHeader>

        <div className={`grid gap-5 py-2 ${isProvince ? "grid-cols-2" : "grid-cols-1"}`}>
          <div className="space-y-5">
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

            {isProvince && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Vĩ độ (Lat)</label>
                  <Input
                    type="number"
                    value={latitude ?? ""}
                    onChange={(e) => setLatitude(parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Kinh độ (Lng)</label>
                  <Input
                    type="number"
                    value={longitude ?? ""}
                    onChange={(e) => setLongitude(parseFloat(e.target.value))}
                  />
                </div>
              </div>
            )}
          </div>

          {isProvince && (
            <div className="space-y-1">
              <label className="text-sm font-medium">Vị trí bản đồ</label>
              <MapPicker
                lat={latitude}
                lng={longitude}
                address={name}
                onChange={(lat, lng) => {
                  setLatitude(lat);
                  setLongitude(lng);
                }}
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
