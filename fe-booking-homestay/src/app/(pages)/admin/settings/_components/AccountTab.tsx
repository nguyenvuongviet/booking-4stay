"use client";

import { Button } from "@/_components/ui/button";
import { Card } from "@/_components/ui/card";
import { Input } from "@/_components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/_components/ui/select";
import {
  validateFullName,
  validatePhoneNumber,
} from "@/_helper/validation.helper";
import { COUNTRIES } from "@/constants/countries";
import { useAuth } from "@/context/auth-context";
import { update_profile } from "@/services/authApi";
import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function AccountTab() {
  const { user, updateUser } = useAuth();

  const [profile, setProfile] = useState({
    fullName: user
      ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
      : "",
    email: user?.email ?? "",
    phoneNumber: user?.phoneNumber ?? "",
    country: user?.country ?? "",
    gender: user?.gender ?? "MALE",
    dateOfBirth: user?.dateOfBirth
      ? new Date(user.dateOfBirth).toISOString().substring(0, 10)
      : "",
  });

  const [errors, setErrors] = useState({
    fullName: "",
    phoneNumber: "",
  });

  useEffect(() => {
    if (user) {
      setProfile({
        fullName: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
        email: user.email ?? "",
        phoneNumber: user.phoneNumber ?? "",
        country: user.country ?? "",
        gender: user.gender ?? "MALE",
        dateOfBirth: user.dateOfBirth
          ? new Date(user.dateOfBirth).toISOString().substring(0, 10)
          : "",
      });
    }
  }, [user]);

  const handleProfileChange = (key: string, value: string) => {
    setProfile((prev) => ({ ...prev, [key]: value }));

    setErrors((prev) => {
      const nextErrors = { ...prev };
      if (key === "fullName") {
        nextErrors.fullName = validateFullName(value);
      }
      if (key === "phoneNumber") {
        nextErrors.phoneNumber = validatePhoneNumber(value);
      }
      return nextErrors;
    });
  };

  const saveProfile = async () => {
    if (!user) return;

    const nameErr = validateFullName(profile.fullName);
    const phoneErr = validatePhoneNumber(profile.phoneNumber);

    setErrors({
      fullName: nameErr,
      phoneNumber: phoneErr,
    });

    if (nameErr || phoneErr) {
      toast.error("Vui lòng sửa các lỗi nhập liệu trước khi lưu.");
      return;
    }

    const nameParts = profile.fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    try {
      const res = await update_profile({
        firstName,
        lastName,
        phoneNumber: profile.phoneNumber,
        country: profile.country,
        gender: profile.gender,
        dateOfBirth: profile.dateOfBirth
          ? new Date(profile.dateOfBirth).toISOString()
          : undefined,
      });

      if (res?.data) {
        updateUser({
          ...res.data,
          avatar: user.avatar,
        });
        toast.success("Cập nhật tài khoản thành công!");
      } else {
        updateUser({
          ...user,
          firstName,
          lastName,
          phoneNumber: profile.phoneNumber,
          country: profile.country,
          gender: profile.gender,
          dateOfBirth: profile.dateOfBirth
            ? new Date(profile.dateOfBirth).toISOString()
            : undefined,
        });
        toast.success("Cập nhật tài khoản thành công!");
      }
    } catch (error: any) {
      console.error(error);
      const errorMsg =
        error.response?.data?.message || "Cập nhật tài khoản thất bại";
      toast.error(errorMsg);
    }
  };

  return (
    <Card className="p-3.5 sm:p-6 md:p-8 max-w-2xl w-full border border-border/60 shadow-sm rounded-2xl animate-in fade-in-50 duration-200 bg-card">
      <div className="border-b border-border/60 pb-2 sm:pb-4 mb-1 sm:mb-3">
        <h2 className="text-base sm:text-xl font-bold">Thông tin tài khoản</h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
          Cập nhật thông tin định danh và địa chỉ liên lạc.
        </p>
      </div>
      <div className="space-y-2.5 sm:space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
          <div>
            <label className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Họ và tên
            </label>
            <Input
              value={profile.fullName}
              onChange={(e) => handleProfileChange("fullName", e.target.value)}
              placeholder="Nhập họ và tên"
              className={`h-9.5 sm:h-11 text-xs sm:text-sm rounded-lg bg-card focus-visible:ring-primary/20 ${
                errors.fullName
                  ? "border-red-500 focus-visible:ring-red-200"
                  : "border-border/80"
              }`}
            />
            {errors.fullName && (
              <p className="text-xs text-red-500 mt-1 animate-in fade-in-50 font-medium">
                {errors.fullName}
              </p>
            )}
          </div>
          <div>
            <label className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Số điện thoại
            </label>
            <Input
              value={profile.phoneNumber}
              onChange={(e) =>
                handleProfileChange("phoneNumber", e.target.value)
              }
              placeholder="Nhập số điện thoại"
              className={`h-9.5 sm:h-11 text-xs sm:text-sm rounded-lg bg-card focus-visible:ring-primary/20 ${
                errors.phoneNumber
                  ? "border-red-500 focus-visible:ring-red-200"
                  : "border-border/80"
              }`}
            />
            {errors.phoneNumber && (
              <p className="text-xs text-red-500 mt-1 animate-in fade-in-50 font-medium">
                {errors.phoneNumber}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
          <div>
            <label className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Email
            </label>
            <Input
              type="email"
              value={profile.email}
              disabled
              className="h-9.5 sm:h-11 text-xs sm:text-sm rounded-lg bg-muted/30 cursor-not-allowed border-border/80"
            />
          </div>
          <div>
            <label className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Quốc gia
            </label>
            <Select
              value={profile.country || undefined}
              onValueChange={(val) => handleProfileChange("country", val)}
            >
              <SelectTrigger className="h-9.5 sm:h-11 text-xs sm:text-sm rounded-lg border-border/80 bg-card focus:ring-primary/20 cursor-pointer">
                <SelectValue placeholder="Chọn quốc gia" />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-auto bg-card border border-border/60">
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
          <div>
            <label className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Giới tính
            </label>
            <Select
              value={profile.gender}
              onValueChange={(val) => handleProfileChange("gender", val)}
            >
              <SelectTrigger className="h-9.5 sm:h-11 text-xs sm:text-sm rounded-lg border-border/80 bg-card focus:ring-primary/20 cursor-pointer">
                <SelectValue placeholder="Chọn giới tính" />
              </SelectTrigger>
              <SelectContent className="bg-card border border-border/60">
                <SelectItem value="MALE">Nam</SelectItem>
                <SelectItem value="FEMALE">Nữ</SelectItem>
                <SelectItem value="OTHER">Khác</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Ngày sinh
            </label>
            <Input
              type="date"
              value={profile.dateOfBirth}
              onChange={(e) =>
                handleProfileChange("dateOfBirth", e.target.value)
              }
              className="h-9.5 sm:h-11 text-xs sm:text-sm rounded-lg border-border/80 bg-card focus-visible:ring-primary/20 relative cursor-pointer"
            />
          </div>
        </div>

        <div className="pt-1.5">
          <Button
            onClick={saveProfile}
            className="w-full sm:w-auto bg-primary hover:bg-primary/95 text-white gap-2 rounded-lg sm:rounded-xl h-9.5 sm:h-11 px-4 sm:px-5 text-xs sm:text-sm font-semibold cursor-pointer shadow-sm hover:shadow transition-all duration-150 justify-center"
          >
            <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Lưu thay đổi
          </Button>
        </div>
      </div>
    </Card>
  );
}
