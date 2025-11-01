"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  createLocation,
  getAllProvinces,
  getDistricts,
  getWards,
} from "@/services/admin/locationsApi";
import type { CreateRoomDto } from "@/types/room";

interface ProvinceItem {
  province: string;
  image?: string | null;
}

export function RoomFormModal({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateRoomDto) => void;
}) {
  const [formData, setFormData] = useState<CreateRoomDto>({
    name: "",
    description: "",
    price: 0,
    adultCapacity: 1,
    childCapacity: 0,
    locationId: 0,
  });

  // --- LOCATION ---
  const [provinces, setProvinces] = useState<ProvinceItem[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [wards, setWards] = useState<string[]>([]);

  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [ward, setWard] = useState("");
  const [street, setStreet] = useState("");

  const [loading, setLoading] = useState(false);

  // 🔹 Load provinces
  useEffect(() => {
    (async () => {
      try {
        const list = await getAllProvinces();
        setProvinces(list);
      } catch (err) {
        console.error("Load provinces failed:", err);
      }
    })();
  }, []);

  // 🔹 Load districts
  useEffect(() => {
    if (!province) return;
    (async () => {
      const list = await getDistricts(province);
      setDistricts(list);
      setDistrict("");
      setWards([]);
    })();
  }, [province]);

  // 🔹 Load wards
  useEffect(() => {
    if (!province || !district) return;
    (async () => {
      const list = await getWards(province, district);
      setWards(list);
      setWard("");
    })();
  }, [district]);

  // --- SUBMIT FORM ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      const loc = await createLocation({
        province,
        district,
        ward,
        street,
      });
      const payload: CreateRoomDto = {
        ...formData,
        locationId: loc.id,
      };
      onSubmit(payload);
      onOpenChange(false);
    } catch (err) {
      console.error("Submit room failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thêm phòng mới</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* THÔNG TIN PHÒNG */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Tên phòng</Label>
              <Input
                placeholder="VD: Phòng Deluxe 101"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Giá/đêm (VND)</Label>
              <Input
                type="number"
                min={0}
                value={formData.price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Người lớn</Label>
              <Input
                type="number"
                min={1}
                value={formData.adultCapacity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    adultCapacity: Number(e.target.value),
                  })
                }
              />
            </div>

            <div>
              <Label>Trẻ em</Label>
              <Input
                type="number"
                min={0}
                value={formData.childCapacity || 0}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    childCapacity: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>

          <div>
            <Label>Mô tả</Label>
            <Textarea
              rows={3}
              placeholder="Mô tả ngắn về phòng..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          {/* ĐỊA ĐIỂM */}
          <div className="space-y-3">
            <Label>Vị trí phòng</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Province */}
              <Select value={province} onValueChange={setProvince}>
                <SelectTrigger>
                  <SelectValue placeholder="Tỉnh / Thành phố" />
                </SelectTrigger>
                <SelectContent>
                  {provinces.map((p) => (
                    <SelectItem key={p.province} value={p.province}>
                      <div className="flex items-center gap-2">
                        {p.image && (
                          <img
                            src={p.image}
                            alt={p.province}
                            className="w-5 h-5 rounded-sm object-cover"
                          />
                        )}
                        <span>{p.province}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* District */}
              <Select
                value={district}
                onValueChange={setDistrict}
                disabled={!province}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Quận / Huyện" />
                </SelectTrigger>
                <SelectContent>
                  {districts.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Ward */}
              <Select value={ward} onValueChange={setWard} disabled={!district}>
                <SelectTrigger>
                  <SelectValue placeholder="Phường / Xã" />
                </SelectTrigger>
                <SelectContent>
                  {wards.map((w) => (
                    <SelectItem key={w} value={w}>
                      {w}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Street */}
              <Input
                placeholder="Đường (nếu có)"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
              />
            </div>
          </div>

          {/* FOOTER */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Đang lưu..." : "Thêm phòng"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
