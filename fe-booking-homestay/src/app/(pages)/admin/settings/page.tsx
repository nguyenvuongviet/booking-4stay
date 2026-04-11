"use client";

import { Button } from "@/_components/ui/button";
import { Card } from "@/_components/ui/card";
import { Input } from "@/_components/ui/input";
import { useAuth } from "@/context/auth-context";
import { Bell, Lock, Save, Settings, User, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { appConfigApi, AppConfig } from "@/services/admin/appConfigApi";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("account");
  const [appConfigs, setAppConfigs] = useState<AppConfig[]>([]);
  const [loadingConfigs, setLoadingConfigs] = useState(false);

  const { user, updateUser } = useAuth();

  useEffect(() => {
    if (activeTab === "system") {
      fetchConfigs();
    }
  }, [activeTab]);

  const fetchConfigs = async () => {
    setLoadingConfigs(true);
    try {
      const data = await appConfigApi.getAllConfigs();
      setAppConfigs(data);
    } catch (error) {
      toast.error("Không thể tải cấu hình hệ thống");
    } finally {
      setLoadingConfigs(false);
    }
  };

  const handleConfigChange = (key: string, value: any) => {
    setAppConfigs((prev) =>
      prev.map((c) => (c.key === key ? { ...c, value } : c))
    );
  };

  const saveConfig = async (key: string) => {
    const config = appConfigs.find((c) => c.key === key);
    if (!config) return;

    try {
      await appConfigApi.updateConfig(key, config.value);
      toast.success(`Đã cập nhật cấu hình ${key}`);
      fetchConfigs();
    } catch (error) {
      toast.error("Lỗi khi cập nhật cấu hình");
    }
  };

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
          <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Cấu hình vận hành
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchConfigs}
              disabled={loadingConfigs}
              className="gap-2"
            >
              <RefreshCw
                className={`w-4 h-4 ${loadingConfigs ? "animate-spin" : ""}`}
              />
              Làm mới
            </Button>
          </div>

          <Card className="p-6 shadow-sm border-primary/20">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-md font-bold">Thời gian hết hạn thanh toán</h3>
                <p className="text-sm text-muted-foreground">
                  Số phút tối đa khách được giữ chỗ chờ thanh toán trước khi hệ
                  thống tự động hủy đơn (Mặc định: 30 phút).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 max-w-md">
              <div className="relative flex-1">
                <Input
                  type="number"
                  min="5"
                  max="1440"
                  value={
                    appConfigs.find((c) => c.key === "BOOKING_EXPIRY_MINUTES")
                      ?.value || 30
                  }
                  onChange={(e) =>
                    handleConfigChange(
                      "BOOKING_EXPIRY_MINUTES",
                      parseInt(e.target.value)
                    )
                  }
                  className="pr-12 text-lg font-medium"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                  phút
                </div>
              </div>
              <Button
                onClick={() => saveConfig("BOOKING_EXPIRY_MINUTES")}
                className="bg-primary hover:bg-primary/90 h-11"
              >
                Cập nhật
              </Button>
            </div>
          </Card>

          <Card className="p-6 shadow-sm opacity-60">
            <h2 className="text-lg font-semibold mb-4 text-muted-foreground">
              Các cấu hình khác (Sắp ra mắt)
            </h2>
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded border border-dashed flex justify-between items-center">
                <span className="text-sm font-medium">Chính sách phí phạt hủy phòng</span>
                <span className="text-xs bg-muted-foreground/20 px-2 py-1 rounded">Locked</span>
              </div>
              <div className="p-3 bg-muted rounded border border-dashed flex justify-between items-center">
                <span className="text-sm font-medium">Cấu hình Email Marketing</span>
                <span className="text-xs bg-muted-foreground/20 px-2 py-1 rounded">Locked</span>
              </div>
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
