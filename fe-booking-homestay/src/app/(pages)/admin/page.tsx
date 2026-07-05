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
      <div className="space-y-6 pb-12 animate-pulse">
        {/* HEADER SKELETON */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-slate-200 rounded-xl" />
            <div className="h-4 w-72 bg-slate-150/80 rounded-md" />
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <div className="h-9.5 w-10 bg-slate-200 rounded-xl shrink-0" />
            <div className="h-9.5 w-44 bg-slate-200 rounded-xl shrink-0" />
          </div>
        </header>

        {/* TODAY PULSE SKELETON */}
        <div className="bg-linear-to-r from-sky-500/10 via-indigo-500/5 to-transparent p-4 sm:p-5 rounded-2xl border border-sky-100 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-slate-200 rounded-full" />
            <div className="h-5 w-48 bg-slate-200 rounded-md" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white/50 border border-slate-100 p-3 sm:p-4 rounded-xl space-y-2.5 sm:space-y-3"
              >
                <div className="h-3 w-24 bg-slate-150 rounded-md" />
                <div className="h-6 w-12 bg-slate-200 rounded-md" />
                <div className="h-2.5 w-20 bg-slate-100 rounded-md" />
              </div>
            ))}
          </div>
        </div>

        {/* KPI HIGHLIGHTS SKELETON */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white border border-slate-100 p-5 sm:p-6 rounded-2xl space-y-3.5 sm:space-y-4 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="h-3 w-24 bg-slate-150 rounded-md" />
                  <div className="h-7 w-32 bg-slate-200 rounded-md" />
                </div>
                <div className="w-10 h-10 bg-slate-100 rounded-xl shrink-0" />
              </div>
              <div className="h-3.5 w-40 bg-slate-100 rounded-md pt-3 border-t border-slate-50" />
            </div>
          ))}
        </div>

        {/* URGENT ACTIONS & PIE CHART SKELETON */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-white border border-slate-100 p-5 sm:p-6 rounded-2xl space-y-4">
            <div className="h-6 w-44 bg-slate-200 rounded-md" />
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-14 sm:h-16 bg-slate-50 rounded-xl" />
              ))}
            </div>
          </div>
          <div className="bg-white border border-slate-100 p-5 sm:p-6 rounded-2xl flex flex-col justify-between items-center min-h-62.5 space-y-4">
            <div className="h-6 w-36 bg-slate-200 rounded-md align-self-start self-start" />
            <div className="h-32 w-32 sm:h-36 sm:w-36 rounded-full border-12 sm:border-14 border-slate-100" />
            <div className="h-4 w-40 bg-slate-100 rounded-md" />
          </div>
        </div>

        {/* CHARTS TREND & GEO SKELETON */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-white border border-slate-100 p-5 sm:p-6 rounded-2xl space-y-4">
            <div className="h-6 w-48 bg-slate-200 rounded-md" />
            <div className="h-56 sm:h-60 bg-slate-50/50 rounded-xl" />
          </div>
          <div className="bg-white border border-slate-100 p-5 sm:p-6 rounded-2xl space-y-4">
            <div className="h-6 w-36 bg-slate-200 rounded-md" />
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-10 sm:h-11 bg-slate-50/50 rounded-xl"
                />
              ))}
            </div>
          </div>
        </div>
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
    <div className="space-y-4 sm:space-y-6 pb-12">
      {/* HEADER SECTION */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-linear-to-r from-slate-900 to-sky-700 bg-clip-text text-transparent">
            Trang tổng quan
          </h1>
          <p className="text-muted-foreground mt-0.5 text-xs sm:text-sm">
            Hệ thống quản lý Homestay PMS & Báo cáo hiệu năng vận hành 4Stay.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end sm:justify-start">
          <RefreshButton
            onRefresh={loadData}
            className="border-gray-200 shadow-sm shrink-0"
          />
          <Button
            onClick={handleExportReport}
            className="flex items-center justify-center gap-1.5 sm:gap-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all text-xs sm:text-sm px-3 py-2 shrink-0"
          >
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Xuất báo cáo
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
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
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
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
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
