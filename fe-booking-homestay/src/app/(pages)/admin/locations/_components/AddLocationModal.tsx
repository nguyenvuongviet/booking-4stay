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
    loading: () => (
      <div className="h-[200px] bg-muted rounded-lg animate-pulse" />
    ),
  },
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
  countries: BaseLocation[];
  provinces: BaseLocation[];
  districts: BaseLocation[];
}

export function AddLocationModal({
  open,
  onClose,
  onSubmit,
  currentType,
  countries,
  provinces,
  districts,
}: Props) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  // Hierarchy states
  const [selectedCountryId, setSelectedCountryId] = useState("");
  const [selectedProvinceId, setSelectedProvinceId] = useState("");
  const [selectedDistrictId, setSelectedDistrictId] = useState("");

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const isCountry = currentType === "Country";
  const isProvince = currentType === "Province";
  const isDistrict = currentType === "District";
  const isWard = currentType === "Ward";

  const currentLabel =
    currentType === "Country"
      ? "Quốc gia"
      : currentType === "Province"
        ? "Tỉnh/Thành phố"
        : currentType === "District"
          ? "Quận/Huyện"
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
      setSelectedDistrictId("");
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
      else if (isDistrict) raw.parentId = selectedProvinceId;
      else if (isWard) raw.parentId = selectedDistrictId;
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

  const districtOptions = districts
    .filter(
      (d) => !selectedProvinceId || String(d.provinceId) === selectedProvinceId,
    )
    .map((d) => ({ value: String(d.id), label: d.name }));

  const isValidToSubmit = () => {
    if (!name) return false;
    if (isCountry && !code) return false;
    if (isProvince && !selectedCountryId) return false;
    if (isDistrict && (!selectedCountryId || !selectedProvinceId)) return false;
    if (
      isWard &&
      (!selectedCountryId || !selectedProvinceId || !selectedDistrictId)
    )
      return false;
    return true;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className={`${isProvince ? "max-w-4xl" : "max-w-xl"} border-white/10 p-0 overflow-hidden bg-background/95 backdrop-blur-xl shadow-2xl transition-all duration-500`}
      >
        <div className="bg-primary/10 p-6 border-b border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black bg-clip-text text-transparent bg-linear-to-r from-primary to-blue-600">
              Thêm {currentLabel}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium">
              Vui lòng nhập thông tin chi tiết để khởi tạo {currentLabel} mới
              trong hệ thống.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div
          className={`grid gap-0 ${isProvince ? "grid-cols-2" : "grid-cols-1"}`}
        >
          <div className="p-8 space-y-6 border-r border-white/5">
            {!isCountry && (
              <div className="space-y-4">
                <div className="space-y-2">
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
                      setSelectedDistrictId("");
                    }}
                    placeholder="Tìm kiếm và chọn Quốc gia..."
                    className="h-12 rounded-2xl bg-white/5 border-white/10 focus:ring-primary/20 hover:bg-white/10 transition-colors"
                  />
                </div>

                {(isDistrict || isWard) && (
                  <div className="space-y-2">
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
                      onChange={(val) => {
                        setSelectedProvinceId(val);
                        setSelectedDistrictId("");
                      }}
                      placeholder={
                        !selectedCountryId
                          ? "Vui lòng chọn Quốc gia trước"
                          : "Tìm kiếm Tỉnh/Thành phố..."
                      }
                      className="h-12 rounded-2xl bg-white/5 border-white/10 focus:ring-primary/20 hover:bg-white/10 transition-colors"
                    />
                  </div>
                )}

                {isWard && (
                  <div className="space-y-2">
                    <label className="text-sm font-bold flex items-center gap-2">
                      <span className="p-1 rounded bg-primary/20 text-primary">
                        <Database className="w-3.5 h-3.5" />
                      </span>
                      Quận/Huyện{" "}
                      <span className="text-muted-foreground font-medium text-[10px] uppercase tracking-tighter">
                        (Bước 3)
                      </span>{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <Combobox
                      options={districtOptions}
                      value={selectedDistrictId}
                      disabled={!selectedProvinceId}
                      onChange={setSelectedDistrictId}
                      placeholder={
                        !selectedProvinceId
                          ? "Vui lòng chọn Tỉnh/Thành trước"
                          : "Tìm kiếm Quận/Huyện..."
                      }
                      className="h-12 rounded-2xl bg-white/5 border-white/10 focus:ring-primary/20 hover:bg-white/10 transition-colors"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2 pt-2 border-t border-white/10 mt-4">
              <label className="text-sm font-bold flex items-center gap-2 pt-4">
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
                className="h-12 rounded-2xl bg-white/5 border-white/10 focus:ring-primary/20"
              />
            </div>

            {isCountry && (
              <div className="space-y-2">
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
                  className="h-12 rounded-2xl bg-white/5 border-white/10 focus:ring-primary/20 font-mono font-bold"
                />
              </div>
            )}

            {isProvince && (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
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
                <div className="space-y-2">
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
            <div className="bg-muted/30 p-8 flex flex-col justify-center gap-4">
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

        <div className="p-6 bg-white/5 border-t border-white/10 flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            className="rounded-2xl px-8 hover:bg-white/10 font-bold"
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValidToSubmit()}
            className="rounded-2xl px-10 font-bold bg-linear-to-r from-primary to-blue-600 hover:scale-[1.02] transition-transform active:scale-95 shadow-lg shadow-primary/20"
          >
            Lưu Vị Trí
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
