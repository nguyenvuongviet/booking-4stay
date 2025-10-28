"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit2, Mail, Phone, MapPin, Calendar } from "lucide-react";
import Link from "next/link";

export default function UserDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const [user] = useState({
    id: params.id,
    name: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    phone: "+84 901 234 567",
    role: "user",
    status: "active",
    joinDate: "2024-01-15",
    lastLogin: "2024-12-20",
    address: "123 Đường ABC, Hà Nội",
    avatar: "/placeholder.svg",
    totalBookings: 5,
    totalSpent: 15000000,
    loyaltyTier: "Silver",
    bookings: [
      {
        id: 1,
        property: "Homestay Hà Nội",
        checkIn: "2024-12-20",
        checkOut: "2024-12-22",
        nights: 2,
        totalPrice: 1000000,
        status: "checked-out",
      },
      {
        id: 2,
        property: "Homestay Đà Nẵng",
        checkIn: "2024-11-10",
        checkOut: "2024-11-12",
        nights: 2,
        totalPrice: 1200000,
        status: "checked-out",
      },
      {
        id: 3,
        property: "Homestay Hạ Long",
        checkIn: "2024-10-05",
        checkOut: "2024-10-07",
        nights: 2,
        totalPrice: 900000,
        status: "checked-out",
      },
    ],
    reviews: [
      {
        id: 1,
        property: "Homestay Hà Nội",
        rating: 5,
        comment: "Phòng rất sạch sẽ, chủ nhà thân thiện",
        date: "2024-12-22",
      },
      {
        id: 2,
        property: "Homestay Đà Nẵng",
        rating: 4,
        comment: "Tốt nhưng hơi ồn",
        date: "2024-11-12",
      },
    ],
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/users">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-warm-900">{user.name}</h1>
          <p className="text-warm-600">{user.email}</p>
        </div>
        <Button variant="outline" size="sm">
          <Edit2 className="w-4 h-4 mr-2" />
          Chỉnh sửa
        </Button>
      </div>

      {/* User Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border-warm-200">
          <p className="text-sm text-warm-600 mb-1">Vai trò</p>
          <Badge className="bg-blue-100 text-blue-800">Khách hàng</Badge>
        </Card>
        <Card className="p-4 border-warm-200">
          <p className="text-sm text-warm-600 mb-1">Trạng thái</p>
          <Badge className="bg-green-100 text-green-800">Hoạt động</Badge>
        </Card>
        <Card className="p-4 border-warm-200">
          <p className="text-sm text-warm-600 mb-1">Lượt đặt</p>
          <p className="text-2xl font-bold text-warm-900">
            {user.totalBookings}
          </p>
        </Card>
        <Card className="p-4 border-warm-200">
          <p className="text-sm text-warm-600 mb-1">Tổng chi tiêu</p>
          <p className="text-2xl font-bold text-warm-900">
            {(user.totalSpent / 1000000).toFixed(1)}M VND
          </p>
        </Card>
      </div>

      {/* Contact Info */}
      <Card className="p-6 border-warm-200">
        <h2 className="text-lg font-semibold text-warm-900 mb-4">
          Thông tin liên hệ
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-warm-600 mt-1" />
            <div>
              <p className="text-sm text-warm-600">Email</p>
              <p className="text-warm-900">{user.email}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-warm-600 mt-1" />
            <div>
              <p className="text-sm text-warm-600">Số điện thoại</p>
              <p className="text-warm-900">{user.phone}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-warm-600 mt-1" />
            <div>
              <p className="text-sm text-warm-600">Địa chỉ</p>
              <p className="text-warm-900">{user.address}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-warm-600 mt-1" />
            <div>
              <p className="text-sm text-warm-600">Ngày tham gia</p>
              <p className="text-warm-900">{user.joinDate}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="bookings" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="bookings">Đặt phòng</TabsTrigger>
          <TabsTrigger value="reviews">Đánh giá</TabsTrigger>
        </TabsList>

        {/* Bookings Tab */}
        <TabsContent value="bookings" className="space-y-4">
          <Card className="overflow-hidden border-warm-200">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-warm-200 bg-warm-50">
                    <th className="text-left py-3 px-4 font-semibold text-warm-900">
                      Homestay
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-warm-900">
                      Check-in
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-warm-900">
                      Check-out
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-warm-900">
                      Đêm
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-warm-900">
                      Tổng tiền
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-warm-900">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {user.bookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="border-b border-warm-100 hover:bg-warm-50"
                    >
                      <td className="py-3 px-4 font-medium text-warm-900">
                        {booking.property}
                      </td>
                      <td className="py-3 px-4 text-warm-700">
                        {booking.checkIn}
                      </td>
                      <td className="py-3 px-4 text-warm-700">
                        {booking.checkOut}
                      </td>
                      <td className="py-3 px-4 text-warm-700">
                        {booking.nights}
                      </td>
                      <td className="py-3 px-4 font-semibold text-warm-900">
                        {booking.totalPrice.toLocaleString()} VND
                      </td>
                      <td className="py-3 px-4">
                        <Badge className="bg-gray-100 text-gray-800">
                          Đã trả phòng
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
          {user.reviews.map((review) => (
            <Card key={review.id} className="p-4 border-warm-200">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-warm-900">
                    {review.property}
                  </p>
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
      </Tabs>
    </div>
  );
}
