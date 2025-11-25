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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CreateUserDto, Role } from "@/types/user";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";

interface UserCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateUserDto) => Promise<void> | void;
}

const initialState: CreateUserDto = {
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  phoneNumber: "",
  country: "",
  roleName: "USER",
};

const MIN_PASSWORD_LENGTH = 6;

export function UserCreateModal({
  open,
  onOpenChange,
  onSubmit,
}: UserCreateModalProps) {
  const [form, setForm] = useState<CreateUserDto>(initialState);
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setForm(initialState);
      setErrors({});
      setShowPwd(false);
    }
  }, [open]);

  const cleanFormData = (values: CreateUserDto): CreateUserDto => ({
    ...values,
    email: values.email.trim(),
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    phoneNumber: values.phoneNumber.trim(),
    country: values.country.trim(),
    roleName: values.roleName as Role,
  });

  function validate(values: CreateUserDto) {
    const e: Record<string, string> = {};

    if (!values.email) e.email = "Email không được để trống";
    else if (!/^\S+@\S+\.\S+$/.test(values.email))
      e.email = "Email không đúng định dạng";

    if (!values.password) {
      e.password = "Mật khẩu không được để trống";
    } else if (values.password.length < MIN_PASSWORD_LENGTH) {
      e.password = `Mật khẩu phải tối thiểu ${MIN_PASSWORD_LENGTH} ký tự`;
    }

    if (!values.firstName) e.firstName = "Họ không được để trống";
    if (!values.lastName) e.lastName = "Tên không được để trống";
    if (!values.phoneNumber)
      e.phoneNumber = "Số điện thoại không được để trống";
    if (!values.country) e.country = "Quốc gia không được để trống";

    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const dataToSend = cleanFormData(form);
    const eobj = validate(dataToSend);

    setErrors(eobj);
    if (Object.keys(eobj).length) return;

    try {
      setSubmitting(true);
      await onSubmit(dataToSend);
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Thêm người dùng mới</DialogTitle>
          <DialogDescription>
            Vui lòng nhập thông tin người dùng.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="off"
              placeholder="user@example.com"
              value={form.email}
              onChange={(e) =>
                setForm((s) => ({ ...s, email: e.target.value }))
              }
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPwd ? "text" : "password"}
                autoComplete="new-password"
                placeholder={`Tối thiểu ${MIN_PASSWORD_LENGTH} ký tự`}
                value={form.password}
                onChange={(e) =>
                  setForm((s) => ({ ...s, password: e.target.value }))
                }
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground cursor-pointer"
                aria-label={showPwd ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPwd ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Họ</Label>
              <Input
                id="firstName"
                placeholder="Nguyễn Văn"
                value={form.firstName}
                onChange={(e) =>
                  setForm((s) => ({ ...s, firstName: e.target.value }))
                }
              />
              {errors.firstName && (
                <p className="text-xs text-destructive">{errors.firstName}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Tên</Label>
              <Input
                id="lastName"
                placeholder="An"
                value={form.lastName}
                onChange={(e) =>
                  setForm((s) => ({ ...s, lastName: e.target.value }))
                }
              />
              {errors.lastName && (
                <p className="text-xs text-destructive">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                placeholder="0123456789"
                value={form.phoneNumber}
                onChange={(e) =>
                  setForm((s) => ({ ...s, phoneNumber: e.target.value }))
                }
              />
              {errors.phoneNumber && (
                <p className="text-xs text-destructive">{errors.phoneNumber}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Quốc gia</Label>
              <Input
                id="country"
                placeholder="Việt Nam"
                value={form.country}
                onChange={(e) =>
                  setForm((s) => ({ ...s, country: e.target.value }))
                }
              />
              {errors.country && (
                <p className="text-xs text-destructive">{errors.country}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Vai trò</Label>
            <Select
              value={form.roleName ?? "USER"}
              onValueChange={(value) =>
                setForm((s) => ({ ...s, roleName: value as Role }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">USER</SelectItem>
                <SelectItem value="HOST">HOST</SelectItem>
                <SelectItem value="ADMIN">ADMIN</SelectItem>
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
            <Button type="submit" disabled={submitting}>
              {submitting ? "Đang tạo..." : "Thêm"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
