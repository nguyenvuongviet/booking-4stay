"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Save, Bell, Lock, User, Settings, Globe, DollarSign } from "lucide-react"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("account")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Cài đặt hệ thống</h1>
        <p className="text-muted-foreground mt-1">Quản lý tài khoản admin và cấu hình hệ thống</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        {[
          { id: "account", label: "Tài khoản", icon: User },
          { id: "security", label: "Bảo mật", icon: Lock },
          { id: "system", label: "Cấu hình hệ thống", icon: Settings },
          { id: "notifications", label: "Thông báo", icon: Bell },
        ].map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Account Settings */}
      {activeTab === "account" && (
        <Card className="p-6 max-w-2xl">
          <h2 className="text-lg font-semibold mb-6">Thông tin tài khoản</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Họ và tên</label>
              <Input defaultValue="Quản trị viên" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input type="email" defaultValue="admin@4stay.com" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Số điện thoại</label>
              <Input defaultValue="+84 123 456 7890" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Vị trí</label>
              <Input defaultValue="TP. Hồ Chí Minh, Việt Nam" />
            </div>
            <Button className="bg-primary hover:bg-primary/90 gap-2">
              <Save className="w-4 h-4" />
              Lưu thay đổi
            </Button>
          </div>
        </Card>
      )}

      {/* Security Settings */}
      {activeTab === "security" && (
        <Card className="p-6 max-w-2xl">
          <h2 className="text-lg font-semibold mb-6">Bảo mật tài khoản</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-4">Đổi mật khẩu</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Mật khẩu hiện tại</label>
                  <Input type="password" placeholder="Nhập mật khẩu hiện tại" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Mật khẩu mới</label>
                  <Input type="password" placeholder="Nhập mật khẩu mới" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Xác nhận mật khẩu</label>
                  <Input type="password" placeholder="Xác nhận mật khẩu mới" />
                </div>
                <Button className="bg-primary hover:bg-primary/90 gap-2">
                  <Save className="w-4 h-4" />
                  Cập nhật mật khẩu
                </Button>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="font-medium mb-4">Xác thực hai yếu tố</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Bảo vệ tài khoản của bạn bằng cách yêu cầu mã xác thực bổ sung khi đăng nhập
              </p>
              <Button variant="outline">Kích hoạt xác thực hai yếu tố</Button>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="font-medium mb-4">Phiên đăng nhập</h3>
              <p className="text-sm text-muted-foreground mb-4">Quản lý các phiên đăng nhập hoạt động</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Chrome trên Windows</p>
                    <p className="text-xs text-muted-foreground">Đăng nhập lần cuối: 2 giờ trước</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Đăng xuất
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* System Configuration */}
      {activeTab === "system" && (
        <div className="space-y-6 max-w-2xl">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Settings className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Cấu hình chung</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tên hệ thống</label>
                <Input defaultValue="4Stay - Quản lý Homestay" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Mô tả hệ thống</label>
                <Input defaultValue="Nền tảng quản lý đặt phòng homestay toàn diện" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email liên hệ</label>
                <Input type="email" defaultValue="support@4stay.com" />
              </div>
              <Button className="bg-primary hover:bg-primary/90 gap-2">
                <Save className="w-4 h-4" />
                Lưu cấu hình
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Cài đặt khu vực</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Múi giờ</label>
                <select className="w-full px-3 py-2 border border-border rounded-lg bg-card">
                  <option>UTC+7 (Giờ Đông Dương)</option>
                  <option>UTC+6 (Giờ Đông Nam Á)</option>
                  <option>UTC+8 (Giờ Trung Quốc)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Ngôn ngữ</label>
                <select className="w-full px-3 py-2 border border-border rounded-lg bg-card">
                  <option>Tiếng Việt</option>
                  <option>English</option>
                  <option>中文</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Định dạng ngày</label>
                <select className="w-full px-3 py-2 border border-border rounded-lg bg-card">
                  <option>DD/MM/YYYY</option>
                  <option>MM/DD/YYYY</option>
                  <option>YYYY-MM-DD</option>
                </select>
              </div>
              <Button className="bg-primary hover:bg-primary/90 gap-2">
                <Save className="w-4 h-4" />
                Lưu cài đặt
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <DollarSign className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Cài đặt thanh toán</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tiền tệ mặc định</label>
                <select className="w-full px-3 py-2 border border-border rounded-lg bg-card">
                  <option>USD ($)</option>
                  <option>VND (₫)</option>
                  <option>EUR (€)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phí dịch vụ (%)</label>
                <Input type="number" defaultValue="10" min="0" max="100" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phương thức thanh toán được phép</label>
                <div className="space-y-2">
                  {["Thẻ tín dụng", "Chuyển khoản ngân hàng", "Ví điện tử", "Tiền mặt"].map((method) => (
                    <div key={method} className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked id={method} className="w-4 h-4" />
                      <label htmlFor={method} className="text-sm">
                        {method}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <Button className="bg-primary hover:bg-primary/90 gap-2">
                <Save className="w-4 h-4" />
                Lưu cài đặt thanh toán
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Notification Settings */}
      {activeTab === "notifications" && (
        <Card className="p-6 max-w-2xl">
          <h2 className="text-lg font-semibold mb-6">Cài đặt thông báo</h2>
          <div className="space-y-4">
            {[
              { label: "Đặt phòng mới", description: "Nhận thông báo khi có đặt phòng mới" },
              { label: "Tin nhắn từ khách", description: "Nhận cảnh báo khi khách gửi tin nhắn" },
              { label: "Đánh giá mới", description: "Nhận thông báo khi khách để lại đánh giá" },
              { label: "Cập nhật thanh toán", description: "Cảnh báo xác nhận thanh toán" },
              { label: "Báo cáo hệ thống", description: "Nhận báo cáo hàng ngày/hàng tuần" },
              { label: "Cảnh báo bảo mật", description: "Thông báo về hoạt động bảo mật bất thường" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors"
              >
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 cursor-pointer" />
              </div>
            ))}
            <Button className="bg-primary hover:bg-primary/90 gap-2">
              <Save className="w-4 h-4" />
              Lưu cài đặt thông báo
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
