"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Calendar } from "lucide-react";

const revenueData = [
  { month: "Tháng 1", revenue: 12000, bookings: 45 },
  { month: "Tháng 2", revenue: 15000, bookings: 52 },
  { month: "Tháng 3", revenue: 18000, bookings: 60 },
  { month: "Tháng 4", revenue: 16000, bookings: 55 },
  { month: "Tháng 5", revenue: 22000, bookings: 72 },
  { month: "Tháng 6", revenue: 25000, bookings: 85 },
];

const occupancyData = [
  { name: "Quận 1", occupancy: 85, fill: "#8b7355" },
  { name: "Quận 3", occupancy: 72, fill: "#a0826d" },
  { name: "Quận 5", occupancy: 68, fill: "#b8956a" },
  { name: "Quận 7", occupancy: 78, fill: "#d4a574" },
  { name: "Quận 9", occupancy: 65, fill: "#e8c4a0" },
];

const satisfactionData = [
  { rating: "5 sao", count: 450, fill: "#10b981" },
  { rating: "4 sao", count: 280, fill: "#3b82f6" },
  { rating: "3 sao", count: 120, fill: "#f59e0b" },
  { rating: "2 sao", count: 30, fill: "#ef4444" },
  { rating: "1 sao", count: 20, fill: "#dc2626" },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Báo cáo & Thống kê</h1>
          <p className="text-muted-foreground mt-1">
            Phân tích dữ liệu kinh doanh chi tiết
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 gap-2">
          <Download className="w-4 h-4" />
          Xuất báo cáo
        </Button>
      </div>

      {/* Date Range Filter */}
      <Card className="p-4">
        <div className="flex gap-4 items-center flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Khoảng thời gian:</span>
          </div>
          <select className="px-3 py-2 border border-border rounded-lg bg-card text-sm">
            <option>Tháng này</option>
            <option>Quý này</option>
            <option>Năm này</option>
            <option>Tất cả thời gian</option>
          </select>
          <select className="px-3 py-2 border border-border rounded-lg bg-card text-sm">
            <option>Tất cả khu vực</option>
            <option>Quận 1</option>
            <option>Quận 3</option>
            <option>Quận 5</option>
            <option>Quận 7</option>
            <option>Quận 9</option>
          </select>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Tổng doanh thu</p>
          <p className="text-3xl font-bold mt-2">$108,000</p>
          <p className="text-xs text-green-600 mt-2">
            ↑ 12% so với tháng trước
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Tổng lượt đặt</p>
          <p className="text-3xl font-bold mt-2">369</p>
          <p className="text-xs text-green-600 mt-2">↑ 8% so với tháng trước</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Tỷ lệ chiếm dụng</p>
          <p className="text-3xl font-bold mt-2">74%</p>
          <p className="text-xs text-green-600 mt-2">↑ 5% so với tháng trước</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Đánh giá trung bình</p>
          <p className="text-3xl font-bold mt-2">4.6</p>
          <p className="text-xs text-green-600 mt-2">
            ↑ 0.2 so với tháng trước
          </p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue & Bookings */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">
            Doanh thu & Lượt đặt theo tháng
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
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
                dataKey="revenue"
                fill="var(--chart-1)"
                radius={[8, 8, 0, 0]}
              />
              <Bar
                dataKey="bookings"
                fill="var(--chart-2)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Occupancy by Area */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">
            Tỷ lệ chiếm dụng theo khu vực
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={occupancyData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" stroke="var(--muted-foreground)" />
              <YAxis
                dataKey="name"
                type="category"
                stroke="var(--muted-foreground)"
                width={80}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                }}
              />
              <Bar
                dataKey="occupancy"
                fill="var(--chart-1)"
                radius={[0, 8, 8, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Satisfaction Rating */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">
            Phân bố đánh giá khách hàng
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={satisfactionData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="count"
              >
                {satisfactionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {satisfactionData.map((item) => (
              <div
                key={item.rating}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.fill }}
                  ></div>
                  <span>{item.rating}</span>
                </div>
                <span className="font-semibold">{item.count}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Revenue Trend */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Xu hướng doanh thu</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
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
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="var(--chart-1)"
                strokeWidth={2}
                dot={{ fill: "var(--chart-1)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Top Properties */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">
          Top 5 Homestay theo doanh thu
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold">Xếp hạng</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Tên homestay
                </th>
                <th className="text-left py-3 px-4 font-semibold">Khu vực</th>
                <th className="text-left py-3 px-4 font-semibold">Doanh thu</th>
                <th className="text-left py-3 px-4 font-semibold">Lượt đặt</th>
                <th className="text-left py-3 px-4 font-semibold">Đánh giá</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  rank: 1,
                  name: "Beach Villa",
                  area: "Quận 1",
                  revenue: "$28,500",
                  bookings: 95,
                  rating: 4.9,
                },
                {
                  rank: 2,
                  name: "City Apartment",
                  area: "Quận 5",
                  revenue: "$24,200",
                  bookings: 82,
                  rating: 4.8,
                },
                {
                  rank: 3,
                  name: "Beachfront House",
                  area: "Quận 7",
                  revenue: "$21,800",
                  bookings: 75,
                  rating: 4.7,
                },
                {
                  rank: 4,
                  name: "Mountain Cabin",
                  area: "Quận 3",
                  revenue: "$18,500",
                  bookings: 68,
                  rating: 4.6,
                },
                {
                  rank: 5,
                  name: "Forest Retreat",
                  area: "Quận 9",
                  revenue: "$15,000",
                  bookings: 49,
                  rating: 4.5,
                },
              ].map((property) => (
                <tr
                  key={property.rank}
                  className="border-b border-border hover:bg-muted/30"
                >
                  <td className="py-3 px-4 font-semibold">{property.rank}</td>
                  <td className="py-3 px-4">{property.name}</td>
                  <td className="py-3 px-4">{property.area}</td>
                  <td className="py-3 px-4 font-semibold">
                    {property.revenue}
                  </td>
                  <td className="py-3 px-4">{property.bookings}</td>
                  <td className="py-3 px-4">⭐ {property.rating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
