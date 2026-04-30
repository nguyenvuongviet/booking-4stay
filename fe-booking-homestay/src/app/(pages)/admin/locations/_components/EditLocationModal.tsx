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
import { Database, Flag, Globe, Info, MapPin } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import { BaseLocation } from "@/services/admin/locationsApi";

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
  item: BaseLocation | null;
  parents: BaseLocation[];
  countries: BaseLocation[];
  provinces: BaseLocation[];
  currentType: UITypes;
  onSubmit: (raw: {
    name: string;
    code?: string;
    parentId?: string;
    latitude?: number;
    longitude?: number;
    existingParentId?: string | number | null;
  }) => void;
}

export function EditLocationModal({
  open,
  onClose,
  item,
  currentType,
  countries,
  provinces,
  onSubmit,
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
  const inputRef = useRef<HTMLInputElement | null>(null);

  const currentLabel =
    currentType === "Country"
      ? "Quốc gia"
      : currentType === "Province"
        ? "Tỉnh/Thành phố"
        : currentType === "Ward"
          ? "Phường/Xã"
          : currentType;

  useEffect(() => {
    if (open && item) {
      setName(item.name || "");
      setCode(item.code || "");
      setLatitude(item.latitude ?? null);
      setLongitude(item.longitude ?? null);

      if (isProvince) {
        setSelectedCountryId(String(item.countryId || ""));
      } else if (isWard) {
        setSelectedProvinceId(String(item.provinceId || ""));
        const parentProv = provinces.find(
          (p) => p.id === Number(item.provinceId),
        );
        if (parentProv?.countryId) {
          setSelectedCountryId(String(parentProv.countryId));
        }
      }

      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, item, currentType, provinces]);

  const handleSubmit = async () => {
    let finalParentId = null;
    if (isProvince) finalParentId = selectedCountryId;
    if (isWard) finalParentId = selectedProvinceId;

    const payload: any = {
      name,
      existingParentId: item?.countryId || item?.provinceId || null,
    };

    if (isCountry) payload.code = code;
    else payload.parentId = finalParentId;

    if (isProvince) {
      payload.latitude = latitude;
      payload.longitude = longitude;
    }

    onSubmit(payload);
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
        className={`${isProvince ? "max-w-4xl" : "max-w-xl"} border-white/10 p-0 overflow-hidden bg-background/95 backdrop-blur-xl shadow-2xl`}
      >
        <div className="bg-amber-500/10 p-6 border-b border-amber-500/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black bg-clip-text text-transparent bg-linear-to-r from-amber-500 to-orange-600">
              Cập nhật {currentLabel}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium">
              Chỉnh sửa thông tin vị trí hiện tại. Các thay đổi sẽ được áp dụng
              ngay lập tức.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div
          className={`grid gap-0 ${isProvince ? "grid-cols-2" : "grid-cols-1"}`}
        >
          <div className="p-8 space-y-6 border-r border-white/5">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 mb-2">
              <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-xs text-muted-foreground">
                Đang chỉnh sửa:{" "}
                <span className="text-foreground font-bold">{item?.name}</span>
                <br />
                ID Hệ thống: #<span className="font-mono">{item?.id}</span>
              </div>
            </div>

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
                    }}
                    placeholder="Tìm kiếm và chọn Quốc gia..."
                    className="h-12 rounded-2xl bg-white/5 border-white/10 focus:ring-amber-500/20 hover:bg-white/10 transition-colors"
                  />
                </div>

                {isWard && (
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
                      onChange={setSelectedProvinceId}
                      placeholder={
                        !selectedCountryId
                          ? "Vui lòng chọn Quốc gia trước"
                          : "Tìm kiếm Tỉnh/Thành phố..."
                      }
                      className="h-12 rounded-2xl bg-white/5 border-white/10 focus:ring-amber-500/20 hover:bg-white/10 transition-colors"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2 border-t border-white/10 pt-4 mt-4">
              <label className="text-sm font-bold flex items-center gap-2">
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
                className="h-12 rounded-2xl bg-white/5 border-white/10 focus:ring-amber-500/20"
              />
            </div>

            {isCountry && (
              <div className="space-y-2">
                <label className="text-sm font-bold flex items-center gap-2">
                  <span className="p-1 rounded bg-purple-500/20 text-purple-500">
                    <Database className="w-3.5 h-3.5" />
                  </span>
                  Mã code (ISO) <span className="text-red-500">*</span>
                </label>
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="h-12 rounded-2xl bg-white/5 border-white/10 focus:ring-amber-500/20 font-mono font-bold text-amber-500"
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
            className="rounded-2xl px-10 font-bold bg-linear-to-r from-amber-500 to-orange-600 hover:scale-[1.02] transition-transform active:scale-95 shadow-lg shadow-amber-500/20"
          >
            Lưu Thay Đổi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
