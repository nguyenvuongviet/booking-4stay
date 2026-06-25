"use client";

import { Button } from "@/_components/ui/button";
import { Card } from "@/_components/ui/card";
import { Input } from "@/_components/ui/input";
import { change_password } from "@/services/authApi";
import { Save } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function SecurityTab() {
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handlePasswordChange = (key: string, value: string) => {
    setPasswordForm((prev) => ({ ...prev, [key]: value }));
  };

  const savePassword = async () => {
    if (
      !passwordForm.oldPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      toast.error("Vui lòng điền đầy đủ các trường mật khẩu");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Mật khẩu mới và xác nhận mật khẩu không trùng khớp");
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
    } catch (error: any) {
      console.error(error);
      const errorMsg =
        error.response?.data?.message || "Cập nhật mật khẩu thất bại";
      toast.error(errorMsg);
    }
  };

  return (
    <Card className="p-6 md:p-8 max-w-2xl border border-border/60 shadow-sm rounded-2xl animate-in fade-in-50 duration-200 bg-card">
      <div className="border-b border-border/60 pb-4 mb-6">
        <h2 className="text-xl font-bold">Bảo mật tài khoản</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Quản lý mật khẩu truy cập và xác thực.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">
            Đổi mật khẩu
          </h3>
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="Mật khẩu hiện tại"
              value={passwordForm.oldPassword}
              onChange={(e) =>
                handlePasswordChange("oldPassword", e.target.value)
              }
              className="h-11 rounded-lg border-border/80 bg-card focus-visible:ring-primary/20"
            />
            <Input
              type="password"
              placeholder="Mật khẩu mới"
              value={passwordForm.newPassword}
              onChange={(e) =>
                handlePasswordChange("newPassword", e.target.value)
              }
              className="h-11 rounded-lg border-border/80 bg-card focus-visible:ring-primary/20"
            />
            <Input
              type="password"
              placeholder="Xác nhận mật khẩu mới"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                handlePasswordChange("confirmPassword", e.target.value)
              }
              className="h-11 rounded-lg border-border/80 bg-card focus-visible:ring-primary/20"
            />
            <Button
              onClick={savePassword}
              className="bg-primary hover:bg-primary/95 text-white gap-2 rounded-xl h-11 px-5 font-semibold cursor-pointer shadow-sm hover:shadow transition-all duration-150"
            >
              <Save className="w-4 h-4" />
              Cập nhật mật khẩu
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
