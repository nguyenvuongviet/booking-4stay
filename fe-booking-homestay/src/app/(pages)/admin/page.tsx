"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  getDashboardStats,
  getDashboardRevenue,
  getBookingStatusSummary,
  getRecentDashboardBookings,
  getPopularRooms,
  DashboardStats,
  RevenueByMonth,
  BookingStatusSummary,
  PopularRoomItem,
  RecentBookingItem,
} from "@/services/admin/dashboardApi";

import {
  Calendar,
  DoorOpen,
  Users,
  Wallet,
  RefreshCw,
  Download,
} from "lucide-react";

import toast from "react-hot-toast";
import { StatCard } from "./_components/stat-card";

// Recharts
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const BOOKING_STATUS_COLORS: Record<string, { label: string; color: string }> =
  {
    PENDING: { label: "Chờ thanh toán", color: "#facc15" },
    CONFIRMED: { label: "Đã xác nhận", color: "#3b82f6" },
    CHECKED_IN: { label: "Đã nhận phòng", color: "#0ea5e9" },
    CHECKED_OUT: { label: "Đã trả phòng", color: "#22c55e" },
    CANCELLED: { label: "Đã hủy", color: "#ef4444" },
    REFUNDED: { label: "Hoàn tiền", color: "#a855f7" },
  };

const handleExport = (data: any, filename: string) => {
  toast.success("Đang chuẩn bị file báo cáo...");
  console.log("Export →", filename, data);
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenue, setRevenue] = useState<RevenueByMonth[]>([]);
  const [status, setStatus] = useState<BookingStatusSummary[]>([]);
  const [recent, setRecent] = useState<RecentBookingItem[]>([]);
  const [popular, setPopular] = useState<PopularRoomItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [statsRes, revenueRes, statusRes, recentRes, popularRes] =
        await Promise.all([
          getDashboardStats(),
          getDashboardRevenue(),
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

  if (!stats && loading) return <div className="p-6">Đang tải...</div>;

  const safeRevenue = revenue ?? [];
  const safeStatus = status ?? [];
  const safeRecent = recent ?? [];
  const safePopular = popular ?? [];

  const chartData = safeRevenue.map((m) => ({
    month: m.month,
    revenue: Number(m.revenue ?? 0),
    bookings: Number(m.bookings ?? 0),
  }));

  return (
    <div className="space-y-10 p-6">
      <header className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Tổng quan hoạt động hệ thống 4Stay.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() =>
              handleExport(
                { stats, revenue, status, recent, popular },
                "dashboard_report"
              )
            }
          >
            <Download className="w-4 h-4 mr-2" />
            Xuất báo cáo
          </Button>

          <Button onClick={load} disabled={loading}>
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Làm mới
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
        <Card className="xl:col-span-2 p-6 shadow-sm border border-border/60 bg-card/50 backdrop-blur-sm">
          <h2 className="text-xl font-semibold mb-1">
            Doanh thu & Lượt đặt theo tháng
          </h2>
          <p className="text-muted-foreground text-sm mb-4">
            Tổng quan doanh thu và số lượt đặt theo từng tháng.
          </p>

          <div className="h-[340px] px-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="month" />

                <YAxis
                  yAxisId="left"
                  tickFormatter={(v) => (v / 1000000).toFixed(1) + " tr"} // triệu
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickFormatter={(v) => v.toLocaleString()}
                />

                <RTooltip
                  formatter={(value: number, name: string) =>
                    name === "revenue"
                      ? [`${value.toLocaleString()} ₫`, "Doanh thu"]
                      : [`${value.toLocaleString()} lượt`, "Lượt đặt"]
                  }
                />

                <Legend />

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

        <Card className="p-6 shadow-sm border bg-card/50 backdrop-blur-sm">
          <h2 className="text-xl font-semibold mb-4">
            Tỷ lệ trạng thái booking
          </h2>

          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={safeStatus}
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
                {safeStatus.map((item) => (
                  <Cell
                    key={item.status}
                    fill={BOOKING_STATUS_COLORS[item.status].color}
                  />
                ))}
              </Pie>

              <RTooltip
                formatter={(value: number, name, entry: any) => {
                  const status = entry?.payload?.status;
                  return [
                    `${value} lượt`,
                    BOOKING_STATUS_COLORS[status]?.label || status,
                  ];
                }}
              />

              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </section>

      <section>
        <Card className="p-6 shadow-sm border bg-card/50 backdrop-blur-sm">
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
                </tr>
              </thead>
              <tbody>
                {safeRecent.map((b) => (
                  <tr key={b.id} className="border-b hover:bg-muted/40">
                    <td className="p-2">{b.id}</td>
                    <td className="p-2">{b.userName}</td>
                    <td className="p-2">{b.roomName}</td>
                    <td className="p-2 text-primary font-semibold">
                      {b.total.toLocaleString()}₫
                    </td>
                    <td className="p-2">
                      <span
                        className="px-2 py-1 rounded-full text-xs font-medium"
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      <section>
        <Card className="p-6 shadow-sm border bg-card/50 backdrop-blur-sm">
          <h2 className="text-xl font-semibold mb-4">Phòng phổ biến</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {safePopular.map((room, i) => (
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
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
