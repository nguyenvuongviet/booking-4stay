"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";

import {
  BookingStatusSummary,
  DashboardStats,
  getBookingStatusSummary,
  getDashboardRevenue,
  getDashboardStats,
  getPopularRooms,
  getRecentDashboardBookings,
  PopularRoomItem,
  RecentBookingItem,
  RevenueByMonth,
} from "@/services/admin/dashboardApi";
import { Calendar, DoorOpen, Download, Eye, Users, Wallet } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { RefreshButton } from "./_components/RefreshButton";
import { StatCard } from "./_components/stat-card";
import { exportCSV, exportJSON } from "./_utils/export";

const BOOKING_STATUS_COLORS: Record<string, { label: string; color: string }> =
  {
    PENDING: { label: "Chờ thanh toán", color: "#fb923c" },
    PARTIALLY_PAID: { label: "Thanh toán một phần", color: "#facc15" },
    CONFIRMED: { label: "Đã xác nhận", color: "#22c55e" },
    CHECKED_IN: { label: "Đã nhận phòng", color: "#06b6d4" },
    CHECKED_OUT: { label: "Đã trả phòng", color: "#0ea5e9" },
    CANCELLED: { label: "Đã hủy", color: "#ef4444" },
    WAITING_REFUND: { label: "Chờ hoàn tiền", color: "#8b5cf6" },
    REFUNDED: { label: "Đã hoàn tiền", color: "#6b7280" },
  };

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenue, setRevenue] = useState<RevenueByMonth[]>([]);
  const [status, setStatus] = useState<BookingStatusSummary[]>([]);
  const [recent, setRecent] = useState<RecentBookingItem[]>([]);
  const [popular, setPopular] = useState<PopularRoomItem[]>([]);
  const [loading, setLoading] = useState(true);
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);

  const load = async () => {
    setLoading(true);

    try {
      const [statsRes, revenueRes, statusRes, recentRes, popularRes] =
        await Promise.all([
          getDashboardStats(),
          getDashboardRevenue(year),
          getBookingStatusSummary(),
          getRecentDashboardBookings(),
          getPopularRooms(),
        ]);
      setStats(statsRes);
      setRevenue(revenueRes);
      setStatus(statusRes);
      setRecent(recentRes);
      setPopular(popularRes);
    } catch {
      toast.error("Không thể tải dashboard");
    } finally {
      setLoading(false);
    }
  };

  const loadRevenue = async (selectedYear: number) => {
    try {
      const data = await getDashboardRevenue(selectedYear);
      setRevenue(data);
    } catch {
      toast.error("Không thể tải biểu đồ theo năm");
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    loadRevenue(year);
  }, [year]);

  if (!stats && loading) return <div className="p-6">Đang tải...</div>;

  const chartData = revenue.map((m) => ({
    month: m.month,
    revenue: Number(m.revenue ?? 0),
    bookings: Number(m.bookings ?? 0),
  }));

  const handleExport = (data: any) => {
    const { stats, revenue, status, recent, popular } = data;

    toast.success("Đang chuẩn bị file báo cáo...");

    exportCSV("revenue_by_month", revenue);
    exportCSV("booking_status_summary", status);
    exportCSV("recent_bookings", recent);
    exportCSV("popular_rooms", popular);

    exportJSON("dashboard_full_report", data);
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tổng quan</h1>
          <p className="text-muted-foreground mt-1">
            Tổng quan hoạt động hệ thống 4Stay.
          </p>
        </div>

        <div className="flex gap-3">
          <RefreshButton onRefresh={load} />
          <Button
            onClick={() =>
              handleExport({ stats, revenue, status, recent, popular })
            }
          >
            <Download className="w-4 h-4 mr-2" />
            Xuất báo cáo
          </Button>
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          label="Người dùng"
          value={stats!.totalUsers.toLocaleString()}
        />
        <StatCard
          icon={DoorOpen}
          label="Số phòng"
          value={stats!.totalRooms.toLocaleString()}
        />
        <StatCard
          icon={Calendar}
          label="Lượt đặt"
          value={stats!.totalBookings.toLocaleString()}
        />
        <StatCard
          icon={Wallet}
          label="Doanh thu"
          value={(stats!.totalRevenue ?? 0).toLocaleString() + " ₫"}
        />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2 p-8 bg-white/70 backdrop-blur-md rounded-xl shadow-2xl border border-gray-100">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Doanh thu & Lượt đặt theo tháng
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Tổng quan hiệu suất kinh doanh theo năm.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 font-medium">Năm:</span>
              <select
                className="h-10 pl-4 pr-8 border border-gray-300 rounded-lg shadow-sm"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
              >
                {Array.from({ length: 5 }).map((_, i) => {
                  const y = currentYear - i;
                  return (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="h-[380px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 30, right: 30, left: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis
                  yAxisId="left"
                  tickFormatter={(v) => (v / 1_000_000).toFixed(1) + " tr"}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickFormatter={(v) => v.toLocaleString()}
                />
                <RTooltip />
                <Legend iconType="circle" />

                <Bar
                  yAxisId="left"
                  dataKey="revenue"
                  fill="#0ea5e9"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  yAxisId="right"
                  dataKey="bookings"
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">
            Tỷ lệ trạng thái booking
          </h2>

          <div className="flex flex-col lg:flex-row lg:items-start gap-6">
            <div className="lg:w-2/3 w-full">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={status}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                    stroke="white"
                    strokeWidth={2}
                  >
                    {status.map((item) => (
                      <Cell
                        key={item.status}
                        fill={BOOKING_STATUS_COLORS[item.status].color}
                      />
                    ))}
                  </Pie>

                  <RTooltip
                    formatter={(value: number, name, entry: any) => {
                      const s = entry?.payload?.status;
                      return [
                        `${value} lượt`,
                        BOOKING_STATUS_COLORS[s]?.label ?? s,
                      ];
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 text-sm justify-center lg:flex-col lg:justify-start">
              {status.map((item) => (
                <div key={item.status} className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-sm"
                    style={{
                      backgroundColor: BOOKING_STATUS_COLORS[item.status].color,
                    }}
                  />
                  <span className="font-medium">
                    {BOOKING_STATUS_COLORS[item.status].label}
                  </span>
                  <span className="text-gray-500">({item.count})</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>

      <section>
        <Card className="p-6 shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Đặt phòng gần đây</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground bg-muted/20 text-left">
                  <th className="py-2 px-3">ID</th>
                  <th className="py-2 px-3">Khách</th>
                  <th className="py-2 px-3">Phòng</th>
                  <th className="py-2 px-3">Tổng</th>
                  <th className="py-2 px-3">Trạng thái</th>
                  <th className="py-2 px-3">Ngày tạo</th>
                  <th className="py-2 px-3">Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((b) => (
                  <tr key={b.id} className="border-b hover:bg-muted/40">
                    <td className="p-2">{b.id}</td>
                    <td className="p-2">{b.userName}</td>
                    <td className="p-2">{b.roomName}</td>
                    <td className="p-2 text-primary font-semibold">
                      {b.total.toLocaleString()}₫
                    </td>
                    <td className="p-2">
                      <span
                        className="px-2 py-1 text-xs rounded-full"
                        style={{
                          backgroundColor:
                            BOOKING_STATUS_COLORS[b.status].color + "20",
                          color: BOOKING_STATUS_COLORS[b.status].color,
                        }}
                      >
                        {BOOKING_STATUS_COLORS[b.status].label}
                      </span>
                    </td>
                    <td className="p-2 text-muted-foreground">
                      {new Date(b.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="p-2">
                      <Link href={`/admin/bookings/${b.id}`}>
                        <Button variant="ghost" size="icon">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      <section>
        <Card className="p-6 shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Phòng phổ biến</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {popular.map((room, i) => (
              <Link key={i} href={`/admin/rooms/${room.roomId}`}>
                <div
                  key={i}
                  className="border rounded-xl p-4 bg-card shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{room.roomName}</h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        i < 3
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      TOP {i + 1}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground mt-1">
                    {room.bookings} lượt đặt
                  </p>

                  <p className="font-semibold text-sm text-green-600 mt-2">
                    Doanh thu: {room.revenue.toLocaleString()}₫
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
