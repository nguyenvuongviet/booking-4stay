"use client";

import { Button } from "@/_components/ui/button";
import { Card } from "@/_components/ui/card";
import { Switch } from "@/_components/ui/switch";
import { Save } from "lucide-react";

export default function NotificationsTab() {
  return (
    <Card className="p-6 md:p-8 max-w-2xl border border-border/60 shadow-sm rounded-2xl animate-in fade-in-50 duration-200 bg-card">
      <div className="border-b border-border/60 pb-4 mb-6">
        <h2 className="text-xl font-bold">Cài đặt thông báo</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Cấu hình các kênh và sự kiện nhận thông báo của admin.
        </p>
      </div>

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
            className="flex items-center justify-between p-4 border border-border/60 rounded-xl hover:bg-primary/5 hover:text-primary transition-colors duration-150 bg-card"
          >
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {label}
            </p>
            <Switch defaultChecked className="cursor-pointer" />
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-border/60 mt-6">
        <Button className="bg-primary hover:bg-primary/95 text-white gap-2 rounded-xl h-11 px-5 font-semibold cursor-pointer shadow-sm hover:shadow transition-all duration-150">
          <Save className="w-4 h-4" />
          Lưu cài đặt
        </Button>
      </div>
    </Card>
  );
}
