"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Plus, Eye, Edit2, Trash2 } from "lucide-react";
import Link from "next/link";
import { RoomFormModal } from "@/components/admin/room-form-modal";

const rooms = [
  {
    id: 1,
    name: "Phòng Deluxe 101",
    property: "Beach Villa",
    type: "Deluxe",
    capacity: 2,
    price: 500000,
    status: "available",
    rating: 4.8,
  },
  {
    id: 2,
    name: "Phòng Standard 201",
    property: "Mountain Cabin",
    type: "Standard",
    capacity: 2,
    price: 300000,
    status: "available",
    rating: 4.6,
  },
  {
    id: 3,
    name: "Phòng Suite 301",
    property: "City Apartment",
    type: "Suite",
    capacity: 4,
    price: 800000,
    status: "booked",
    rating: 4.9,
  },
  {
    id: 4,
    name: "Phòng Deluxe 102",
    property: "Beachfront House",
    type: "Deluxe",
    capacity: 3,
    price: 600000,
    status: "maintenance",
    rating: 4.7,
  },
  {
    id: 5,
    name: "Phòng Standard 202",
    property: "Forest Retreat",
    type: "Standard",
    capacity: 2,
    price: 350000,
    status: "available",
    rating: 4.5,
  },
  {
    id: 6,
    name: "Phòng Villa 401",
    property: "Beach Villa",
    type: "Villa",
    capacity: 6,
    price: 1000000,
    status: "available",
    rating: 4.8,
  },
];

export default function RoomsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openRoomModal, setOpenRoomModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.property.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || room.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenRoomModal = (room?: any) => {
    setSelectedRoom(room || null);
    setOpenRoomModal(true);
  };

  const handleRoomSubmit = (data: any) => {
    console.log("Room data:", data);
    // Handle room creation/update
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "booked":
        return "bg-blue-100 text-blue-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-warm-100 text-warm-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-warm-900">Quản lý phòng</h1>
          <p className="text-warm-600 mt-1">
            Quản lý tất cả các phòng trong hệ thống
          </p>
        </div>
        <Button
          onClick={() => handleOpenRoomModal()}
          className="bg-warm-700 hover:bg-warm-800 gap-2"
        >
          <Plus className="w-4 h-4" />
          Thêm phòng
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 border-warm-200">
        <div className="flex gap-4 flex-wrap items-center">
          <div className="flex-1 min-w-64 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-400" />
            <Input
              placeholder="Tìm kiếm phòng hoặc homestay..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-warm-200"
            />
          </div>
          <div className="flex gap-2 items-center">
            <Filter className="w-4 h-4 text-warm-600" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-warm-200 rounded-lg bg-white text-sm text-warm-900"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="available">Có sẵn</option>
              <option value="booked">Đã đặt</option>
              <option value="maintenance">Bảo trì</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Rooms Table */}
      <Card className="overflow-hidden border-warm-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-warm-200 bg-warm-50">
                <th className="text-left py-4 px-6 font-semibold text-warm-900">
                  Tên phòng
                </th>
                <th className="text-left py-4 px-6 font-semibold text-warm-900">
                  Homestay
                </th>
                <th className="text-left py-4 px-6 font-semibold text-warm-900">
                  Loại
                </th>
                <th className="text-left py-4 px-6 font-semibold text-warm-900">
                  Sức chứa
                </th>
                <th className="text-left py-4 px-6 font-semibold text-warm-900">
                  Giá/đêm
                </th>
                <th className="text-left py-4 px-6 font-semibold text-warm-900">
                  Trạng thái
                </th>
                <th className="text-left py-4 px-6 font-semibold text-warm-900">
                  Đánh giá
                </th>
                <th className="text-left py-4 px-6 font-semibold text-warm-900">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRooms.map((room) => (
                <tr
                  key={room.id}
                  className="border-b border-warm-100 hover:bg-warm-50 transition-colors"
                >
                  <td className="py-4 px-6 font-medium text-warm-900">
                    {room.name}
                  </td>
                  <td className="py-4 px-6 text-warm-700">{room.property}</td>
                  <td className="py-4 px-6 text-warm-700">{room.type}</td>
                  <td className="py-4 px-6 text-warm-700">
                    {room.capacity} người
                  </td>
                  <td className="py-4 px-6 font-semibold text-warm-900">
                    {room.price.toLocaleString()} VND
                  </td>
                  <td className="py-4 px-6">
                    <Badge className={getStatusColor(room.status)}>
                      {room.status === "available" && "Có sẵn"}
                      {room.status === "booked" && "Đã đặt"}
                      {room.status === "maintenance" && "Bảo trì"}
                    </Badge>
                  </td>
                  <td className="py-4 px-6 text-warm-700">⭐ {room.rating}</td>
                  <td className="py-4 px-6">
                    <div className="flex gap-2">
                      <Link href={`/admin/rooms/${room.id}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-warm-600 hover:text-warm-700"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenRoomModal(room)}
                        className="text-warm-600 hover:text-warm-700"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Room Form Modal */}
      <RoomFormModal
        open={openRoomModal}
        onOpenChange={setOpenRoomModal}
        room={selectedRoom}
        onSubmit={handleRoomSubmit}
      />
    </div>
  );
}
