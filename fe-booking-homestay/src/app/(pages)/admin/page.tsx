"use client";

import { Button } from "@/_components/ui/button";
import {
  DashboardSummary,
  RevenueByMonth,
  getDashboardRevenue,
  getDashboardSummary,
} from "@/services/admin/dashboardApi";
import { AlertCircle, Download } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { RefreshButton } from "./_components/RefreshButton";

// Import subcomponents
import { DetailedTabbedWidget } from "./_components/dashboard/DetailedTabbedWidget";
import { GeographicalPerformance } from "./_components/dashboard/GeographicalPerformance";
import { KPIHighlights } from "./_components/dashboard/KPIHighlights";
import { RevenueTrendChart } from "./_components/dashboard/RevenueTrendChart";
import { StatusBreakdownPie } from "./_components/dashboard/StatusBreakdownPie";
import { TodayPulse } from "./_components/dashboard/TodayPulse";
import { UrgentActionCenter } from "./_components/dashboard/UrgentActionCenter";

const BOOKING_STATUS_COLORS: Record<string, { label: string; color: string }> =
  {
    PENDING: { label: "Chờ thanh toán", color: "#fb923c" },
    PARTIALLY_PAID: { label: "Thanh toán một phần", color: "#facc15" },
    CONFIRMED: { label: "Đã xác nhận", color: "#22c55e" },
    CHECKED_IN: { label: "Đã nhận phòng", color: "#06b6d4" },
    CHECKED_OUT: { label: "Đã trả phòng", color: "#0ea5e9" },
    CANCELLED: { label: "Đã hủy", color: "#ef4444" },
    CANCELLED_BY_ADMIN: { label: "Hủy bởi Admin", color: "#b91c1c" },
    WAITING_REFUND: { label: "Chờ hoàn tiền", color: "#8b5cf6" },
    REFUNDED: { label: "Đã hoàn tiền", color: "#6b7280" },
  };

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [revenue, setRevenue] = useState<RevenueByMonth[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);

  const loadData = async () => {
    setLoading(true);
    setError(false);
    try {
      const [sumRes, revRes] = await Promise.all([
        getDashboardSummary(),
        getDashboardRevenue(year),
      ]);
      setSummary(sumRes);
      setRevenue(revRes);
    } catch (err) {
      console.error("Dashboard Load Error:", err);
      setError(true);
      toast.error("Không thể tải thông tin tổng quan");
    } finally {
      setLoading(false);
    }
  };

  const loadRevenueOnly = async (selectedYear: number) => {
    try {
      const data = await getDashboardRevenue(selectedYear);
      setRevenue(data);
    } catch {
      toast.error("Không thể tải biểu đồ doanh thu theo năm");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!loading) {
      loadRevenueOnly(year);
    }
  }, [year]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-125 space-y-4">
        <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium animate-pulse">
          Đang thu thập và phân tích dữ liệu hệ thống...
        </p>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="flex flex-col items-center justify-center min-h-125 space-y-4 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 animate-bounce" />
        <h3 className="text-xl font-bold text-gray-800">
          Đã xảy ra lỗi khi tải dữ liệu
        </h3>
        <p className="text-gray-500 max-w-md">
          Vui lòng kiểm tra lại kết nối mạng hoặc liên hệ bộ phận hỗ trợ kỹ
          thuật.
        </p>
        <Button
          onClick={loadData}
          className="px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg shadow-lg"
        >
          Thử lại
        </Button>
      </div>
    );
  }

  const {
    overviewCards,
    todayOperations,
    pendingActions,
    bookingStatusBreakdown,
    provinceDistribution,
    topRooms,
    recentBookings,
    recentReviews,
  } = summary;

  const selectedYearRevenueTotal = revenue.reduce(
    (sum, m) => sum + Number(m.revenue ?? 0),
    0,
  );

  const handleExportReport = () => {
    toast.success("Đang chuẩn bị xuất báo cáo chi tiết...");
    const csvRows: string[] = [];
    csvRows.push("\uFEFF"); // UTF-8 BOM

    // Header
    csvRows.push(
      `"BÁO CÁO HOẠT ĐỘNG HỆ THỐNG HOMESTAY 4STAY - NGÀY ${new Date().toLocaleDateString("vi-VN")}"`,
    );
    csvRows.push("");

    // Section 1: KPI Cards
    csvRows.push(`"1. CHỈ SỐ HOẠT ĐỘNG CHÍNH (THÁNG NÀY)"`);
    csvRows.push(`"Chỉ số","Giá trị","Tăng trưởng MoM"`);
    csvRows.push(
      `"Doanh thu thực tế","${overviewCards.totalRevenue.toLocaleString()} ₫","${overviewCards.revenueChangePercent.toFixed(1)}%"`,
    );
    csvRows.push(
      `"Số đơn đặt phòng","${overviewCards.totalBookings} đơn","${overviewCards.bookingsChangePercent.toFixed(1)}%"`,
    );
    csvRows.push(
      `"Tỷ lệ lấp đầy phòng","${overviewCards.occupancyRate.toFixed(1)}%","${overviewCards.occupancyRateChangePercent.toFixed(1)}% (chênh lệch)"`,
    );
    csvRows.push(
      `"Đánh giá trung bình","${overviewCards.averageRating.toFixed(1)} sao (${overviewCards.totalReviews} đánh giá)","-"`,
    );
    csvRows.push("");

    // Section 2: Operations Today
    csvRows.push(`"2. TÌNH HÌNH VẬN HÀNH HÔM NAY"`);
    csvRows.push(`"Hoạt động","Số lượng"`);
    csvRows.push(
      `"Số lượt Check-in hôm nay","${todayOperations.checkInsToday} lượt"`,
    );
    csvRows.push(
      `"Số lượt Check-out hôm nay","${todayOperations.checkOutsToday} lượt"`,
    );
    csvRows.push(
      `"Số khách đang ở tại homestay","${todayOperations.currentlyStaying} khách"`,
    );
    csvRows.push(
      `"Số đơn mới tạo hôm nay","${todayOperations.newBookingsToday} đơn"`,
    );
    csvRows.push("");

    // Section 3: Revenue Year Breakdown
    csvRows.push(`"3. DOANH THU THEO THÁNG (NĂM ${year})"`);
    csvRows.push(`"Tháng","Số lượt đặt","Doanh thu (₫)","% Đóng góp"`);
    revenue.forEach((m) => {
      const percent =
        selectedYearRevenueTotal > 0
          ? ((Number(m.revenue) / selectedYearRevenueTotal) * 100).toFixed(1) +
            "%"
          : "0%";
      csvRows.push(
        `"${m.month}","${m.bookings} đơn","${Number(m.revenue)}","${percent}"`,
      );
    });
    csvRows.push("");

    // Section 4: Geographical
    csvRows.push(`"4. DOANH THU THEO TỈNH THÀNH (TOP ĐIỂM ĐẾN)"`);
    csvRows.push(`"Tỉnh thành","Số lượt đặt","Doanh thu (₫)"`);
    provinceDistribution.forEach((p) => {
      csvRows.push(`"${p.provinceName}","${p.bookings} lượt","${p.revenue}"`);
    });
    csvRows.push("");

    // Section 5: Top Homestays
    csvRows.push(`"5. TOP HOMESTAY DOANH THU CAO NHẤT"`);
    csvRows.push(`"Homestay","Số lượt đặt","Doanh thu (₫)","Đánh giá sao"`);
    topRooms.forEach((r) => {
      csvRows.push(
        `"${r.roomName}","${r.bookings} lượt","${r.revenue}","${r.rating.toFixed(1)} sao"`,
      );
    });

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute(
      "download",
      `bao_cao_4stay_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    link.click();
    toast.success("Báo cáo đã được tải xuống!");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER SECTION */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-linear-to-r from-slate-900 to-sky-700 bg-clip-text text-transparent">
            Trang tổng quan
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Hệ thống quản lý Homestay PMS & Báo cáo hiệu năng vận hành 4Stay.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <RefreshButton
            onRefresh={loadData}
            className="border-gray-200 shadow-sm"
          />
          <Button
            onClick={handleExportReport}
            className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            <Download className="w-4 h-4" />
            Xuất báo cáo chi tiết
          </Button>
        </div>
      </header>

      {/* TODAY OPERATION PULSE */}
      <TodayPulse
        checkInsToday={todayOperations.checkInsToday}
        checkOutsToday={todayOperations.checkOutsToday}
        currentlyStaying={todayOperations.currentlyStaying}
        newBookingsToday={todayOperations.newBookingsToday}
      />

      {/* CORE KPI SECTION */}
      <KPIHighlights
        totalRevenue={overviewCards.totalRevenue}
        revenueChangePercent={overviewCards.revenueChangePercent}
        totalBookings={overviewCards.totalBookings}
        bookingsChangePercent={overviewCards.bookingsChangePercent}
        occupancyRate={overviewCards.occupancyRate}
        occupancyRateChangePercent={overviewCards.occupancyRateChangePercent}
        averageRating={overviewCards.averageRating}
        totalReviews={overviewCards.totalReviews}
      />

      {/* URGENT ACTIONS & PIE CHART */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <UrgentActionCenter
            pendingConfirmationCount={pendingActions.pendingConfirmationCount}
            waitingRefundCount={pendingActions.waitingRefundCount}
            partiallyPaidCount={pendingActions.partiallyPaidCount}
          />
        </div>
        <div>
          <StatusBreakdownPie
            bookingStatusBreakdown={bookingStatusBreakdown}
            statusColors={BOOKING_STATUS_COLORS}
          />
        </div>
      </div>

      {/* DUAL ANALYTICS CHARTS SECTION */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <RevenueTrendChart
            revenue={revenue}
            year={year}
            onYearChange={setYear}
            currentYear={currentYear}
          />
        </div>
        <div>
          <GeographicalPerformance
            provinceDistribution={provinceDistribution}
          />
        </div>
      </div>

      {/* DETAILED TABBED WIDGET SECTION */}
      <DetailedTabbedWidget
        recentBookings={recentBookings}
        recentReviews={recentReviews}
        topRooms={topRooms}
        statusColors={BOOKING_STATUS_COLORS}
      />
    </div>
  );
}
