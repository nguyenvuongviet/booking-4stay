"use client";

import { Button } from "@/_components/ui/button";
import { Card } from "@/_components/ui/card";
import { Switch } from "@/_components/ui/switch";
import { Save } from "lucide-react";

export default function NotificationsTab() {
  return (
    <Card className="p-3.5 sm:p-6 md:p-8 max-w-2xl w-full border border-border/60 shadow-sm rounded-2xl animate-in fade-in-50 duration-200 bg-card">
      <div className="border-b border-border/60 pb-3 sm:pb-4 mb-1.5 sm:mb-6">
        <h2 className="text-base sm:text-xl font-bold">Cài đặt thông báo</h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
          Cấu hình các kênh và sự kiện nhận thông báo của admin.
        </p>
      </div>

      <div className="space-y-2.5 sm:space-y-3">
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
            className="flex items-center justify-between p-3 sm:p-4 border border-border/60 rounded-lg sm:rounded-xl hover:bg-primary/5 hover:text-primary transition-colors duration-150 bg-card"
          >
            <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">
              {label}
            </p>
            <Switch defaultChecked className="cursor-pointer" />
          </div>
        ))}
      </div>

      <div className="pt-3.5 border-t border-border/60 mt-4 sm:mt-6">
        <Button className="bg-primary hover:bg-primary/95 text-white gap-2 rounded-lg sm:rounded-xl h-9.5 sm:h-11 px-4 sm:px-5 text-xs sm:text-sm font-semibold cursor-pointer shadow-sm hover:shadow transition-all duration-150">
          <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          Lưu cài đặt
        </Button>
      </div>
    </Card>
  );
}
