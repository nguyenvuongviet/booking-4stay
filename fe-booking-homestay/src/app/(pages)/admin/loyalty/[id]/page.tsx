"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit2, Gift } from "lucide-react";
import Link from "next/link";
import { getUserById } from "@/services/admin/usersApi";
import { useToast } from "@/components/ui/use-toast";
import { User } from "@/types/user";
import { get_booking } from "@/services/bookingApi";
import { Booking } from "@/models/Booking";
import { format } from "date-fns";

export default function LoyaltyMemberDetailsPage({
  params,
}: {
  params: { id: number };
}) {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);

  async function fetchUsers() {
    try {
      setLoading(true);
      setError(null);
      const data = await getUserById(params.id as unknown as number);
      setUser(data);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể tải danh sách người dùng";
      setError(msg);
      toast({
        variant: "destructive",
        title: "Lỗi tải dữ liệu",
        description: msg,
      });
    } finally {
      setLoading(false);
    }
  }

  const fetchBookings = async () => {
    try {
      const res = await get_booking({ page: 1, pageSize: 999 });
      const items = res.bookings || [];
      setBookings((prev) => ( 1 ? items : [...prev, ...items]));
    } catch (err) {
      console.error("Fetch booking history error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchBookings();
  }, []);

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
          <h1 className="text-3xl font-bold text-warm-900">
            {user?.firstName} {user?.lastName}
          </h1>
          <p className="text-warm-600">{user?.email}</p>
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
            {user?.loyalty_program.levels.name}
          </Badge>
        </Card>
        <Card className="p-4 border-warm-200">
          <p className="text-sm text-warm-600 mb-1">Điểm hiện tại</p>
          <p className="text-2xl font-bold text-warm-900">
            {user?.loyalty_program.totalPoint.toLocaleString()}
          </p>
        </Card>
        <Card className="p-4 border-warm-200">
          <p className="text-sm text-warm-600 mb-1">Lượt đặt</p>
          <p className="text-2xl font-bold text-warm-900">
            {user?.loyalty_program.totalBooking}
          </p>
        </Card>
        <Card className="p-4 border-warm-200">
          <p className="text-sm text-warm-600 mb-1">Tổng chi tiêu</p>
          <p className="text-2xl font-bold text-warm-900">
            {((user?.loyalty_program.totalPoint || 0) / 1000000).toFixed(1)}M
            VND
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
                  {bookings.map((history) => (
                    <tr
                      key={history.id}
                      className="border-b border-warm-100 hover:bg-warm-50"
                    >
                      <td className="py-3 px-4">
                        <Badge className="bg-warm-100 text-warm-800">
                          {/* {history.type === "booking" && "Đặt phòng"}
                          {history.type === "review" && "Đánh giá"}
                          {history.type === "referral" && "Giới thiệu"} */}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-warm-700">
                        {history.room.name}
                      </td>
                      <td className="py-3 px-4 font-semibold text-warm-900">
                        +{history.totalAmount / 1000}
                      </td>
                      <td className="py-3 px-4 text-warm-700">
                        {format(history.createdAt, "dd/MM/yyyy")}
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
                  {bookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="border-b border-warm-100 hover:bg-warm-50"
                    >
                      <td className="py-3 px-4 font-medium text-warm-900">
                        {booking.room.name}
                      </td>
                      <td className="py-3 px-4 text-warm-700">
                        {booking.checkIn}
                      </td>
                      <td className="py-3 px-4 text-warm-700">
                        {booking.checkOut}
                      </td>
                      <td className="py-3 px-4 text-warm-700">
                        {/* {booking.checkOut - booking.checkIn} đêm */}
                      </td>
                      <td className="py-3 px-4 font-semibold text-warm-900">
                        {booking.totalAmount.toLocaleString()} VND
                      </td>
                      <td className="py-3 px-4 font-semibold text-warm-900">
                        +{booking.totalAmount / 1000}
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
            {/* {member.rewards.map((reward) =>  */}(
            <Card
              // key={reward.id}
              className="p-6 border-warm-200"
            >
              <div className="flex items-start justify-between mb-3">
                <Gift className="w-6 h-6 text-warm-600" />
                {/* {reward.redeemed && ( */}
                <Badge className="bg-green-100 text-green-800">Đã dùng</Badge>
                {/* )} */}
              </div>
              <h3 className="font-semibold text-warm-900 mb-2">
                {/* {reward.name} */}
              </h3>
              <p className="text-sm text-warm-600 mb-4">
                Yêu cầu:
                {/* {reward.pointsRequired.toLocaleString()} điểm */}
              </p>
              {/* {reward.redeemed ? ( */}
              <p className="text-xs text-warm-600">
                Dùng vào:
                {/* {reward.redeemedDate} */}
              </p>
              ) : (
              <Button
                size="sm"
                className="w-full bg-warm-700 hover:bg-warm-800"
                // disabled={member.points < reward.pointsRequired}
              >
                Đổi thưởng
              </Button>
              {/* )} */}
            </Card>
            ){/* )} */}
          </div>
        </TabsContent>

        {/* Info Tab */}
        <TabsContent value="info" className="space-y-4">
          <Card className="p-6 border-warm-200">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-warm-600 mb-1">Email</p>
                <p className="text-warm-900">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-warm-600 mb-1">Số điện thoại</p>
                <p className="text-warm-900">{user?.phoneNumber}</p>
              </div>
              <div>
                <p className="text-sm text-warm-600 mb-1">Địa chỉ</p>
                <p className="text-warm-900">{user?.provider}</p>
              </div>
              <div>
                <p className="text-sm text-warm-600 mb-1">Ngày tham gia</p>
                <p className="text-warm-900">{user?.createdAt}</p>
              </div>
              <div>
                <p className="text-sm text-warm-600 mb-1">
                  Lần đặt phòng gần nhất
                </p>
                <p className="text-warm-900">
                  29/11/2025
                  {/* {user?.} */}
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
