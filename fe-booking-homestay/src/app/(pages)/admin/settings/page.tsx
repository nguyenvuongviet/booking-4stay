"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import { Bell, Lock, Save, Settings, User } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("account");

  const { user, updateUser } = useAuth();

  const [profile, setProfile] = useState({
    fullName: user ? `${user.firstName} ${user.lastName}` : "",
    email: user?.email ?? "",
    phoneNumber: user?.phoneNumber ?? "",
    location: "TP. Hồ Chí Minh, Việt Nam",
  });

  const handleProfileChange = (key: string, value: string) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const saveProfile = () => {
    console.log("Saving profile:", profile);

    updateUser({
      ...user!,
      firstName: profile.fullName.split(" ")[0],
      lastName: profile.fullName.split(" ").slice(1).join(" "),
      phoneNumber: profile.phoneNumber,
    });

    toast.success("Cập nhật tài khoản thành công!");
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold">Cài đặt hệ thống</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý tài khoản admin và cấu hình hệ thống
          </p>
        </div>
      </div>

      <div className="flex gap-3 border-b pb-1">
        {[
          { id: "account", label: "Tài khoản", icon: User },
          { id: "security", label: "Bảo mật", icon: Lock },
          { id: "system", label: "Cấu hình hệ thống", icon: Settings },
          { id: "notifications", label: "Thông báo", icon: Bell },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-medium transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "account" && (
        <Card className="p-8 max-w-2xl border shadow-sm">
          <h2 className="text-xl font-semibold mb-6">Thông tin tài khoản</h2>
          <div className="space-y-5">
            <div>
              <label className="text-sm font-medium">Họ và tên</label>
              <Input
                value={profile.fullName}
                onChange={(e) =>
                  handleProfileChange("fullName", e.target.value)
                }
                className="mt-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={profile.email}
                disabled
                className="mt-2 bg-muted cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Số điện thoại</label>
              <Input
                value={profile.phoneNumber}
                onChange={(e) =>
                  handleProfileChange("phoneNumber", e.target.value)
                }
                className="mt-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Vị trí</label>
              <Input
                value={profile.location}
                onChange={(e) =>
                  handleProfileChange("location", e.target.value)
                }
                className="mt-2"
              />
            </div>

            <Button
              onClick={saveProfile}
              className="bg-primary hover:bg-primary/90 gap-2 rounded-lg h-11"
            >
              <Save className="w-4 h-4" />
              Lưu thay đổi
            </Button>
          </div>
        </Card>
      )}

      {activeTab === "security" && (
        <Card className="p-8 max-w-2xl border shadow-sm">
          <h2 className="text-xl font-semibold mb-6">Bảo mật tài khoản</h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-4">Đổi mật khẩu</h3>
              <div className="space-y-4">
                <Input type="password" placeholder="Mật khẩu hiện tại" />
                <Input type="password" placeholder="Mật khẩu mới" />
                <Input type="password" placeholder="Xác nhận mật khẩu mới" />
                <Button className="bg-primary hover:bg-primary/90 gap-2 rounded-lg h-11">
                  <Save className="w-4 h-4" />
                  Cập nhật mật khẩu
                </Button>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-medium mb-4">Xác thực hai yếu tố</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Tăng bảo mật khi đăng nhập bằng mã OTP
              </p>
              <Button variant="outline">Kích hoạt 2FA</Button>
            </div>
          </div>
        </Card>
      )}

      {activeTab === "system" && (
        <div className="space-y-6 max-w-3xl">
          <Card className="p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Cấu hình chung</h2>

            <div className="grid grid-cols-2 gap-4">
              <Input defaultValue="4Stay - Admin Dashboard" />
              <Input defaultValue="support@4stay.com" />
              <Input defaultValue="Nền tảng quản lý đặt phòng homestay" />
            </div>

            <Button className="mt-4 bg-primary hover:bg-primary/90 gap-2">
              <Save className="w-4 h-4" />
              Lưu cấu hình
            </Button>
          </Card>

          <Card className="p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Cài đặt khu vực</h2>

            <div className="grid grid-cols-2 gap-4">
              <select className="w-full p-2 border rounded-lg">
                <option>UTC+7 — Việt Nam</option>
              </select>

              <select className="w-full p-2 border rounded-lg">
                <option>Tiếng Việt</option>
                <option>English</option>
              </select>

              <select className="w-full p-2 border rounded-lg">
                <option>DD/MM/YYYY</option>
                <option>MM/DD/YYYY</option>
              </select>
            </div>

            <Button className="mt-4 bg-primary hover:bg-primary/90 gap-2">
              <Save className="w-4 h-4" />
              Lưu cài đặt
            </Button>
          </Card>

          <Card className="p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Cài đặt thanh toán</h2>

            <div className="space-y-4">
              <select className="w-full p-2 border rounded-lg">
                <option>VND (₫)</option>
                <option>USD ($)</option>
              </select>

              <Input type="number" defaultValue="10" />

              <div className="grid grid-cols-2 gap-3">
                {["Thẻ tín dụng", "Chuyển khoản", "Ví điện tử", "Tiền mặt"].map(
                  (method) => (
                    <label key={method} className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      <span>{method}</span>
                    </label>
                  )
                )}
              </div>

              <Button className="bg-primary hover:bg-primary/90 gap-2">
                <Save className="w-4 h-4" />
                Lưu cài đặt thanh toán
              </Button>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "notifications" && (
        <Card className="p-6 max-w-2xl shadow-sm">
          <h2 className="text-xl font-semibold mb-6">Cài đặt thông báo</h2>

          <div className="space-y-3">
            {[
              "Đặt phòng mới",
              "Tin nhắn từ khách",
              "Đánh giá mới",
              "Thanh toán thành công",
              "Báo cáo hệ thống",
              "Cảnh báo bảo mật",
            ].map((label) => (
              <div
                key={label}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/40"
              >
                <p>{label}</p>
                <input type="checkbox" defaultChecked />
              </div>
            ))}
          </div>

          <Button className="mt-4 bg-primary hover:bg-primary/90 gap-2">
            <Save className="w-4 h-4" />
            Lưu cài đặt
          </Button>
        </Card>
      )}
    </div>
  );
}
