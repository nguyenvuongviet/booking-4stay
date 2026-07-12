"use client";

import { Button } from "@/_components/ui/button";
import { Card } from "@/_components/ui/card";
import { formatDate } from "@/lib/utils/date";
import api from "@/services/api";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Baby,
  Download,
  Filter,
  Search,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { DateRangePicker } from "../_components/DateRangePicker";
import { Pagination } from "../_components/Pagination";
import { RefreshButton } from "../_components/RefreshButton";
import {
  BOOKING_STATUS_MAP,
  getStatusColorClasses,
  translateStatus,
} from "../_utils/bookingStatus";
import { AdminBookingUpdateDialog } from "./_components/AdminBookingUpdateDialog";
import { BookingActionButtons } from "./_components/BookingActionButtons";
import { RefundDialog } from "./_components/RefundDialog";
import { SmartCancelDialog } from "./_components/SmartCancelDialog";
import { useBookingList } from "./_hooks/useBookingList";

export default function BookingListPage() {
  const router = useRouter();
  const {
    initialLoading,
    raw,
    paged,
    page,
    pageCount,
    setPage,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    dateRange,
    setDateRange,
    sortBy,
    sortOrder,
    toggleSort,
    processed,
    getNights,
    refresh,
  } = useBookingList();

  const [editingBooking, setEditingBooking] = useState<any>(null);
  const [cancelBookingId, setCancelBookingId] = useState<number | null>(null);
  const [refundBooking, setRefundBooking] = useState<any>(null);

  const [progress, setProgress] = useState(0);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

  useEffect(() => {
    if (!autoRefreshEnabled) {
      setProgress(0);
      return;
    }

    const duration = 15000; // 15 seconds
    const intervalTime = 100; // update progress every 100ms
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          refresh();
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [autoRefreshEnabled, refresh]);

  if (initialLoading || !raw) {
    return (
      <div className="space-y-4 sm:space-y-6 pb-10 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="space-y-2">
            <div className="h-7 w-48 bg-slate-200 dark:bg-slate-850 rounded-xl" />
            <div className="h-4 w-64 bg-slate-150 dark:bg-slate-850/60 rounded-lg" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-9.5 w-10 bg-slate-200 dark:bg-slate-850 rounded-xl" />
            <div className="h-9.5 w-32 bg-slate-200 dark:bg-slate-850 rounded-xl" />
          </div>
        </div>

        {/* Filter Card Skeleton */}
        <div className="p-3 sm:p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 space-y-3">
          <div className="h-9.5 w-full bg-slate-100 dark:bg-slate-850 rounded-xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:items-center gap-2 sm:gap-3">
            <div className="h-9.5 w-full lg:w-40 bg-slate-100 dark:bg-slate-850 rounded-xl" />
            <div className="h-9.5 w-full lg:w-60 bg-slate-100 dark:bg-slate-850 rounded-xl" />
          </div>
        </div>

        {/* Content Card Skeleton */}
        <div className="p-3 sm:p-4 lg:p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 space-y-4">
          {/* Desktop Table Header Skeleton */}
          <div className="hidden lg:block space-y-3">
            <div className="grid grid-cols-9 gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              {[...Array(9)].map((_, i) => (
                <div
                  key={i}
                  className="h-4 bg-slate-200 dark:bg-slate-850 rounded-md"
                />
              ))}
            </div>
            {/* Table Rows Skeleton */}
            {[...Array(5)].map((_, idx) => (
              <div
                key={idx}
                className="grid grid-cols-9 gap-4 py-4 border-b border-slate-100/50 dark:border-slate-800/40"
              >
                <div className="space-y-1.5 col-span-1">
                  <div className="h-4 w-24 bg-slate-100 dark:bg-slate-850 rounded-md" />
                  <div className="h-3 w-16 bg-slate-100/70 dark:bg-slate-850/50 rounded-md" />
                </div>
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="h-4 bg-slate-100 dark:bg-slate-850 rounded-md self-center"
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Mobile/Tablet Card Skeleton */}
          <div className="lg:hidden space-y-3">
            {[...Array(3)].map((_, idx) => (
              <div
                key={idx}
                className="p-4 bg-card rounded-xl border border-slate-200/60 dark:border-slate-800/60 space-y-4"
              >
                <div className="flex justify-between items-center pb-2 border-b border-dashed border-slate-100 dark:border-slate-800/60">
                  <div className="space-y-1">
                    <div className="h-4 w-32 bg-slate-200 dark:bg-slate-850 rounded-md" />
                    <div className="h-3 w-40 bg-slate-150 dark:bg-slate-850/50 rounded-md" />
                  </div>
                  <div className="h-5 w-20 bg-slate-200 dark:bg-slate-850 rounded-full" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-16 bg-slate-150 dark:bg-slate-850/40 rounded-md" />
                  <div className="h-4 w-48 bg-slate-200 dark:bg-slate-850 rounded-md" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="h-3 w-12 bg-slate-150 dark:bg-slate-850/40 rounded-md" />
                    <div className="h-4 w-36 bg-slate-200 dark:bg-slate-850 rounded-md" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-12 bg-slate-150 dark:bg-slate-850/40 rounded-md" />
                    <div className="h-4 w-16 bg-slate-200 dark:bg-slate-850 rounded-md" />
                  </div>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800/60 mt-1">
                  <div className="h-4 w-28 bg-slate-200 dark:bg-slate-850 rounded-md" />
                  <div className="h-7 w-20 bg-slate-200 dark:bg-slate-850 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const exportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Bookings");

    worksheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Khách hàng", key: "guest", width: 25 },
      { header: "Email", key: "email", width: 30 },
      { header: "Phòng", key: "room", width: 25 },
      { header: "Ngày nhận", key: "checkIn", width: 15 },
      { header: "Ngày trả", key: "checkOut", width: 15 },
      { header: "Số đêm", key: "nights", width: 10 },
      { header: "Người lớn", key: "adults", width: 10 },
      { header: "Trẻ em", key: "children", width: 10 },
      { header: "Tổng tiền", key: "amount", width: 15 },
      { header: "Trạng thái", key: "status", width: 15 },
    ];

    processed.forEach((b) => {
      worksheet.addRow({
        id: b.id,
        guest: b.guestInfo.fullName,
        email: b.guestInfo.email,
        room: b.room?.name,
        checkIn: formatDate(b.checkIn),
        checkOut: formatDate(b.checkOut),
        nights: getNights(b.checkIn, b.checkOut),
        adults: b.adults,
        children: b.children,
        amount: b.totalAmount,
        status: b.status,
      });
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = {
      vertical: "middle",
      horizontal: "center",
    };

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(
      new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      "bookings.xlsx",
    );
  };

  const SortIcon = ({ column }: { column: typeof sortBy }) => {
    if (sortBy === column && sortOrder === "asc")
      return <ArrowUp className="w-3.5 h-3.5 text-primary" />;
    if (sortBy === column && sortOrder === "desc")
      return <ArrowDown className="w-3.5 h-3.5 text-primary" />;
    return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />;
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-10">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-850 dark:text-white tracking-tight">
            Quản lý đặt phòng
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Quản lý tất cả các đặt phòng của khách.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          <div
            onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
            className={`flex items-center gap-2 text-[11px] font-bold px-2.5 py-1.5 rounded-xl border select-none cursor-pointer transition-all ${
              autoRefreshEnabled
                ? "bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100"
                : "bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700 hover:bg-slate-200"
            }`}
            title={
              autoRefreshEnabled
                ? "Click để tạm dừng tự động làm mới"
                : "Click để bật tự động làm mới"
            }
          >
            <span className="relative flex h-1.5 w-1.5">
              {autoRefreshEnabled && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                  autoRefreshEnabled ? "bg-emerald-500" : "bg-slate-400"
                }`}
              ></span>
            </span>
            <span>
              {autoRefreshEnabled
                ? `Làm mới sau ${Math.max(1, Math.ceil(15 - (progress * 15) / 100))}s`
                : "Tự động làm mới: Tắt"}
            </span>
          </div>

          <RefreshButton
            onRefresh={async () => {
              await refresh();
              setProgress(0);
            }}
            className="rounded-xl border border-slate-200 dark:border-slate-800"
          />
          <Button
            onClick={exportExcel}
            className="h-9.5 text-xs sm:text-sm font-semibold rounded-xl cursor-pointer"
          >
            <Download className="w-4 h-4 mr-1.5" /> Xuất excel
          </Button>
        </div>
      </div>

      {/* Sleek Auto Refresh Progress Bar */}
      {autoRefreshEnabled && (
        <div className="w-full h-0.5 bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden -mt-2 sm:-mt-3">
          <div
            className="h-full bg-primary/70 transition-all duration-100 ease-linear rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Filter Options */}
      <Card className="p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs bg-white dark:bg-slate-900">
        <div className="flex flex-col gap-3">
          {/* Row 1: Search */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm tên khách hoặc email..."
              className="h-9 sm:h-9.5 w-full pl-9.5 pr-3 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm bg-transparent outline-none focus:border-primary/50 text-slate-700 dark:text-slate-300 font-medium"
            />
          </div>

          {/* Row 2: Status + DateRange */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                className="h-9 sm:h-9.5 w-full px-3 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm bg-transparent outline-none focus:border-primary/50 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {Object.entries(BOOKING_STATUS_MAP).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full lg:w-auto min-w-0 lg:min-w-65">
              <DateRangePicker value={dateRange} onChange={setDateRange} />
            </div>
          </div>
        </div>
      </Card>

      {/* Bookings Content */}
      <Card className="p-3 sm:p-4 lg:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs">
        {paged.length === 0 ? (
          <p className="text-center text-slate-400 dark:text-slate-500 italic py-8 text-xs sm:text-sm">
            Không tìm thấy lượt đặt phòng nào phù hợp.
          </p>
        ) : (
          <>
            {/* Desktop Table View - only show on lg (1024px) or above */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4 text-left font-semibold">Khách</th>
                    <th className="py-3 px-4 text-left font-semibold">Phòng</th>
                    <th
                      className={`py-3 px-4 text-center cursor-pointer font-semibold transition-colors select-none hover:bg-slate-50 dark:hover:bg-slate-800 ${
                        sortBy === "checkIn" ? "text-primary font-bold" : ""
                      }`}
                      onClick={() => toggleSort("checkIn")}
                    >
                      <div className="flex items-center justify-center gap-1">
                        Ngày vào <SortIcon column="checkIn" />
                      </div>
                    </th>
                    <th
                      className={`py-3 px-4 text-center cursor-pointer font-semibold transition-colors select-none hover:bg-slate-50 dark:hover:bg-slate-800 ${
                        sortBy === "checkOut" ? "text-primary font-bold" : ""
                      }`}
                      onClick={() => toggleSort("checkOut")}
                    >
                      <div className="flex items-center justify-center gap-1">
                        Ngày ra <SortIcon column="checkOut" />
                      </div>
                    </th>
                    <th
                      className={`py-3 px-4 text-center cursor-pointer font-semibold transition-colors select-none hover:bg-slate-50 dark:hover:bg-slate-800 ${
                        sortBy === "nights" ? "text-primary font-bold" : ""
                      }`}
                      onClick={() => toggleSort("nights")}
                    >
                      <div className="flex items-center justify-center gap-1">
                        Đêm <SortIcon column="nights" />
                      </div>
                    </th>
                    <th
                      className={`py-3 px-4 text-center cursor-pointer font-semibold transition-colors select-none hover:bg-slate-50 dark:hover:bg-slate-800 ${
                        sortBy === "guests" ? "text-primary font-bold" : ""
                      }`}
                      onClick={() => toggleSort("guests")}
                    >
                      <div className="flex items-center justify-center gap-1">
                        Khách <SortIcon column="guests" />
                      </div>
                    </th>
                    <th
                      className={`py-3 px-4 text-center cursor-pointer font-semibold transition-colors select-none hover:bg-slate-50 dark:hover:bg-slate-800 ${
                        sortBy === "total" ? "text-primary font-bold" : ""
                      }`}
                      onClick={() => toggleSort("total")}
                    >
                      <div className="flex items-center justify-center gap-1">
                        Tổng tiền <SortIcon column="total" />
                      </div>
                    </th>
                    <th className="py-3 px-4 text-center font-semibold">
                      Trạng thái
                    </th>
                    <th className="py-3 px-4 text-center font-semibold">
                      Hành động
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {paged.map((b) => (
                    <tr
                      key={b.id}
                      className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 cursor-pointer transition-all duration-150"
                      onClick={() => router.push(`/admin/bookings/${b.id}`)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {b.guestInfo.fullName}
                        </div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 max-w-40 truncate">
                          {b.guestInfo.email}
                        </div>
                        <div className="text-[10px] text-primary font-bold mt-0.5">
                          {b.guestInfo.phoneNumber}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                        {b.room?.name}
                      </td>
                      <td className="py-3.5 px-4 text-center text-xs text-slate-650 dark:text-slate-350">
                        {formatDate(b.checkIn)}
                      </td>
                      <td className="py-3.5 px-4 text-center text-xs text-slate-650 dark:text-slate-350">
                        {formatDate(b.checkOut)}
                      </td>
                      <td className="py-3.5 px-4 text-center text-xs text-slate-650 dark:text-slate-350">
                        {getNights(b.checkIn, b.checkOut)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-650 dark:text-slate-350">
                          <Users className="w-3.5 h-3.5 text-slate-400" />{" "}
                          {b.adults}
                          <Baby className="w-3.5 h-3.5 text-slate-400 ml-0.5" />{" "}
                          {b.children}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-extrabold text-slate-800 dark:text-slate-200">
                        {b.totalAmount?.toLocaleString()}₫
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColorClasses(
                            b.status,
                          )}`}
                        >
                          {translateStatus(b.status)}
                        </span>
                      </td>
                      <td
                        className="py-3.5 px-4 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <BookingActionButtons
                          status={b.status}
                          id={b.id}
                          booking={b}
                          onEdit={() => setEditingBooking(b)}
                          onCancel={(id) => setCancelBookingId(id)}
                          onRefund={(bk) => setRefundBooking(bk)}
                          onStatusUpdated={refresh}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile/Tablet Card List View - hidden on lg (1024px) or above */}
            <div className="lg:hidden space-y-3">
              {paged.map((b) => {
                const nights = getNights(b.checkIn, b.checkOut);
                return (
                  <div
                    key={b.id}
                    onClick={() => router.push(`/admin/bookings/${b.id}`)}
                    className="p-3.5 sm:p-4 bg-card rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs flex flex-col gap-2.5 sm:gap-3.5 cursor-pointer hover:shadow-xs active:bg-slate-50 dark:active:bg-slate-850 transition-all duration-200"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 pb-2 sm:pb-2.5 border-b border-dashed border-slate-100 dark:border-slate-800/60">
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-xs sm:text-sm text-slate-850 dark:text-slate-200 truncate">
                          {b.guestInfo.fullName}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          {b.guestInfo.email} • {b.guestInfo.phoneNumber}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 ${getStatusColorClasses(
                          b.status,
                        )}`}
                      >
                        {translateStatus(b.status)}
                      </span>
                    </div>

                    {/* Body Info */}
                    <div className="space-y-2 text-xs leading-normal">
                      <div className="flex justify-between items-start gap-4">
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                            Phòng
                          </span>
                          <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                            {b.room?.name || "N/A"}
                          </span>
                        </div>
                        <div className="shrink-0 text-right">
                          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                            Khách
                          </span>
                          <span className="font-bold text-slate-750 dark:text-slate-300 flex items-center justify-end gap-1 mt-0.5">
                            <Users className="w-3.5 h-3.5 text-slate-400" />{" "}
                            {b.adults}
                            {b.children > 0 ? (
                              <>
                                <Baby className="w-3.5 h-3.5 text-slate-400 ml-0.5" />{" "}
                                {b.children}
                              </>
                            ) : (
                              <span className="text-[11px] text-slate-450 dark:text-slate-500 font-medium ml-0.5">
                                0 bé
                              </span>
                            )}
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                          Lưu trú
                        </span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {formatDate(b.checkIn)} → {formatDate(b.checkOut)}{" "}
                          <span className="text-slate-450 font-semibold">
                            ({nights} đêm)
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Action buttons + payment */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2.5 sm:pt-3 border-t border-slate-100 dark:border-slate-800/60 mt-1">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400 font-medium">
                          Tổng thu:
                        </span>
                        <span className="font-extrabold text-xs sm:text-sm text-slate-850 dark:text-slate-200">
                          {b.totalAmount?.toLocaleString()}₫
                        </span>
                      </div>

                      <div
                        className="flex items-center gap-1.5 self-end sm:self-auto"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <BookingActionButtons
                          status={b.status}
                          id={b.id}
                          booking={b}
                          onEdit={() => setEditingBooking(b)}
                          onCancel={(id) => setCancelBookingId(id)}
                          onRefund={(bk) => setRefundBooking(bk)}
                          onStatusUpdated={refresh}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <div className="pt-2">
          <Pagination
            page={page}
            pageCount={pageCount}
            onPageChange={setPage}
          />
        </div>
      </Card>

      {/* 1. Smart Cancel Dialog */}
      <SmartCancelDialog
        open={cancelBookingId !== null}
        bookingId={cancelBookingId}
        onClose={() => setCancelBookingId(null)}
        onSuccess={refresh}
      />

      {/* 2. Refund Dialog */}
      <RefundDialog
        open={refundBooking !== null}
        booking={refundBooking}
        onClose={() => setRefundBooking(null)}
        onSuccess={refresh}
      />

      {/* 3. Edit Dialog */}
      <AdminBookingUpdateDialog
        open={!!editingBooking}
        onClose={() => setEditingBooking(null)}
        booking={editingBooking}
        onConfirm={async (data) => {
          try {
            await api.patch(`/bookings/${editingBooking?.id}`, data);
            toast.success("Cập nhật thông tin thành công");
            setEditingBooking(null);
            refresh();
          } catch (err: any) {
            toast.error(err.response?.data?.message || "Cập nhật thất bại");
          }
        }}
      />
    </div>
  );
}
