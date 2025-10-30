"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface RoomFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room?: any;
  onSubmit: (data: any) => void;
}

const AMENITIES = [
  { id: "wifi", label: "WiFi" },
  { id: "ac", label: "Điều hòa" },
  { id: "tv", label: "TV" },
  { id: "kitchen", label: "Bếp" },
  { id: "parking", label: "Chỗ đỗ xe" },
  { id: "pool", label: "Hồ bơi" },
  { id: "gym", label: "Phòng tập" },
  { id: "washer", label: "Máy giặt" },
  { id: "dryer", label: "Máy sấy" },
  { id: "heating", label: "Sưởi ấm" },
  { id: "balcony", label: "Ban công" },
  { id: "garden", label: "Vườn" },
];

export function RoomFormModal({
  open,
  onOpenChange,
  room,
  onSubmit,
}: RoomFormModalProps) {
  const [formData, setFormData] = useState(
    room || {
      name: "",
      roomNumber: "",
      type: "standard",
      capacity: 2,
      price: "",
      description: "",
      amenities: [],
      status: "available",
    }
  );

  const handleAmenityChange = (amenityId: string) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.includes(amenityId)
        ? formData.amenities.filter((id: string) => id !== amenityId)
        : [...formData.amenities, amenityId],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {room ? "Chỉnh sửa phòng" : "Thêm phòng mới"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên phòng</Label>
              <Input
                id="name"
                placeholder="VD: Phòng Deluxe 101"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="roomNumber">Số phòng</Label>
              <Input
                id="roomNumber"
                placeholder="VD: 101"
                value={formData.roomNumber}
                onChange={(e) =>
                  setFormData({ ...formData, roomNumber: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Loại phòng</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="deluxe">Deluxe</SelectItem>
                  <SelectItem value="suite">Suite</SelectItem>
                  <SelectItem value="villa">Villa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Sức chứa</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                value={formData.capacity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    capacity: Number.parseInt(e.target.value),
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Giá/đêm (VND)</Label>
              <Input
                id="price"
                type="number"
                placeholder="500000"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              placeholder="Nhập mô tả chi tiết về phòng"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
            />
          </div>

          <div className="space-y-3">
            <Label>Tiện nghi</Label>
            <div className="grid grid-cols-3 gap-3">
              {AMENITIES.map((amenity) => (
                <div key={amenity.id} className="flex items-center gap-2">
                  <Checkbox
                    id={amenity.id}
                    checked={formData.amenities.includes(amenity.id)}
                    onCheckedChange={() => handleAmenityChange(amenity.id)}
                  />
                  <Label
                    htmlFor={amenity.id}
                    className="font-normal cursor-pointer"
                  >
                    {amenity.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Trạng thái</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Có sẵn</SelectItem>
                <SelectItem value="booked">Đã đặt</SelectItem>
                <SelectItem value="maintenance">Bảo trì</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button type="submit" className="bg-warm-700 hover:bg-warm-800">
              {room ? "Cập nhật" : "Thêm"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
