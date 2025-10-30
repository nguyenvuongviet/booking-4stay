"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit2, Gift } from "lucide-react";
import Link from "next/link";

export default function LoyaltyMemberDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const [member] = useState({
    id: params.id,
    name: "Nguyễn Văn A",
    email: "nguyenvana@email.com",
    phone: "0901234567",
    tier: "Gold",
    points: 5000,
    bookings: 15,
    totalSpent: 45000000,
    joinDate: "2024-01-15",
    lastBooking: "2024-12-20",
    avatar: "/placeholder.svg",
    address: "123 Đường ABC, Hà Nội",
    pointsHistory: [
      {
        id: 1,
        type: "booking",
        description: "Đặt phòng tại Hà Nội",
        points: 500,
        date: "2024-12-20",
      },
      {
        id: 2,
        type: "review",
        description: "Viết đánh giá",
        points: 50,
        date: "2024-12-18",
      },
      {
        id: 3,
        type: "referral",
        description: "Giới thiệu bạn bè",
        points: 200,
        date: "2024-12-15",
      },
      {
        id: 4,
        type: "booking",
        description: "Đặt phòng tại Đà Nẵng",
        points: 600,
        date: "2024-12-10",
      },
    ],
    bookingHistory: [
      {
        id: 1,
        property: "Homestay Hà Nội",
        checkIn: "2024-12-20",
        checkOut: "2024-12-22",
        nights: 2,
        totalPrice: 1000000,
        pointsEarned: 500,
      },
      {
        id: 2,
        property: "Homestay Đà Nẵng",
        checkIn: "2024-12-10",
        checkOut: "2024-12-12",
        nights: 2,
        totalPrice: 1200000,
        pointsEarned: 600,
      },
      {
        id: 3,
        property: "Homestay Hạ Long",
        checkIn: "2024-11-25",
        checkOut: "2024-11-27",
        nights: 2,
        totalPrice: 900000,
        pointsEarned: 450,
      },
    ],
    rewards: [
      {
        id: 1,
        name: "Giảm giá 10%",
        pointsRequired: 1000,
        redeemed: true,
        redeemedDate: "2024-12-15",
      },
      {
        id: 2,
        name: "1 đêm miễn phí",
        pointsRequired: 2000,
        redeemed: false,
        redeemedDate: null,
      },
      {
        id: 3,
        name: "Upgrade phòng",
        pointsRequired: 1500,
        redeemed: false,
        redeemedDate: null,
      },
    ],
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/loyalty">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-warm-900">{member.name}</h1>
          <p className="text-warm-600">{member.email}</p>
        </div>
        <Button variant="outline" size="sm">
          <Edit2 className="w-4 h-4 mr-2" />
          Chỉnh sửa
        </Button>
      </div>

      {/* Member Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border-warm-200">
          <p className="text-sm text-warm-600 mb-1">Cấp độ</p>
          <Badge className="bg-yellow-100 text-yellow-800 text-base py-1 px-2">
            {member.tier}
          </Badge>
        </Card>
        <Card className="p-4 border-warm-200">
          <p className="text-sm text-warm-600 mb-1">Điểm hiện tại</p>
          <p className="text-2xl font-bold text-warm-900">
            {member.points.toLocaleString()}
          </p>
        </Card>
        <Card className="p-4 border-warm-200">
          <p className="text-sm text-warm-600 mb-1">Lượt đặt</p>
          <p className="text-2xl font-bold text-warm-900">{member.bookings}</p>
        </Card>
        <Card className="p-4 border-warm-200">
          <p className="text-sm text-warm-600 mb-1">Tổng chi tiêu</p>
          <p className="text-2xl font-bold text-warm-900">
            {(member.totalSpent / 1000000).toFixed(1)}M VND
          </p>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="points" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="points">Lịch sử điểm</TabsTrigger>
          <TabsTrigger value="bookings">Đặt phòng</TabsTrigger>
          <TabsTrigger value="rewards">Phần thưởng</TabsTrigger>
          <TabsTrigger value="info">Thông tin</TabsTrigger>
        </TabsList>

        {/* Points History Tab */}
        <TabsContent value="points" className="space-y-4">
          <Card className="overflow-hidden border-warm-200">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-warm-200 bg-warm-50">
                    <th className="text-left py-3 px-4 font-semibold text-warm-900">
                      Loại
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-warm-900">
                      Mô tả
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-warm-900">
                      Điểm
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-warm-900">
                      Ngày
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {member.pointsHistory.map((history) => (
                    <tr
                      key={history.id}
                      className="border-b border-warm-100 hover:bg-warm-50"
                    >
                      <td className="py-3 px-4">
                        <Badge className="bg-warm-100 text-warm-800">
                          {history.type === "booking" && "Đặt phòng"}
                          {history.type === "review" && "Đánh giá"}
                          {history.type === "referral" && "Giới thiệu"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-warm-700">
                        {history.description}
                      </td>
                      <td className="py-3 px-4 font-semibold text-warm-900">
                        +{history.points}
                      </td>
                      <td className="py-3 px-4 text-warm-700">
                        {history.date}
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
                      Điểm kiếm
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {member.bookingHistory.map((booking) => (
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
                      <td className="py-3 px-4 font-semibold text-warm-900">
                        +{booking.pointsEarned}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Rewards Tab */}
        <TabsContent value="rewards" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {member.rewards.map((reward) => (
              <Card key={reward.id} className="p-6 border-warm-200">
                <div className="flex items-start justify-between mb-3">
                  <Gift className="w-6 h-6 text-warm-600" />
                  {reward.redeemed && (
                    <Badge className="bg-green-100 text-green-800">
                      Đã dùng
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold text-warm-900 mb-2">
                  {reward.name}
                </h3>
                <p className="text-sm text-warm-600 mb-4">
                  Yêu cầu: {reward.pointsRequired.toLocaleString()} điểm
                </p>
                {reward.redeemed ? (
                  <p className="text-xs text-warm-600">
                    Dùng vào: {reward.redeemedDate}
                  </p>
                ) : (
                  <Button
                    size="sm"
                    className="w-full bg-warm-700 hover:bg-warm-800"
                    disabled={member.points < reward.pointsRequired}
                  >
                    Đổi thưởng
                  </Button>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Info Tab */}
        <TabsContent value="info" className="space-y-4">
          <Card className="p-6 border-warm-200">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-warm-600 mb-1">Email</p>
                <p className="text-warm-900">{member.email}</p>
              </div>
              <div>
                <p className="text-sm text-warm-600 mb-1">Số điện thoại</p>
                <p className="text-warm-900">{member.phone}</p>
              </div>
              <div>
                <p className="text-sm text-warm-600 mb-1">Địa chỉ</p>
                <p className="text-warm-900">{member.address}</p>
              </div>
              <div>
                <p className="text-sm text-warm-600 mb-1">Ngày tham gia</p>
                <p className="text-warm-900">{member.joinDate}</p>
              </div>
              <div>
                <p className="text-sm text-warm-600 mb-1">
                  Lần đặt phòng gần nhất
                </p>
                <p className="text-warm-900">{member.lastBooking}</p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
