"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Plus, Eye, Edit2, Trash2, MapPin } from "lucide-react";
import Link from "next/link";

const properties = [
  {
    id: 1,
    name: "Beach Villa",
    location: "Quận 1, TP.HCM",
    rooms: 4,
    price: 500000,
    status: "active",
    rating: 4.8,
    bookings: 45,
    revenue: 90000000,
  },
  {
    id: 2,
    name: "Mountain Cabin",
    location: "Quận 3, TP.HCM",
    rooms: 3,
    price: 400000,
    status: "active",
    rating: 4.6,
    bookings: 32,
    revenue: 64000000,
  },
  {
    id: 3,
    name: "City Apartment",
    location: "Quận 5, TP.HCM",
    rooms: 2,
    price: 600000,
    status: "active",
    rating: 4.9,
    bookings: 52,
    revenue: 156000000,
  },
  {
    id: 4,
    name: "Beachfront House",
    location: "Quận 7, TP.HCM",
    rooms: 5,
    price: 800000,
    status: "inactive",
    rating: 4.7,
    bookings: 28,
    revenue: 112000000,
  },
  {
    id: 5,
    name: "Forest Retreat",
    location: "Quận 9, TP.HCM",
    rooms: 3,
    price: 350000,
    status: "active",
    rating: 4.5,
    bookings: 38,
    revenue: 53200000,
  },
];

export default function PropertiesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || property.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-warm-900">Quản lý homestay</h1>
          <p className="text-warm-600 mt-1">
            Quản lý tất cả các danh sách homestay của bạn
          </p>
        </div>
        <Button className="bg-warm-700 hover:bg-warm-800 gap-2">
          <Plus className="w-4 h-4" />
          Thêm homestay
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 border-warm-200">
        <div className="flex gap-4 flex-wrap items-center">
          <div className="flex-1 min-w-64 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-400" />
            <Input
              placeholder="Tìm kiếm homestay..."
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
              <option value="active">Hoạt động</option>
              <option value="inactive">Không hoạt động</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((property) => (
          <Card
            key={property.id}
            className="overflow-hidden hover:shadow-lg transition-shadow border-warm-200"
          >
            <div className="h-40 bg-gradient-to-br from-warm-100 to-warm-50 flex items-center justify-center border-b border-warm-200">
              <div className="text-center">
                <div className="text-4xl font-bold text-warm-600">
                  {property.rooms}
                </div>
                <p className="text-sm text-warm-600">Phòng</p>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg text-warm-900">
                {property.name}
              </h3>
              <div className="flex items-center gap-1 text-sm text-warm-600 mb-3">
                <MapPin className="w-4 h-4" />
                {property.location}
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3 pb-3 border-b border-warm-200">
                <div>
                  <p className="text-xs text-warm-600">Lượt đặt</p>
                  <p className="font-semibold text-warm-900">
                    {property.bookings}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-warm-600">Doanh thu</p>
                  <p className="font-semibold text-warm-900">
                    {(property.revenue / 1000000).toFixed(0)}M
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-warm-700">
                  {property.price.toLocaleString()} VND/đêm
                </span>
                <span className="text-sm text-warm-700">
                  ⭐ {property.rating}
                </span>
              </div>
              <div className="mb-4">
                <Badge
                  className={
                    property.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }
                >
                  {property.status === "active"
                    ? "Hoạt động"
                    : "Không hoạt động"}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/admin/properties/${property.id}`}
                  className="flex-1"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2 border-warm-200 text-warm-700 hover:bg-warm-50 bg-transparent"
                  >
                    <Eye className="w-4 h-4" />
                    Xem
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-2 border-warm-200 text-warm-700 hover:bg-warm-50 bg-transparent"
                >
                  <Edit2 className="w-4 h-4" />
                  Sửa
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
