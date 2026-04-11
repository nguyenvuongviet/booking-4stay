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

import { BaseLocation } from "@/services/admin/locationsApi";

const MapPicker = dynamic(
  () => import("../../_components/MapPicker").then((m) => m.MapPicker),
  {
    ssr: false,
    loading: () => (
      <div className="h-[200px] bg-muted rounded-lg animate-pulse" />
    ),
  },
);

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
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const isCountry = currentType === "Country";
  const isProvince = currentType === "Province";
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open && item) {
      setName(item.name || "");
      setCode(item.code || "");
      setLatitude(item.latitude ?? null);
      setLongitude(item.longitude ?? null);

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

    if (isProvince) {
      payload.latitude = latitude;
      payload.longitude = longitude;
    }

    onSubmit(payload);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={isProvince ? "max-w-2xl" : "max-w-md"}>
        <DialogHeader>
          <DialogTitle>Cập nhật {currentType}</DialogTitle>
          <DialogDescription>Điều chỉnh thông tin bên dưới.</DialogDescription>
        </DialogHeader>

        <div
          className={`grid gap-5 py-2 ${isProvince ? "grid-cols-2" : "grid-cols-1"}`}
        >
          <div className="space-y-5">
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
          <Button onClick={handleSubmit}>Cập nhật</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
