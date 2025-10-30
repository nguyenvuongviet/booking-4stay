"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const bookings = [
  {
    id: "#BK001",
    guest: "Nguyễn Văn A",
    property: "Beach Villa",
    checkIn: "2025-01-15",
    checkOut: "2025-01-18",
    nights: 3,
    status: "Confirmed",
    amount: "$450",
  },
  {
    id: "#BK002",
    guest: "Trần Thị B",
    property: "Mountain Cabin",
    checkIn: "2025-01-16",
    checkOut: "2025-01-20",
    nights: 4,
    status: "Pending",
    amount: "$320",
  },
  {
    id: "#BK003",
    guest: "Lê Minh C",
    property: "City Apartment",
    checkIn: "2025-01-17",
    checkOut: "2025-01-19",
    nights: 2,
    status: "Confirmed",
    amount: "$280",
  },
  {
    id: "#BK004",
    guest: "Phạm Thị D",
    property: "Beachfront House",
    checkIn: "2025-01-20",
    checkOut: "2025-01-25",
    nights: 5,
    status: "Checked-in",
    amount: "$750",
  },
  {
    id: "#BK005",
    guest: "Hoàng Văn E",
    property: "Forest Retreat",
    checkIn: "2025-01-22",
    checkOut: "2025-01-24",
    nights: 2,
    status: "Cancelled",
    amount: "$200",
  },
  {
    id: "#BK006",
    guest: "Võ Thị F",
    property: "Riverside Villa",
    checkIn: "2025-01-25",
    checkOut: "2025-01-28",
    nights: 3,
    status: "Checked-out",
    amount: "$420",
  },
];

const statusOptions = [
  { value: "all", label: "Tất cả" },
  { value: "Pending", label: "Chờ xác nhận" },
  { value: "Confirmed", label: "Đã xác nhận" },
  { value: "Checked-in", label: "Đã nhận phòng" },
  { value: "Checked-out", label: "Đã trả phòng" },
  { value: "Cancelled", label: "Đã hủy" },
];

export default function BookingsPage() {
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredBookings =
    selectedStatus === "all"
      ? bookings
      : bookings.filter((b) => b.status === selectedStatus);

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBookings = filteredBookings.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Checked-in":
        return "bg-blue-100 text-blue-800";
      case "Checked-out":
        return "bg-gray-100 text-gray-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý đặt phòng</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý tất cả các đặt phòng của khách hàng
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Download className="w-4 h-4 mr-2" />
          Xuất dữ liệu
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex gap-4 flex-wrap items-center">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Tìm kiếm booking..." className="pl-10" />
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-border rounded-lg bg-card text-sm"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Bookings Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left py-4 px-6 font-semibold">
                  Booking ID
                </th>
                <th className="text-left py-4 px-6 font-semibold">Tên khách</th>
                <th className="text-left py-4 px-6 font-semibold">Phòng</th>
                <th className="text-left py-4 px-6 font-semibold">Check-in</th>
                <th className="text-left py-4 px-6 font-semibold">Check-out</th>
                <th className="text-left py-4 px-6 font-semibold">
                  Trạng thái
                </th>
                <th className="text-left py-4 px-6 font-semibold">Tổng tiền</th>
                <th className="text-left py-4 px-6 font-semibold">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {paginatedBookings.map((booking) => (
                <tr
                  key={booking.id}
                  className="border-b border-border hover:bg-muted/30 transition-colors"
                >
                  <td className="py-4 px-6 font-medium">{booking.id}</td>
                  <td className="py-4 px-6">{booking.guest}</td>
                  <td className="py-4 px-6">{booking.property}</td>
                  <td className="py-4 px-6 text-xs">{booking.checkIn}</td>
                  <td className="py-4 px-6 text-xs">{booking.checkOut}</td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-semibold">{booking.amount}</td>
                  <td className="py-4 px-6">
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-muted rounded transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-muted rounded transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-destructive/10 rounded transition-colors">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Hiển thị {startIndex + 1} đến{" "}
            {Math.min(startIndex + itemsPerPage, filteredBookings.length)} trong{" "}
            {filteredBookings.length} kết quả
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 hover:bg-muted rounded transition-colors disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      currentPage === page
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
            </div>
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="p-2 hover:bg-muted rounded transition-colors disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
