"use client";

import SideBar from "@/components/admin/SideBar";
import { Card } from "@/components/ui/card";
import { FileText, CheckCircle, Clock, XCircle } from "lucide-react";
import { useState } from "react";

export default function BookingStatisticsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex">
      <SideBar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <main
        className={`flex-1 transition-all duration-300 p-6 space-y-6
          ${isSidebarOpen ? "ml-56" : "ml-16"}
        `}
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Thống kê đơn đặt phòng
          </h1>
          <p className="text-muted-foreground">
            Xem báo cáo về các đơn đặt phòng
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Card className="bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Tổng đơn
                </p>
                <p className="mt-2 text-2xl font-bold text-foreground">127</p>
              </div>
              <div className="rounded-lg bg-blue-500/10 p-3 text-blue-500">
                <FileText className="h-6 w-6" />
              </div>
            </div>
          </Card>

          <Card className="bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Đã xác nhận
                </p>
                <p className="mt-2 text-2xl font-bold text-foreground">98</p>
              </div>
              <div className="rounded-lg bg-green-500/10 p-3 text-green-500">
                <CheckCircle className="h-6 w-6" />
              </div>
            </div>
          </Card>

          <Card className="bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Chờ xác nhận
                </p>
                <p className="mt-2 text-2xl font-bold text-foreground">23</p>
              </div>
              <div className="rounded-lg bg-yellow-500/10 p-3 text-yellow-500">
                <Clock className="h-6 w-6" />
              </div>
            </div>
          </Card>

          <Card className="bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Đã hủy
                </p>
                <p className="mt-2 text-2xl font-bold text-foreground">6</p>
              </div>
              <div className="rounded-lg bg-red-500/10 p-3 text-red-500">
                <XCircle className="h-6 w-6" />
              </div>
            </div>
          </Card>
        </div>

        <Card className="bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            Đơn đặt phòng theo loại phòng
          </h2>
          <div className="space-y-4">
            {[
              { type: "Deluxe", count: 45, percentage: 35 },
              { type: "Suite", count: 32, percentage: 25 },
              { type: "Standard", count: 50, percentage: 40 },
            ].map((item, index) => (
              <div key={index}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    {item.type}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {item.count} đơn
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
}
