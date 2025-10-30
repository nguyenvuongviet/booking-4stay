"use client";

import { Badge } from "@/components/ui/badge";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/lib/utils/date";
import type { Role, UpdateUserDto, User } from "@/types/user";
import { useEffect, useState } from "react";
import { Switch } from "../ui/switch";
import { CalendarDays } from "lucide-react";

interface UserEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UpdateUserDto) => Promise<void>;
  initialData: UpdateUserDto;
  saving?: boolean;
  meta?: Partial<Pick<User, "email" | "createdAt" | "isVerified">>;
}

function toDateInputValue(src?: string | null | Date) {
  if (!src) return "";
  const d = typeof src === "string" ? new Date(src) : src;
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function UserEditModal({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  saving = false,
  meta,
}: UserEditModalProps) {
  const [form, setForm] = useState<UpdateUserDto>(initialData);

  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialData,
        dateOfBirth: toDateInputValue(initialData.dateOfBirth),
      });
    }
  }, [initialData]);

  const handleSave = async () => {
    const payload: UpdateUserDto = {
      firstName: form.firstName?.trim() || null,
      lastName: form.lastName?.trim() || null,
      phoneNumber: form.phoneNumber?.trim() || null,
      country: form.country?.trim() || null,
      roleName: form.roleName,
      dateOfBirth: form.dateOfBirth || null,
      gender: form.gender,
      isActive: form.isActive,
    };

    await onSubmit(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa thông tin</DialogTitle>
          <DialogDescription>Cập nhật thông tin người dùng.</DialogDescription>
        </DialogHeader>

        {(meta?.email ||
          meta?.createdAt ||
          typeof meta?.isVerified === "boolean") && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 -mt-2">
            {meta?.email && (
              <div>
                <Label>Email</Label>
                <Input value={meta.email} disabled className="mt-1" />
              </div>
            )}
            {meta?.createdAt && (
              <div>
                <Label>Ngày tạo</Label>
                <Input
                  value={formatDate(meta.createdAt as any)}
                  disabled
                  className="mt-1"
                />
              </div>
            )}
            {typeof meta?.isVerified === "boolean" && (
              <div className="flex flex-col">
                <Label>Xác minh</Label>
                <div className="mt-2">
                  {meta.isVerified ? (
                    <Badge className="bg-emerald-100 text-emerald-800">
                      Đã xác minh
                    </Badge>
                  ) : (
                    <Badge className="bg-rose-100 text-rose-700">
                      Chưa xác minh
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
          <div>
            <Label htmlFor="firstName">Họ</Label>
            <Input
              id="firstName"
              value={form.firstName ?? ""}
              onChange={(e) =>
                setForm((s) => ({ ...s, firstName: e.target.value }))
              }
              placeholder="Nguyễn Văn"
            />
          </div>

          <div>
            <Label htmlFor="lastName">Tên</Label>
            <Input
              id="lastName"
              value={form.lastName ?? ""}
              onChange={(e) =>
                setForm((s) => ({ ...s, lastName: e.target.value }))
              }
              placeholder="An"
            />
          </div>

          <div>
            <Label htmlFor="phoneNumber">Số điện thoại</Label>
            <Input
              id="phoneNumber"
              value={form.phoneNumber ?? ""}
              onChange={(e) =>
                setForm((s) => ({ ...s, phoneNumber: e.target.value }))
              }
              placeholder="0123456789"
            />
          </div>

          <div>
            <Label htmlFor="country">Quốc gia</Label>
            <Input
              id="country"
              value={form.country ?? ""}
              onChange={(e) =>
                setForm((s) => ({ ...s, country: e.target.value }))
              }
              placeholder="Việt Nam"
            />
          </div>

          <div>
            <Label>Vai trò</Label>
            <Select
              value={(form.roleName as Role) ?? "USER"}
              onValueChange={(v) =>
                setForm((s) => ({ ...s, roleName: v as Role }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">ADMIN</SelectItem>
                <SelectItem value="HOST">HOST</SelectItem>
                <SelectItem value="USER">USER</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Giới tính</Label>
            <Select
              value={(form.gender as any) ?? "OTHER"}
              onValueChange={(v) => setForm((s) => ({ ...s, gender: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn giới tính" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MALE">Nam</SelectItem>
                <SelectItem value="FEMALE">Nữ</SelectItem>
                <SelectItem value="OTHER">Khác</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="relative">
            <Label htmlFor="dob">Ngày sinh</Label>
            <Input
              id="dob"
              type="date"
              value={toDateInputValue(form.dateOfBirth ?? "")}
              onChange={(e) =>
                setForm((s) => ({ ...s, dateOfBirth: e.target.value }))
              }
              className="pr-10"
            />
          </div>

          <div className="flex items-center gap-3 mt-2">
            <Switch
              id="isActive"
              checked={!!form.isActive}
              onCheckedChange={(v) => setForm((s) => ({ ...s, isActive: v }))}
            />
            <Label htmlFor="isActive">Hoạt động</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
