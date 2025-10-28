"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit2, MapPin } from "lucide-react";
import Link from "next/link";

export default function PropertyDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const [property] = useState({
    id: params.id,
    name: "Beach Villa",
    location: "Quận 1, TP.HCM",
    address: "123 Đường Nguyễn Huệ, Quận 1, TP.HCM",
    rooms: 4,
    price: 500000,
    status: "active",
    rating: 4.8,
    bookings: 45,
    revenue: 90000000,
    description:
      "Villa sang trọng với view biển tuyệt đẹp, đầy đủ tiện nghi hiện đại.",
    amenities: ["WiFi", "Điều hòa", "TV", "Bếp", "Hồ bơi", "Gym"],
    images: ["/placeholder.svg"],
    owner: "Trần Thị B",
    ownerEmail: "tranb@example.com",
    ownerPhone: "+84 912 345 678",
    roomsList: [
      {
        id: 1,
        name: "Phòng Deluxe 101",
        type: "Deluxe",
        capacity: 2,
        price: 500000,
        status: "available",
      },
      {
        id: 2,
        name: "Phòng Deluxe 102",
        type: "Deluxe",
        capacity: 2,
        price: 500000,
        status: "booked",
      },
      {
        id: 3,
        name: "Phòng Standard 201",
        type: "Standard",
        capacity: 2,
        price: 350000,
        status: "available",
      },
      {
        id: 4,
        name: "Phòng Suite 301",
        type: "Suite",
        capacity: 4,
        price: 800000,
        status: "available",
      },
    ],
    recentBookings: [
      {
        id: 1,
        guest: "Nguyễn Văn A",
        checkIn: "2024-12-20",
        checkOut: "2024-12-22",
        status: "checked-out",
      },
      {
        id: 2,
        guest: "Trần Thị B",
        checkIn: "2024-12-25",
        checkOut: "2024-12-27",
        status: "confirmed",
      },
    ],
    monthlyStats: [
      { month: "Oct", bookings: 12, revenue: 18000000 },
      { month: "Nov", bookings: 15, revenue: 22500000 },
      { month: "Dec", bookings: 18, revenue: 27000000 },
    ],
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/properties">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-warm-900">{property.name}</h1>
          <div className="flex items-center gap-2 text-warm-600 mt-1">
            <MapPin className="w-4 h-4" />
            {property.location}
          </div>
        </div>
        <Button variant="outline" size="sm">
          <Edit2 className="w-4 h-4 mr-2" />
          Chỉnh sửa
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border-warm-200">
          <p className="text-sm text-warm-600 mb-1">Trạng thái</p>
          <Badge className="bg-green-100 text-green-800">Hoạt động</Badge>
        </Card>
        <Card className="p-4 border-warm-200">
          <p className="text-sm text-warm-600 mb-1">Số phòng</p>
          <p className="text-2xl font-bold text-warm-900">{property.rooms}</p>
        </Card>
        <Card className="p-4 border-warm-200">
          <p className="text-sm text-warm-600 mb-1">Lượt đặt</p>
          <p className="text-2xl font-bold text-warm-900">
            {property.bookings}
          </p>
        </Card>
        <Card className="p-4 border-warm-200">
          <p className="text-sm text-warm-600 mb-1">Doanh thu</p>
          <p className="text-2xl font-bold text-warm-900">
            {(property.revenue / 1000000).toFixed(0)}M VND
          </p>
        </Card>
      </div>

      {/* Owner Info */}
      <Card className="p-6 border-warm-200">
        <h2 className="text-lg font-semibold text-warm-900 mb-4">
          Thông tin chủ nhà
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-warm-600 mb-1">Tên chủ nhà</p>
            <p className="text-warm-900">{property.owner}</p>
          </div>
          <div>
            <p className="text-sm text-warm-600 mb-1">Email</p>
            <p className="text-warm-900">{property.ownerEmail}</p>
          </div>
          <div>
            <p className="text-sm text-warm-600 mb-1">Số điện thoại</p>
            <p className="text-warm-900">{property.ownerPhone}</p>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="rooms" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rooms">Phòng</TabsTrigger>
          <TabsTrigger value="bookings">Đặt phòng gần đây</TabsTrigger>
          <TabsTrigger value="info">Thông tin</TabsTrigger>
        </TabsList>

        {/* Rooms Tab */}
        <TabsContent value="rooms" className="space-y-4">
          <Card className="overflow-hidden border-warm-200">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-warm-200 bg-warm-50">
                    <th className="text-left py-3 px-4 font-semibold text-warm-900">
                      Tên phòng
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-warm-900">
                      Loại
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-warm-900">
                      Sức chứa
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-warm-900">
                      Giá/đêm
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-warm-900">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {property.roomsList.map((room) => (
                    <tr
                      key={room.id}
                      className="border-b border-warm-100 hover:bg-warm-50"
                    >
                      <td className="py-3 px-4 font-medium text-warm-900">
                        {room.name}
                      </td>
                      <td className="py-3 px-4 text-warm-700">{room.type}</td>
                      <td className="py-3 px-4 text-warm-700">
                        {room.capacity} người
                      </td>
                      <td className="py-3 px-4 font-semibold text-warm-900">
                        {room.price.toLocaleString()} VND
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          className={
                            room.status === "available"
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                          }
                        >
                          {room.status === "available" ? "Có sẵn" : "Đã đặt"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value="bookings" className="space-y-4">
          <Card className="overflow-hidden border-warm-200">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-warm-200 bg-warm-50">
                    <th className="text-left py-3 px-4 font-semibold text-warm-900">
                      Khách
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-warm-900">
                      Check-in
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-warm-900">
                      Check-out
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-warm-900">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {property.recentBookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="border-b border-warm-100 hover:bg-warm-50"
                    >
                      <td className="py-3 px-4 font-medium text-warm-900">
                        {booking.guest}
                      </td>
                      <td className="py-3 px-4 text-warm-700">
                        {booking.checkIn}
                      </td>
                      <td className="py-3 px-4 text-warm-700">
                        {booking.checkOut}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          className={
                            booking.status === "checked-out"
                              ? "bg-gray-100 text-gray-800"
                              : "bg-green-100 text-green-800"
                          }
                        >
                          {booking.status === "checked-out"
                            ? "Đã trả phòng"
                            : "Xác nhận"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Info Tab */}
        <TabsContent value="info" className="space-y-4">
          <Card className="p-6 border-warm-200">
            <h3 className="font-semibold text-warm-900 mb-3">Mô tả</h3>
            <p className="text-warm-700 mb-6">{property.description}</p>

            <h3 className="font-semibold text-warm-900 mb-3">Tiện nghi</h3>
            <div className="flex flex-wrap gap-2">
              {property.amenities.map((amenity) => (
                <Badge key={amenity} className="bg-warm-100 text-warm-800">
                  {amenity}
                </Badge>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
