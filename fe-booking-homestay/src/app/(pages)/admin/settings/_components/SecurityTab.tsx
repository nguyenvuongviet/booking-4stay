"use client";

import { Button } from "@/_components/ui/button";
import { Card } from "@/_components/ui/card";
import { Input } from "@/_components/ui/input";
import { validatePasswordStrength } from "@/_helper/validation.helper";
import { change_password } from "@/services/authApi";
import { Eye, EyeOff, Save } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function SecurityTab() {
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handlePasswordChange = (key: string, value: string) => {
    setPasswordForm((prev) => ({ ...prev, [key]: value }));

    setErrors((prev) => {
      const nextErrors = { ...prev };

      if (key === "oldPassword") {
        nextErrors.oldPassword = value
          ? ""
          : "Vui lòng nhập mật khẩu hiện tại.";
      }

      if (key === "newPassword") {
        nextErrors.newPassword = validatePasswordStrength(value);
        if (passwordForm.confirmPassword) {
          nextErrors.confirmPassword =
            value === passwordForm.confirmPassword
              ? ""
              : "Xác nhận mật khẩu không khớp với mật khẩu mới.";
        }
      }

      if (key === "confirmPassword") {
        nextErrors.confirmPassword =
          value === passwordForm.newPassword
            ? ""
            : "Xác nhận mật khẩu không khớp với mật khẩu mới.";
      }

      return nextErrors;
    });
  };

  const savePassword = async () => {
    const oldErr = passwordForm.oldPassword
      ? ""
      : "Vui lòng nhập mật khẩu hiện tại.";
    const newErr = validatePasswordStrength(passwordForm.newPassword);
    const confirmErr =
      passwordForm.confirmPassword === passwordForm.newPassword
        ? ""
        : "Xác nhận mật khẩu không khớp với mật khẩu mới.";

    setErrors({
      oldPassword: oldErr,
      newPassword: newErr,
      confirmPassword: confirmErr,
    });

    if (oldErr || newErr || confirmErr) {
      toast.error("Vui lòng sửa các lỗi nhập liệu trước khi lưu.");
      return;
    }

    try {
      await change_password({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });

      toast.success("Cập nhật mật khẩu thành công!");
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setErrors({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowOldPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (error: any) {
      console.error(error);
      const errorMsg =
        error.response?.data?.message || "Cập nhật mật khẩu thất bại";
      toast.error(errorMsg);
    }
  };

  return (
    <Card className="p-3.5 sm:p-6 md:p-8 max-w-2xl w-full border border-border/60 shadow-sm rounded-2xl animate-in fade-in-50 duration-200 bg-card">
      <div className="border-b border-border/60 pb-3 sm:pb-2 mb-1 sm:mb-2">
        <h2 className="text-base sm:text-xl font-bold">Bảo mật tài khoản</h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
          Quản lý mật khẩu truy cập và xác thực.
        </p>
      </div>

      <div className="space-y-3 sm:space-y-6">
        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-slate-750 dark:text-slate-200 mb-1.5 sm:mb-4">
            Đổi mật khẩu
          </h3>
          <div className="space-y-2.5 sm:space-y-5">
            <div>
              <div className="relative">
                <Input
                  type={showOldPassword ? "text" : "password"}
                  placeholder="Mật khẩu hiện tại"
                  value={passwordForm.oldPassword}
                  onChange={(e) =>
                    handlePasswordChange("oldPassword", e.target.value)
                  }
                  className={`h-9.5 sm:h-11 text-xs sm:text-sm rounded-lg bg-card pr-9 sm:pr-10 focus-visible:ring-primary/20 ${
                    errors.oldPassword
                      ? "border-red-500 focus-visible:ring-red-200"
                      : "border-border/80"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  aria-label={showOldPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showOldPassword ? (
                    <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
              </div>
              {errors.oldPassword && (
                <p className="text-xs text-red-500 mt-1 animate-in fade-in-50">
                  {errors.oldPassword}
                </p>
              )}
            </div>

            <div>
              <p className="text-[10px] sm:text-[11px] text-muted-foreground mb-1 sm:mb-2 leading-relaxed">
                Yêu cầu mật khẩu mạnh: Tối thiểu 8 ký tự, gồm ít nhất 1 chữ hoa,
                1 chữ thường, 1 số và 1 ký tự đặc biệt (@, $, !, %, *, ?, &).
              </p>
              <div className="relative">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Mật khẩu mới"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    handlePasswordChange("newPassword", e.target.value)
                  }
                  className={`h-9.5 sm:h-11 text-xs sm:text-sm rounded-lg bg-card pr-9 sm:pr-10 focus-visible:ring-primary/20 ${
                    errors.newPassword
                      ? "border-red-500 focus-visible:ring-red-200"
                      : "border-border/80"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  aria-label={showNewPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-xs text-red-500 mt-1 animate-in fade-in-50">
                  {errors.newPassword}
                </p>
              )}
            </div>

            <div>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Xác nhận mật khẩu mới"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    handlePasswordChange("confirmPassword", e.target.value)
                  }
                  className={`h-9.5 sm:h-11 text-xs sm:text-sm rounded-lg bg-card pr-9 sm:pr-10 focus-visible:ring-primary/20 ${
                    errors.confirmPassword
                      ? "border-red-500 focus-visible:ring-red-200"
                      : "border-border/80"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  aria-label={
                    showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-500 mt-1 animate-in fade-in-50">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <Button
              onClick={savePassword}
              disabled={
                !!errors.oldPassword ||
                !!errors.newPassword ||
                !!errors.confirmPassword
              }
              className="w-full sm:w-auto bg-primary hover:bg-primary/95 text-white gap-2 rounded-lg sm:rounded-xl h-9.5 sm:h-11 px-4 sm:px-5 text-xs sm:text-sm font-semibold cursor-pointer shadow-sm hover:shadow transition-all duration-150 justify-center"
            >
              <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Cập nhật mật khẩu
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
