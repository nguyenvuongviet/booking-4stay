"use client"

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import SideBar from "@/components/admin/SideBar";
import { useState } from "react";

export default function RoomsPage() {
  const rooms = [
    {
      id: 1,
      name: "Phòng Deluxe 101",
      type: "Deluxe",
      price: "1,500,000",
      status: "Trống",
    },
    {
      id: 2,
      name: "Phòng Suite 201",
      type: "Suite",
      price: "3,000,000",
      status: "Đã đặt",
    },
    {
      id: 3,
      name: "Phòng Standard 102",
      type: "Standard",
      price: "800,000",
      status: "Trống",
    },
    {
      id: 4,
      name: "Phòng Deluxe 103",
      type: "Deluxe",
      price: "1,500,000",
      status: "Đang sử dụng",
    },
  ];
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Quản lý thông tin đặt phòng
              </h1>
              <p className="text-muted-foreground">
                Quản lý danh sách và thông tin các đơn đặt phòng
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
