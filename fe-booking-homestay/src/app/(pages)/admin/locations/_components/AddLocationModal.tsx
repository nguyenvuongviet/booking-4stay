"use client";

import { Button } from "@/_components/ui/button";
import { Combobox } from "@/_components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/_components/ui/dialog";
import { Input } from "@/_components/ui/input";
import { Database, Flag, Globe, MapPin } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import type { BaseLocation } from "@/services/admin/locationsApi";

const MapPicker = dynamic(
  () => import("../../_components/MapPicker").then((m) => m.MapPicker),
  {
    ssr: false,
    loading: () => <div className="h-50 bg-muted rounded-lg animate-pulse" />,
  },
);

type UITypes = "Country" | "Province" | "Ward";

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
  countries: BaseLocation[];
  provinces: BaseLocation[];
}

export function AddLocationModal({
  open,
  onClose,
  onSubmit,
  currentType,
  countries,
  provinces,
}: Props) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [selectedCountryId, setSelectedCountryId] = useState("");
  const [selectedProvinceId, setSelectedProvinceId] = useState("");

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const isCountry = currentType === "Country";
  const isProvince = currentType === "Province";
  const isWard = currentType === "Ward";

  const currentLabel =
    currentType === "Country"
      ? "Quốc gia"
      : currentType === "Province"
        ? "Tỉnh/Thành phố"
        : currentType === "Ward"
          ? "Phường/Xã"
          : currentType;

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setName("");
      setCode("");
      setSelectedCountryId("");
      setSelectedProvinceId("");
      setLatitude(null);
      setLongitude(null);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  const handleSubmit = () => {
    const raw: any = { name };
    if (isCountry) raw.code = code;
    else {
      if (isProvince) raw.parentId = selectedCountryId;
      else if (isWard) raw.parentId = selectedProvinceId;
    }

    if (isProvince) {
      if (latitude !== null) raw.latitude = latitude;
      if (longitude !== null) raw.longitude = longitude;
    }

    onSubmit(raw);
    onClose();
  };

  const countryOptions = countries.map((c) => ({
    value: String(c.id),
    label: c.name,
  }));

  const provinceOptions = provinces
    .filter(
      (p) => !selectedCountryId || String(p.countryId) === selectedCountryId,
    )
    .map((p) => ({ value: String(p.id), label: p.name }));

  const isValidToSubmit = () => {
    if (!name) return false;
    if (isCountry && !code) return false;
    if (isProvince && !selectedCountryId) return false;
    if (isWard && (!selectedCountryId || !selectedProvinceId)) return false;
    return true;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className={`${isProvince ? "max-w-4xl" : "max-w-xl"} border-border p-0 overflow-hidden bg-background shadow-2xl rounded-2xl w-[95vw] md:w-full`}
      >
        <div className="p-4 border-b border-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">
              Thêm {currentLabel}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs mt-1">
              Vui lòng nhập thông tin chi tiết để khởi tạo {currentLabel} mới
              trong hệ thống.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div
          className={`grid gap-0 ${isProvince ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"} max-h-[60vh] md:max-h-[70vh] overflow-y-auto`}
        >
          <div className="p-4 space-y-3 border-b md:border-b-0 md:border-r border-border">
            {!isCountry && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-sm font-bold flex items-center gap-2">
                    <span className="p-1 rounded bg-indigo-500/20 text-indigo-500">
                      <Globe className="w-3.5 h-3.5" />
                    </span>
                    Quốc gia{" "}
                    <span className="text-muted-foreground font-medium text-[10px] uppercase tracking-tighter">
                      (Bước 1)
                    </span>{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Combobox
                    options={countryOptions}
                    value={selectedCountryId}
                    onChange={(val) => {
                      setSelectedCountryId(val);
                      setSelectedProvinceId("");
                    }}
                    placeholder="Tìm kiếm và chọn Quốc gia..."
                    className="h-12 rounded-2xl bg-slate-50 dark:bg-white/5 border border-border hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                  />
                </div>

                {isWard && (
                  <div className="space-y-1">
                    <label className="text-sm font-bold flex items-center gap-2">
                      <span className="p-1 rounded bg-teal-500/20 text-teal-500">
                        <Flag className="w-3.5 h-3.5" />
                      </span>
                      Tỉnh/Thành phố{" "}
                      <span className="text-muted-foreground font-medium text-[10px] uppercase tracking-tighter">
                        (Bước 2)
                      </span>{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <Combobox
                      options={provinceOptions}
                      value={selectedProvinceId}
                      disabled={!selectedCountryId}
                      onChange={setSelectedProvinceId}
                      placeholder={
                        !selectedCountryId
                          ? "Vui lòng chọn Quốc gia trước"
                          : "Tìm kiếm Tỉnh/Thành phố..."
                      }
                      className="h-12 rounded-2xl bg-slate-50 dark:bg-white/5 border border-border hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="space-y-1 pt-2 border-t border-border mt-3">
              <label className="text-sm font-bold flex items-center gap-2 pt-3">
                <span className="p-1 rounded bg-cyan-500/20 text-cyan-500">
                  <MapPin className="w-3.5 h-3.5" />
                </span>
                Tên {currentLabel}{" "}
                <span className="text-muted-foreground font-medium text-[10px] uppercase tracking-tighter">
                  (Cuối cùng)
                </span>{" "}
                <span className="text-red-500">*</span>
              </label>
              <Input
                ref={inputRef}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={`Nhập tên ${currentLabel}...`}
                className="h-12 rounded-2xl bg-slate-50 dark:bg-white/5 border border-border"
              />
            </div>

            {isCountry && (
              <div className="space-y-1">
                <label className="text-sm font-bold flex items-center gap-2">
                  <span className="p-1 rounded bg-purple-500/20 text-purple-500">
                    <Database className="w-3.5 h-3.5" />
                  </span>
                  Mã Quốc gia (ISO Code) <span className="text-red-500">*</span>
                </label>
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Ví dụ: VN, US, JP..."
                  className="h-12 rounded-2xl bg-slate-50 dark:bg-white/5 border border-border font-mono font-bold"
                />
              </div>
            )}

            {isProvince && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-wider">
                    Vĩ độ (Lat)
                  </label>
                  <Input
                    type="number"
                    value={latitude ?? ""}
                    onChange={(e) => setLatitude(parseFloat(e.target.value))}
                    className="h-10 rounded-xl bg-white/5 border-white/10 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-wider">
                    Kinh độ (Lng)
                  </label>
                  <Input
                    type="number"
                    value={longitude ?? ""}
                    onChange={(e) => setLongitude(parseFloat(e.target.value))}
                    className="h-10 rounded-xl bg-white/5 border-white/10 font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {isProvince && (
            <div className="p-4 flex flex-col justify-center gap-3 bg-background">
              <label className="text-sm font-bold flex items-center gap-2">
                <span className="p-1 rounded bg-green-500/20 text-green-500 text-xs">
                  MAP
                </span>
                Vị trí bản đồ trực quan
              </label>
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

        <div className="p-4 border-t border-border flex justify-end gap-2 bg-background">
          <Button
            variant="ghost"
            onClick={onClose}
            className="rounded-xl px-6 hover:bg-accent font-semibold h-9 text-sm"
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValidToSubmit()}
            className="rounded-xl px-8 font-semibold bg-primary hover:bg-primary/90 text-white shadow-md active:scale-95 transition-transform h-9 text-sm"
          >
            Thêm Mới
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
