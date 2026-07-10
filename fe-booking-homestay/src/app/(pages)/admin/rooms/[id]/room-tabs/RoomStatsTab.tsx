"use client";

import { Card } from "@/_components/ui/card";
import { Booking } from "@/types/booking";
import {
  CalendarCheck,
  Coins,
  Download,
  Filter,
  Moon,
  PercentCircle,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Props {
  bookings: Booking[];
}

const CANCELLED_STATUSES = [
  "CANCELLED",
  "CANCELLED_BY_ADMIN",
  "WAITING_REFUND",
  "REFUNDED",
];

export default function RoomStatsTab({ bookings }: Props) {
  // Extract unique years from bookings to build year list
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    // Default current year in case bookings list is empty
    years.add(new Date().getFullYear());
    bookings.forEach((b) => {
      if (b.checkIn) {
        const y = new Date(b.checkIn).getFullYear();
        if (!isNaN(y)) {
          years.add(y);
        }
      }
    });
    return Array.from(years).sort((a, b) => b - a); // descending order
  }, [bookings]);

  // Filters State
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  // Table sorting & filtering State
  const [hideEmptyRows, setHideEmptyRows] = useState(true);
  const [sortBy, setSortBy] = useState<"time" | "bookings" | "revenue">("time");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // 1. Filter bookings list based on selected Month & Year
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (!b.checkIn) return false;
      const date = new Date(b.checkIn);
      const y = date.getFullYear();
      const m = date.getMonth() + 1; // 1-indexed

      const matchesYear = selectedYear === "all" || String(y) === selectedYear;
      const matchesMonth =
        selectedMonth === "all" || String(m) === selectedMonth;

      return matchesYear && matchesMonth;
    });
  }, [bookings, selectedYear, selectedMonth]);

  // 2. Calculate Stats from Filtered Bookings list
  const stats = useMemo(() => {
    const total = filteredBookings.length;
    if (total === 0) {
      return {
        totalBookings: 0,
        totalRevenue: 0,
        avgBookingValue: 0,
        cancellationRate: 0,
        totalNights: 0,
        avgNights: 0,
        avgGuests: 0,
        avgRevenuePerNight: 0,
        statusCounts: {} as Record<string, { count: number; revenue: number }>,
      };
    }

    const cancelled = filteredBookings.filter((b) =>
      CANCELLED_STATUSES.includes(b.status),
    );
    const activeBookings = filteredBookings.filter(
      (b) => !CANCELLED_STATUSES.includes(b.status),
    );

    const totalRevenue = activeBookings.reduce(
      (sum, b) => sum + (b.totalAmount ?? 0),
      0,
    );

    const cancellationRate = Math.round((cancelled.length / total) * 100);
    const avgBookingValue = activeBookings.length
      ? Math.round(totalRevenue / activeBookings.length)
      : 0;

    let totalNights = 0;
    let totalGuests = 0;

    activeBookings.forEach((b) => {
      const ci = new Date(b.checkIn);
      const co = new Date(b.checkOut);
      const nights = Math.max(
        1,
        Math.round((co.getTime() - ci.getTime()) / 86400000),
      );
      totalNights += nights;
      totalGuests += (b.adults ?? 0) + (b.children ?? 0);
    });

    const avgNights = activeBookings.length
      ? Math.round((totalNights / activeBookings.length) * 10) / 10
      : 0;
    const avgGuests = activeBookings.length
      ? Math.round((totalGuests / activeBookings.length) * 10) / 10
      : 0;
    const avgRevenuePerNight = totalNights
      ? Math.round(totalRevenue / totalNights)
      : 0;

    // Status breakdown
    const statusCounts: Record<string, { count: number; revenue: number }> = {};
    filteredBookings.forEach((b) => {
      if (!statusCounts[b.status]) {
        statusCounts[b.status] = { count: 0, revenue: 0 };
      }
      statusCounts[b.status].count += 1;
      if (!CANCELLED_STATUSES.includes(b.status)) {
        statusCounts[b.status].revenue += b.totalAmount ?? 0;
      }
    });

    return {
      totalBookings: total,
      totalRevenue,
      avgBookingValue,
      cancellationRate,
      totalNights,
      avgNights,
      avgGuests,
      avgRevenuePerNight,
      statusCounts,
    };
  }, [filteredBookings]);

  // 3. Generate Chart Data based on current filter states
  const chartData = useMemo(() => {
    // A. If All Years selected -> Group by Year
    if (selectedYear === "all") {
      const yearlyMap: Record<string, { revenue: number; bookings: number }> =
        {};
      availableYears.forEach((y) => {
        yearlyMap[String(y)] = { revenue: 0, bookings: 0 };
      });

      bookings.forEach((b) => {
        if (CANCELLED_STATUSES.includes(b.status) || !b.checkIn) return;
        const y = String(new Date(b.checkIn).getFullYear());
        if (yearlyMap[y]) {
          yearlyMap[y].revenue += b.totalAmount ?? 0;
          yearlyMap[y].bookings += 1;
        }
      });

      return Object.entries(yearlyMap)
        .map(([name, val]) => ({
          label: `Năm ${name}`,
          revenue: val.revenue,
          bookings: val.bookings,
        }))
        .reverse(); // ascending order of years
    }

    // B. If a specific Year is selected but All Months -> Group by Month of that year
    if (selectedMonth === "all") {
      const monthlyMap = Array.from({ length: 12 }, (_, i) => ({
        label: `Tháng ${i + 1}`,
        revenue: 0,
        bookings: 0,
      }));

      bookings.forEach((b) => {
        if (CANCELLED_STATUSES.includes(b.status) || !b.checkIn) return;
        const date = new Date(b.checkIn);
        const y = date.getFullYear();
        if (String(y) === selectedYear) {
          const m = date.getMonth(); // 0-11
          monthlyMap[m].revenue += b.totalAmount ?? 0;
          monthlyMap[m].bookings += 1;
        }
      });

      return monthlyMap;
    }

    // C. If specific Year AND specific Month selected -> Group by Date in that Month
    const year = Number(selectedYear);
    const month = Number(selectedMonth);
    const numDays = new Date(year, month, 0).getDate(); // Get last day of month

    const dailyMap = Array.from({ length: numDays }, (_, i) => ({
      label: String(i + 1),
      revenue: 0,
      bookings: 0,
    }));

    bookings.forEach((b) => {
      if (CANCELLED_STATUSES.includes(b.status) || !b.checkIn) return;
      const date = new Date(b.checkIn);
      if (date.getFullYear() === year && date.getMonth() + 1 === month) {
        const d = date.getDate(); // 1-31
        if (d >= 1 && d <= numDays) {
          dailyMap[d - 1].revenue += b.totalAmount ?? 0;
          dailyMap[d - 1].bookings += 1;
        }
      }
    });

    return dailyMap;
  }, [bookings, selectedYear, selectedMonth, availableYears]);

  // 4. Detailed table data calculation
  const tableData = useMemo(() => {
    let data = chartData.map((d, index) => {
      const revenuePercent =
        stats.totalRevenue > 0 ? (d.revenue / stats.totalRevenue) * 100 : 0;
      const bookingsPercent =
        stats.totalBookings > 0 ? (d.bookings / stats.totalBookings) * 100 : 0;

      let displayLabel = d.label;
      if (selectedYear !== "all") {
        if (selectedMonth === "all") {
          displayLabel = `${d.label}/${selectedYear}`;
        } else {
          displayLabel = `Ngày ${d.label.padStart(2, "0")}/${selectedMonth.padStart(2, "0")}/${selectedYear}`;
        }
      }

      return {
        ...d,
        index,
        displayLabel,
        revenuePercent,
        bookingsPercent,
      };
    });

    if (hideEmptyRows) {
      data = data.filter((d) => d.bookings > 0 || d.revenue > 0);
    }

    data.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "revenue") {
        comparison = a.revenue - b.revenue;
      } else if (sortBy === "bookings") {
        comparison = a.bookings - b.bookings;
      } else {
        comparison = a.index - b.index;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return data;
  }, [
    chartData,
    hideEmptyRows,
    sortBy,
    sortOrder,
    selectedYear,
    selectedMonth,
    stats.totalRevenue,
    stats.totalBookings,
  ]);

  const handleSort = (field: "time" | "bookings" | "revenue") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const renderSortIcon = (field: "time" | "bookings" | "revenue") => {
    if (sortBy !== field)
      return (
        <span className="text-slate-400 dark:text-slate-500 ml-1 text-xs">
          ↕
        </span>
      );
    return sortOrder === "asc" ? (
      <span className="text-primary font-bold ml-1 text-xs">↑</span>
    ) : (
      <span className="text-primary font-bold ml-1 text-xs">↓</span>
    );
  };

  const handleExport = () => {
    toast.success("Đang chuẩn bị file báo cáo phòng...");

    const csvRows: string[] = [];

    // Add BOM for Vietnamese Excel support
    csvRows.push("\uFEFF");

    // Title Section
    const timeframeText =
      selectedYear === "all"
        ? "Tất cả các năm"
        : selectedMonth === "all"
          ? `Năm ${selectedYear}`
          : `Tháng ${selectedMonth}/${selectedYear}`;

    csvRows.push(
      `"BÁO CÁO THỐNG KÊ PHÒNG - KHOẢNG THỜI GIAN: ${timeframeText.toUpperCase()}"`,
    );
    csvRows.push("");

    // Section 1: Summary Statistics
    csvRows.push(`"TỔNG QUAN HIỆU SUẤT TRONG KỲ"`);
    csvRows.push(`"Chỉ số","Giá trị"`);
    csvRows.push(`"Tổng doanh thu","${stats.totalRevenue.toLocaleString()}đ"`);
    csvRows.push(`"Tổng lượt đặt","${stats.totalBookings} đơn"`);
    csvRows.push(
      `"Giá trị đơn trung bình","${stats.avgBookingValue.toLocaleString()}đ"`,
    );
    csvRows.push(`"Tỷ lệ huỷ đơn","${stats.cancellationRate}%"`);
    csvRows.push(`"Tổng số đêm được thuê","${stats.totalNights} đêm"`);
    csvRows.push(`"Số đêm thuê trung bình/đơn","${stats.avgNights} đêm/đơn"`);
    csvRows.push(`"Số khách trung bình/đơn","${stats.avgGuests} khách"`);
    csvRows.push(
      `"Doanh thu trung bình/đêm","${stats.avgRevenuePerNight.toLocaleString()}đ"`,
    );
    csvRows.push("");

    // Section 2: Detailed Breakdown (matching the table exactly: filters, sorting, and hidden empty rows applied)
    csvRows.push(`"BẢNG SỐ LIỆU DOANH THU & LƯỢT ĐẶT CHI TIẾT"`);
    csvRows.push(
      `"Thời gian","Số lượt đặt","Tỷ lệ lượt đặt %","Doanh thu (đ)","Tỷ lệ doanh thu %"`,
    );
    tableData.forEach((d) => {
      csvRows.push(
        `"${d.displayLabel}","${d.bookings} lượt","${d.bookingsPercent.toFixed(1)}%","${d.revenue}","${d.revenuePercent.toFixed(1)}%"`,
      );
    });
    csvRows.push("");

    // Section 3: Status Breakdown
    csvRows.push(`"THỐNG KÊ THEO TRẠNG THÁI ĐƠN"`);
    csvRows.push(`"Trạng thái","Số lượng","Doanh thu phụ (đ)"`);
    Object.entries(stats.statusCounts).forEach(([status, item]) => {
      const label = statusLabel(status);
      const rev = status === "CANCELLED" ? 0 : item.revenue;
      csvRows.push(`"${label}","${item.count} đơn","${rev}"`);
    });

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);

    // Create clean download filename
    const safeFilename = `bao_cao_phong_detail_${selectedYear}_${selectedMonth}`;
    link.setAttribute("download", `${safeFilename}.csv`);
    link.click();
  };

  const statusLabel = (status: string) =>
    ({
      CONFIRMED: "Đã xác nhận",
      PENDING: "Chờ thanh toán",
      CHECKED_IN: "Đang lưu trú",
      CHECKED_OUT: "Đã trả phòng",
      CANCELLED: "Đã hủy",
    })[status] || status;

  const statusColor = (status: string) =>
    ({
      CONFIRMED:
        "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400",
      PENDING:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400",
      CHECKED_IN:
        "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
      CHECKED_OUT:
        "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
      CANCELLED: "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400",
    })[status] || "bg-gray-100 text-gray-700";

  return (
    <div className="space-y-6">
      {/* Dynamic Filters Bar */}
      <Card className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-card shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4.5 h-4.5 text-primary" />
            <h4 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Khoảng thời gian thống kê
            </h4>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* Year Selector */}
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                // Reset month to all if switching to "all years"
                if (e.target.value === "all") {
                  setSelectedMonth("all");
                }
              }}
              className="h-9.5 px-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent text-xs sm:text-sm font-semibold cursor-pointer outline-none focus:border-primary/50 text-slate-700 dark:text-slate-300 flex-1 sm:flex-initial"
            >
              <option value="all">Tất cả các năm</option>
              {availableYears.map((y) => (
                <option key={y} value={String(y)}>
                  Năm {y}
                </option>
              ))}
            </select>

            {/* Month Selector */}
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              disabled={selectedYear === "all"}
              className="h-9.5 px-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent text-xs sm:text-sm font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed outline-none focus:border-primary/50 text-slate-700 dark:text-slate-300 flex-1 sm:flex-initial"
            >
              <option value="all">Cả năm</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={String(i + 1)}>
                  Tháng {i + 1}
                </option>
              ))}
            </select>

            {/* Export Report Button */}
            <button
              onClick={handleExport}
              className="h-9.5 px-4 bg-emerald-600 dark:bg-emerald-700 hover:bg-emerald-700 dark:hover:bg-emerald-600 text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm flex-1 sm:flex-initial w-full sm:w-auto"
            >
              <Download className="w-4 h-4" />
              <span>Xuất báo cáo</span>
            </button>
          </div>
        </div>
      </Card>

      {/* Overview Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center gap-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 bg-card shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
              Tổng doanh thu
            </p>
            <h3 className="text-xl font-bold mt-1 text-slate-900 dark:text-white">
              {stats.totalRevenue.toLocaleString()}₫
            </h3>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 bg-card shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
              Tổng lượt đặt
            </p>
            <h3 className="text-xl font-bold mt-1 text-slate-900 dark:text-white">
              {stats.totalBookings} đơn
            </h3>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 bg-card shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
              Giá trị đơn TB
            </p>
            <h3 className="text-xl font-bold mt-1 text-slate-900 dark:text-white">
              {stats.avgBookingValue.toLocaleString()}₫
            </h3>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 bg-card shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
              Tỷ lệ huỷ đơn
            </p>
            <h3 className="text-xl font-bold mt-1 text-slate-900 dark:text-white">
              {stats.cancellationRate}%
            </h3>
          </div>
        </Card>
      </div>

      {/* Dynamic Graph Section */}
      <Card className="p-4 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
            Biểu đồ xu hướng doanh thu & lượt đặt phòng
          </h4>
          <span className="text-xs text-muted-foreground">
            {selectedYear === "all"
              ? "Gộp theo từng năm"
              : selectedMonth === "all"
                ? `Theo các tháng trong năm ${selectedYear}`
                : `Theo các ngày trong Tháng ${selectedMonth}/${selectedYear}`}
          </span>
        </div>

        <div className="h-80 w-full pt-4">
          {chartData.length > 0 &&
          chartData.some((d) => d.revenue > 0 || d.bookings > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                  strokeOpacity={0.4}
                />
                <XAxis dataKey="label" fontSize={11} stroke="#94a3b8" />
                <YAxis
                  yAxisId="left"
                  tickFormatter={(v) => (v / 1_000_000).toFixed(1) + " tr"}
                  fontSize={11}
                  stroke="#94a3b8"
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickFormatter={(v) => v.toLocaleString()}
                  fontSize={11}
                  stroke="#94a3b8"
                />
                <Tooltip
                  formatter={(value: any, name: any) => {
                    if (name === "revenue") {
                      return [value.toLocaleString() + "₫", "Doanh thu"];
                    }
                    return [value + " đơn", "Lượt đặt"];
                  }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                  }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="revenue"
                  name="revenue"
                  fill="#0ea5e9"
                  radius={[4, 4, 0, 0]}
                  barSize={selectedMonth !== "all" ? 10 : 20}
                />
                <Bar
                  yAxisId="right"
                  dataKey="bookings"
                  name="bookings"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  barSize={selectedMonth !== "all" ? 10 : 20}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm bg-slate-50/50 dark:bg-slate-900/20 rounded-lg">
              Không có dữ liệu doanh thu trong khoảng thời gian này.
            </div>
          )}
        </div>
      </Card>

      {/* Detailed stats table */}
      <Card className="p-4 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
              Bảng số liệu doanh thu & lượt đặt chi tiết
            </h4>
            <p className="text-xs text-muted-foreground">
              {selectedYear === "all"
                ? "Thống kê theo từng năm"
                : selectedMonth === "all"
                  ? `Thống kê theo các tháng trong năm ${selectedYear}`
                  : `Thống kê theo các ngày trong Tháng ${selectedMonth}/${selectedYear}`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              Hiển thị {tableData.length}/{chartData.length} dòng
            </span>
            <label className="flex items-center gap-2 text-xs text-slate-650 dark:text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hideEmptyRows}
                onChange={(e) => setHideEmptyRows(e.target.checked)}
                className="rounded border-slate-200 dark:border-slate-700 text-primary focus:ring-primary h-3.5 w-3.5"
              />
              Ẩn dòng không có số liệu
            </label>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-semibold">
                <th
                  onClick={() => handleSort("time")}
                  className="py-2 text-left cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 select-none"
                >
                  Thời gian {renderSortIcon("time")}
                </th>
                <th
                  onClick={() => handleSort("bookings")}
                  className="py-2 text-center cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 select-none"
                >
                  Lượt đặt phòng {renderSortIcon("bookings")}
                </th>
                <th
                  onClick={() => handleSort("revenue")}
                  className="py-2 text-right cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 select-none"
                >
                  Doanh thu {renderSortIcon("revenue")}
                </th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((d) => (
                <tr
                  key={d.displayLabel}
                  className="border-b border-slate-50 dark:border-slate-900/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors"
                >
                  <td className="py-3 font-medium text-slate-700 dark:text-slate-300">
                    {d.displayLabel}
                  </td>
                  <td className="py-3 text-center">
                    <div className="inline-flex flex-col items-center">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {d.bookings} lượt
                      </span>
                      {d.bookings > 0 && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                          ({d.bookingsPercent.toFixed(1)}%)
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <div className="inline-flex flex-col items-end">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {d.revenue.toLocaleString()}₫
                      </span>
                      {d.revenue > 0 && (
                        <span className="text-[10px] text-sky-600 dark:text-sky-400 font-medium">
                          ({d.revenuePercent.toFixed(1)}%)
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {tableData.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="py-8 text-center text-muted-foreground"
                  >
                    Không có dữ liệu doanh thu hoặc lượt đặt trong khoảng thời
                    gian này.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Details breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Status Breakdown Table */}
        <Card className="lg:col-span-3 p-4 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-card space-y-4">
          <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
            Thống kê theo trạng thái đơn
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400">
                  <th className="py-2 text-left font-semibold">Trạng thái</th>
                  <th className="py-2 text-center font-semibold">Số lượng</th>
                  <th className="py-2 text-right font-semibold">
                    Doanh thu phụ
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(stats.statusCounts).map(([status, item]) => (
                  <tr
                    key={status}
                    className="border-b border-slate-50 dark:border-slate-900/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/50"
                  >
                    <td className="py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColor(
                          status,
                        )}`}
                      >
                        {statusLabel(status)}
                      </span>
                    </td>
                    <td className="py-3 text-center font-medium text-slate-700 dark:text-slate-300">
                      {item.count} đơn
                    </td>
                    <td className="py-3 text-right font-bold text-slate-900 dark:text-white">
                      {status === "CANCELLED"
                        ? "–"
                        : `${item.revenue.toLocaleString()}₫`}
                    </td>
                  </tr>
                ))}
                {Object.keys(stats.statusCounts).length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="py-6 text-center text-muted-foreground"
                    >
                      Chưa có dữ liệu đặt phòng trong thời gian đã chọn.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Rental Performance details */}
        <Card className="lg:col-span-2 p-4 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-card space-y-4">
          <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
            Hiệu suất thuê phòng
          </h4>
          <div className="space-y-4 pt-2">
            <div className="flex justify-between items-center pb-3 border-b border-slate-50 dark:border-slate-900/50">
              <div className="flex items-center gap-2 text-slate-650 dark:text-slate-400">
                <Moon className="w-4 h-4 text-primary" />
                <span className="text-xs sm:text-sm font-medium">
                  Tổng số đêm được thuê
                </span>
              </div>
              <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                {stats.totalNights} đêm
              </span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-slate-50 dark:border-slate-900/50">
              <div className="flex items-center gap-2 text-slate-650 dark:text-slate-400">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-xs sm:text-sm font-medium">
                  Số đêm thuê trung bình/đơn
                </span>
              </div>
              <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                {stats.avgNights} đêm/đơn
              </span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-slate-50 dark:border-slate-900/50">
              <div className="flex items-center gap-2 text-slate-650 dark:text-slate-400">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-xs sm:text-sm font-medium">
                  Số khách trung bình/đơn
                </span>
              </div>
              <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                {stats.avgGuests} khách
              </span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-slate-650 dark:text-slate-400">
                <PercentCircle className="w-4 h-4 text-primary" />
                <span className="text-xs sm:text-sm font-medium">
                  Doanh thu trung bình/đêm
                </span>
              </div>
              <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                {stats.avgRevenuePerNight.toLocaleString()}₫
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
