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
                Quản lý thông tin phòng
              </h1>
              <p className="text-muted-foreground">
                Quản lý danh sách và thông tin các phòng
              </p>
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Thêm phòng mới
            </Button>
          </div>

          <Card className="bg-card mt-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                      Tên phòng
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                      Loại phòng
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                      Giá/đêm
                    </th>
                    {/* <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                      Trạng thái
                    </th> */}
                    <th className="px-6 py-4 text-right text-sm font-medium text-muted-foreground">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((room) => (
                    <tr
                      key={room.id}
                      className="border-b border-border last:border-0"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-foreground">
                        {room.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {room.type}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        ₫{room.price}
                      </td>
                      {/* <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            room.status === "Trống"
                              ? "bg-green-500/10 text-green-500"
                              : room.status === "Đã đặt"
                              ? "bg-yellow-500/10 text-yellow-500"
                              : "bg-blue-500/10 text-blue-500"
                          }`}
                        >
                          {room.status}
                        </span>
                      </td> */}
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
