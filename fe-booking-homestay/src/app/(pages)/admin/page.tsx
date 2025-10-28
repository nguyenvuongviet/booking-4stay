"use client";

import { StatCard } from "@/components/admin/stat-card";
import { Card } from "@/components/ui/card";
import { Calendar, DollarSign, DoorOpen, Home, Users } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const bookingData = [
  { month: "Jan", bookings: 40, revenue: 2400 },
  { month: "Feb", bookings: 35, revenue: 2210 },
  { month: "Mar", bookings: 50, revenue: 2290 },
  { month: "Apr", bookings: 45, revenue: 2000 },
  { month: "May", bookings: 60, revenue: 2181 },
  { month: "Jun", bookings: 55, revenue: 2500 },
];

const areaData = [
  { name: "Quận 1", value: 25, fill: "#8b7355" },
  { name: "Quận 3", value: 20, fill: "#a0826d" },
  { name: "Quận 5", value: 18, fill: "#b8956a" },
  { name: "Quận 7", value: 22, fill: "#d4a574" },
  { name: "Khác", value: 15, fill: "#e8c4a0" },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          console.log("🚀 ~ AdminDashboard ~ foreground:", foreground)
          Chào mừng trở lại! Đây là tổng quan hệ thống 4Stay của bạn.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          icon={Users}
          label="Tổng số người dùng"
          value="1,234"
          change="8% tăng trưởng"
          trend="up"
        />
        <StatCard
          icon={Home}
          label="Tổng số homestay"
          value="45"
          change="2 mới tháng này"
          trend="up"
        />
        <StatCard
          icon={DoorOpen}
          label="Tổng số phòng hoạt động"
          value="156"
          change="5 phòng mới"
          trend="up"
        />
        <StatCard
          icon={Calendar}
          label="Lượt đặt phòng tháng này"
          value="285"
          change="12% từ tháng trước"
          trend="up"
        />
        <StatCard
          icon={DollarSign}
          label="Tổng doanh thu tháng"
          value="$45,231"
          change="15% tăng"
          trend="up"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bookings & Revenue Chart */}
        <Card className="lg:col-span-2 p-6">
          <h2 className="text-lg font-semibold mb-4">Bookings & Revenue</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={bookingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar
                dataKey="bookings"
                fill="var(--chart-1)"
                radius={[8, 8, 0, 0]}
              />
              <Bar
                dataKey="revenue"
                fill="var(--chart-2)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Property Status */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">
            Tỷ lệ homestay theo khu vực
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={areaData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {areaData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {areaData.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.fill }}
                  ></div>
                  <span>{item.name}</span>
                </div>
                <span className="font-semibold">{item.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Đặt phòng gần đây</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold">
                  Booking ID
                </th>
                <th className="text-left py-3 px-4 font-semibold">Tên khách</th>
                <th className="text-left py-3 px-4 font-semibold">Phòng</th>
                <th className="text-left py-3 px-4 font-semibold">Check-in</th>
                <th className="text-left py-3 px-4 font-semibold">Check-out</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Trạng thái
                </th>
                <th className="text-left py-3 px-4 font-semibold">Tổng tiền</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  id: "#BK001",
                  guest: "Nguyễn Văn A",
                  property: "Beach Villa",
                  checkin: "2025-01-15",
                  checkout: "2025-01-18",
                  status: "Confirmed",
                  amount: "$450",
                },
                {
                  id: "#BK002",
                  guest: "Trần Thị B",
                  property: "Mountain Cabin",
                  checkin: "2025-01-16",
                  checkout: "2025-01-20",
                  status: "Pending",
                  amount: "$320",
                },
                {
                  id: "#BK003",
                  guest: "Lê Minh C",
                  property: "City Apartment",
                  checkin: "2025-01-17",
                  checkout: "2025-01-19",
                  status: "Confirmed",
                  amount: "$280",
                },
              ].map((booking) => (
                <tr
                  key={booking.id}
                  className="border-b border-border hover:bg-muted/50 transition-colors"
                >
                  <td className="py-3 px-4 font-medium">{booking.id}</td>
                  <td className="py-3 px-4">{booking.guest}</td>
                  <td className="py-3 px-4">{booking.property}</td>
                  <td className="py-3 px-4">{booking.checkin}</td>
                  <td className="py-3 px-4">{booking.checkout}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        booking.status === "Confirmed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold">{booking.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">
          Homestay mới được thêm gần đây
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              id: 1,
              name: "Beach Villa",
              location: "Quận 1",
              rooms: 5,
              rating: 4.8,
              price: "$120/night",
            },
            {
              id: 2,
              name: "Mountain Cabin",
              location: "Quận 3",
              rooms: 3,
              rating: 4.6,
              price: "$80/night",
            },
            {
              id: 3,
              name: "City Apartment",
              location: "Quận 5",
              rooms: 2,
              rating: 4.9,
              price: "$100/night",
            },
          ].map((homestay) => (
            <div
              key={homestay.id}
              className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="w-full h-32 bg-muted rounded-lg mb-3"></div>
              <h3 className="font-semibold text-sm">{homestay.name}</h3>
              <p className="text-xs text-muted-foreground">
                {homestay.location}
              </p>
              <div className="flex justify-between items-center mt-3 text-xs">
                <span>{homestay.rooms} phòng</span>
                <span className="font-semibold">⭐ {homestay.rating}</span>
              </div>
              <p className="text-sm font-semibold mt-2">{homestay.price}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
