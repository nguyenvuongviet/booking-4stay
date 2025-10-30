"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit2, Trash2, Plus } from "lucide-react";
import Link from "next/link";

const AMENITIES_LIST = [
  { id: "wifi", label: "WiFi", icon: "📡" },
  { id: "ac", label: "Điều hòa", icon: "❄️" },
  { id: "tv", label: "TV", icon: "📺" },
  { id: "kitchen", label: "Bếp", icon: "🍳" },
  { id: "parking", label: "Chỗ đỗ xe", icon: "🅿️" },
  { id: "pool", label: "Hồ bơi", icon: "🏊" },
  { id: "gym", label: "Phòng tập", icon: "💪" },
  { id: "washer", label: "Máy giặt", icon: "🧺" },
  { id: "dryer", label: "Máy sấy", icon: "🌬️" },
  { id: "heating", label: "Sưởi ấm", icon: "🔥" },
  { id: "balcony", label: "Ban công", icon: "🌳" },
  { id: "garden", label: "Vườn", icon: "🌺" },
];

export default function RoomDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const [room] = useState({
    id: params.id,
    name: "Phòng Deluxe 101",
    roomNumber: "101",
    type: "Deluxe",
    capacity: 2,
    price: 500000,
    description:
      "Phòng Deluxe rộng rãi với view đẹp, trang bị đầy đủ tiện nghi hiện đại.",
    amenities: ["wifi", "ac", "tv", "kitchen", "balcony"],
    status: "available",
    images: ["/luxury-room.jpg"],
    bookings: [
      {
        id: 1,
        guest: "Nguyễn Văn A",
        checkIn: "2024-01-15",
        checkOut: "2024-01-18",
        status: "confirmed",
      },
      {
        id: 2,
        guest: "Trần Thị B",
        checkIn: "2024-01-20",
        checkOut: "2024-01-22",
        status: "pending",
      },
    ],
    reviews: [
      {
        id: 1,
        guest: "Nguyễn Văn A",
        rating: 5,
        comment: "Phòng rất sạch sẽ và thoải mái",
        date: "2024-01-18",
      },
      {
        id: 2,
        guest: "Trần Thị B",
        rating: 4,
        comment: "Tốt nhưng hơi ồn",
        date: "2024-01-22",
      },
    ],
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/rooms">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-warm-900">{room.name}</h1>
            <p className="text-warm-600">Phòng số {room.roomNumber}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Edit2 className="w-4 h-4 mr-2" />
            Chỉnh sửa
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700 bg-transparent"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Xóa
          </Button>
        </div>
      </div>

      {/* Main Info */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-warm-600 mb-1">Loại phòng</p>
          <p className="text-lg font-semibold text-warm-900">{room.type}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-warm-600 mb-1">Sức chứa</p>
          <p className="text-lg font-semibold text-warm-900">
            {room.capacity} khách
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-warm-600 mb-1">Giá/đêm</p>
          <p className="text-lg font-semibold text-warm-900">
            {room.price.toLocaleString()} VND
          </p>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="amenities" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="amenities">Tiện nghi</TabsTrigger>
          <TabsTrigger value="bookings">Đặt phòng</TabsTrigger>
          <TabsTrigger value="reviews">Đánh giá</TabsTrigger>
          <TabsTrigger value="images">Hình ảnh</TabsTrigger>
        </TabsList>

        {/* Amenities Tab */}
        <TabsContent value="amenities" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-warm-900">
                Tiện nghi phòng
              </h3>
              <Button size="sm" className="bg-warm-700 hover:bg-warm-800">
                <Plus className="w-4 h-4 mr-2" />
                Thêm tiện nghi
              </Button>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {AMENITIES_LIST.map((amenity) => (
                <div
                  key={amenity.id}
                  className={`p-4 rounded-lg border-2 text-center cursor-pointer transition ${
                    room.amenities.includes(amenity.id)
                      ? "border-warm-400 bg-warm-50"
                      : "border-warm-200 bg-white hover:border-warm-300"
                  }`}
                >
                  <div className="text-2xl mb-2">{amenity.icon}</div>
                  <p className="text-sm font-medium text-warm-900">
                    {amenity.label}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value="bookings" className="space-y-4">
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-warm-50 border-b border-warm-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-warm-900">
                      Khách
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-warm-900">
                      Check-in
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-warm-900">
                      Check-out
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-warm-900">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {room.bookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="border-b border-warm-100 hover:bg-warm-50"
                    >
                      <td className="px-6 py-4 text-sm text-warm-900">
                        {booking.guest}
                      </td>
                      <td className="px-6 py-4 text-sm text-warm-700">
                        {booking.checkIn}
                      </td>
                      <td className="px-6 py-4 text-sm text-warm-700">
                        {booking.checkOut}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Badge
                          variant={
                            booking.status === "confirmed"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {booking.status === "confirmed"
                            ? "Xác nhận"
                            : "Chờ xác nhận"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="space-y-4">
          {room.reviews.map((review) => (
            <Card key={review.id} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-warm-900">{review.guest}</p>
                  <p className="text-sm text-warm-600">{review.date}</p>
                </div>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={
                        i < review.rating ? "text-yellow-400" : "text-warm-300"
                      }
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-warm-700">{review.comment}</p>
            </Card>
          ))}
        </TabsContent>

        {/* Images Tab */}
        <TabsContent value="images" className="space-y-4">
          <Card className="p-6">
            <div className="grid grid-cols-3 gap-4">
              {room.images.map((image, idx) => (
                <div
                  key={idx}
                  className="relative aspect-video rounded-lg overflow-hidden bg-warm-100"
                >
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`Room ${idx}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              <div className="aspect-video rounded-lg border-2 border-dashed border-warm-300 flex items-center justify-center cursor-pointer hover:bg-warm-50">
                <Plus className="w-8 h-8 text-warm-400" />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
