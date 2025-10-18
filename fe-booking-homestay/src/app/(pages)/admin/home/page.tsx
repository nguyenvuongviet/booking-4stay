"use client";

import { useState } from "react";
import SideBar from "@/components/admin/SideBar";
import { Card } from "@/components/ui/card";
import {
  Hotel,
  FileText,
  DollarSign,
  Users,
  TrendingUp,
  Calendar,
} from "lucide-react";

export default function AdminDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const stats = [
    {
      title: "Tổng số phòng",
      value: "48",
      change: "+2 phòng mới",
      icon: Hotel,
      color: "text-blue-500",
    },
    {
      title: "Đơn đặt phòng",
      value: "127",
      change: "+12% so với tháng trước",
      icon: FileText,
      color: "text-green-500",
    },
    {
      title: "Doanh thu tháng này",
      value: "₫245,000,000",
      change: "+18% so với tháng trước",
      icon: DollarSign,
      color: "text-yellow-500",
    },
    {
      title: "Khách hàng",
      value: "892",
      change: "+45 khách hàng mới",
      icon: Users,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="flex">
      {/* Sidebar */}
      <SideBar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main content */}
      <main
        className={`flex-1 transition-all duration-300 p-6 space-y-6
          ${isSidebarOpen ? "ml-56" : "ml-16"}
        `}
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Chào mừng đến với trang quản trị khách sạn
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {stat.change}
                  </p>
                </div>
                <div className={`rounded-lg bg-secondary p-3 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">
                Đơn đặt phòng gần đây
              </h2>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between border-b border-border pb-3 last:border-0"
                >
                  <div>
                    <p className="font-medium text-foreground">
                      Phòng Deluxe #{item}01
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Nguyễn Văn A - 2 đêm
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">₫2,500,000</p>
                    <span className="inline-flex items-center rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-500">
                      Đã xác nhận
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">
                Lịch đặt phòng hôm nay
              </h2>
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-4 border-b border-border pb-3 last:border-0"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Hotel className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      Check-in - Phòng {item}02
                    </p>
                    <p className="text-sm text-muted-foreground">
                      14:00 - Trần Thị B
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
