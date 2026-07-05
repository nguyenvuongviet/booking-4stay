"use client";

import { Button } from "@/_components/ui/button";
import { Card } from "@/_components/ui/card";
import { formatDate } from "@/lib/utils/date";
import { Booking } from "@/types/booking";
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
import { useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "../../../_components/DateRangePicker";
import { Pagination } from "../../../_components/Pagination";

interface Props {
  bookings: Booking[];
}

export default function RoomBookingsTab({ bookings }: Props) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [sortBy, setSortBy] = useState<
    "checkIn" | "checkOut" | "nights" | "guests" | "total" | null
  >(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);

  const toggleSort = (
    column: "checkIn" | "checkOut" | "nights" | "guests" | "total",
  ) => {
    if (sortBy !== column) {
      setSortBy(column);
      setSortOrder("desc");
    } else {
      if (sortOrder === "desc") {
        setSortOrder("asc");
      } else if (sortOrder === "asc") {
        setSortBy(null);
        setSortOrder(null);
      } else {
        setSortOrder("desc");
      }
    }
  };

  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const pageSize = 10;
  const [page, setPage] = useState(1);

  const statusLabel = (status: string) =>
    ({
      CONFIRMED: "Đã xác nhận",
      PENDING: "Chờ xác nhận",
      CHECKED_IN: "Đã check-in",
      CHECKED_OUT: "Đã check-out",
      CANCELLED: "Đã hủy",
    })[status] || status;

  const statusColor = (status: string) =>
    ({
      CONFIRMED:
        "bg-green-50 text-green-700 border-green-200/50 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30",
      PENDING:
        "bg-yellow-50 text-yellow-700 border-yellow-200/50 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-900/30",
      CHECKED_IN:
        "bg-blue-50 text-blue-700 border-blue-200/50 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30",
      CHECKED_OUT:
        "bg-slate-100 text-slate-600 border-slate-200/50 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700/30",
      CANCELLED:
        "bg-red-50 text-red-700 border-red-200/50 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30",
    })[status] || "bg-gray-100 text-gray-800";

  const getNights = (ci: string, co: string) => {
    const d1 = new Date(ci);
    const d2 = new Date(co);
    return Math.max(1, Math.round((d2.getTime() - d1.getTime()) / 86400000));
  };

  const processed = useMemo(() => {
    let data = [...bookings];
    data = data.filter((b) => {
      const g = b.guestInfo;
      return (
        g.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    if (statusFilter !== "all") {
      data = data.filter(
        (b) => b.status.toLowerCase() === statusFilter.toLowerCase(),
      );
    }
    if (dateRange?.from) {
      data = data.filter(
        (b) => new Date(b.checkIn) >= new Date(dateRange.from!),
      );
    }
    if (dateRange?.to)
      data = data.filter((b) => new Date(b.checkIn) <= new Date(dateRange.to!));
    if (sortBy && sortOrder) {
      data.sort((a, b) => {
        let valA: any;
        let valB: any;

        if (sortBy === "checkIn") {
          valA = new Date(a.checkIn).getTime();
          valB = new Date(b.checkIn).getTime();
        } else if (sortBy === "checkOut") {
          valA = new Date(a.checkOut).getTime();
          valB = new Date(b.checkOut).getTime();
        } else if (sortBy === "nights") {
          valA = getNights(a.checkIn, a.checkOut);
          valB = getNights(b.checkIn, b.checkOut);
        } else if (sortBy === "guests") {
          valA = (a.adults ?? 0) + (a.children ?? 0);
          valB = (b.adults ?? 0) + (b.children ?? 0);
        } else if (sortBy === "total") {
          valA = a.totalAmount ?? 0;
          valB = b.totalAmount ?? 0;
        }

        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }
    return data;
  }, [bookings, searchTerm, statusFilter, dateRange, sortBy, sortOrder]);

  const pageCount = Math.max(1, Math.ceil(processed.length / pageSize));
  const paged = processed.slice((page - 1) * pageSize, page * pageSize);

  const exportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Bookings");

    worksheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Khách hàng", key: "guest", width: 25 },
      { header: "Email", key: "email", width: 30 },
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
      return <ArrowUp className="w-3 h-3 text-primary" />;
    if (sortBy === column && sortOrder === "desc")
      return <ArrowDown className="w-3 h-3 text-primary" />;
    return <ArrowUpDown className="w-3 h-3 text-slate-400" />;
  };

  return (
    <div className="space-y-4 sm:space-y-6 mt-4">
      {/* Filters Card */}
      <Card className="p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs bg-white dark:bg-slate-900">
        <div className="flex flex-col gap-3">
          {/* Row 1: Search */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              placeholder="Tìm tên khách hoặc email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="h-9 sm:h-9.5 w-full pl-9.5 pr-3 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm bg-transparent outline-none focus:border-primary/50 text-slate-700 dark:text-slate-300 font-medium"
            />
          </div>

          {/* Row 2: Status + DateRange + Export */}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] lg:grid-cols-[auto_1fr_auto] gap-2 sm:gap-3 items-center">
            {/* Status select */}
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                className="h-9 sm:h-9.5 w-full px-3 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm bg-transparent outline-none focus:border-primary/50 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="PENDING">Chờ xác nhận</option>
                <option value="CONFIRMED">Đã xác nhận</option>
                <option value="CHECKED_IN">Đã check-in</option>
                <option value="CHECKED_OUT">Đã check-out</option>
                <option value="CANCELLED">Đã hủy</option>
              </select>
            </div>

            {/* DateRange */}
            <div className="w-full lg:w-auto min-w-0 lg:min-w-65">
              <DateRangePicker value={dateRange} onChange={setDateRange} />
            </div>

            {/* Export */}
            <Button
              onClick={exportExcel}
              className="h-9 sm:h-9.5 bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-2 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer w-full sm:w-auto"
            >
              <Download className="w-3.5 h-3.5" /> Xuất Excel
            </Button>
          </div>
        </div>
      </Card>

      {/* Bookings List/Table */}
      <Card className="p-3 sm:p-4 lg:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs">
        {paged.length === 0 ? (
          <p className="text-center text-slate-400 dark:text-slate-500 italic py-6 text-xs sm:text-sm">
            Không tìm thấy lượt đặt phòng nào phù hợp.
          </p>
        ) : (
          <>
            {/* Desktop Table View - only show from lg (1024px) */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3 text-left font-semibold">
                      Khách hàng
                    </th>
                    <th
                      className={`py-2.5 px-3 text-center cursor-pointer font-semibold transition-colors select-none hover:bg-slate-50 dark:hover:bg-slate-800 ${
                        sortBy === "checkIn" ? "text-primary font-bold" : ""
                      }`}
                      onClick={() => toggleSort("checkIn")}
                    >
                      <div className="flex items-center justify-center gap-1">
                        Ngày vào <SortIcon column="checkIn" />
                      </div>
                    </th>
                    <th
                      className={`py-2.5 px-3 text-center cursor-pointer font-semibold transition-colors select-none hover:bg-slate-50 dark:hover:bg-slate-800 ${
                        sortBy === "checkOut" ? "text-primary font-bold" : ""
                      }`}
                      onClick={() => toggleSort("checkOut")}
                    >
                      <div className="flex items-center justify-center gap-1">
                        Ngày ra <SortIcon column="checkOut" />
                      </div>
                    </th>
                    <th
                      className={`py-2.5 px-3 text-center cursor-pointer font-semibold transition-colors select-none hover:bg-slate-50 dark:hover:bg-slate-800 ${
                        sortBy === "nights" ? "text-primary font-bold" : ""
                      }`}
                      onClick={() => toggleSort("nights")}
                    >
                      <div className="flex items-center justify-center gap-1">
                        Đêm <SortIcon column="nights" />
                      </div>
                    </th>
                    <th
                      className={`py-2.5 px-3 text-center cursor-pointer font-semibold transition-colors select-none hover:bg-slate-50 dark:hover:bg-slate-800 ${
                        sortBy === "guests" ? "text-primary font-bold" : ""
                      }`}
                      onClick={() => toggleSort("guests")}
                    >
                      <div className="flex items-center justify-center gap-1">
                        Khách <SortIcon column="guests" />
                      </div>
                    </th>
                    <th
                      className={`py-2.5 px-3 text-center cursor-pointer font-semibold transition-colors select-none hover:bg-slate-50 dark:hover:bg-slate-800 ${
                        sortBy === "total" ? "text-primary font-bold" : ""
                      }`}
                      onClick={() => toggleSort("total")}
                    >
                      <div className="flex items-center justify-center gap-1">
                        Tổng tiền <SortIcon column="total" />
                      </div>
                    </th>
                    <th className="py-2.5 px-3 text-center font-semibold">
                      Trạng thái
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {paged.map((b) => (
                    <tr
                      key={b.id}
                      className="border-b border-slate-100 dark:border-slate-800/40 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 cursor-pointer transition-all duration-150"
                      onClick={() => router.push(`/admin/bookings/${b.id}`)}
                    >
                      <td className="py-3 px-3">
                        <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                          {b.guestInfo.fullName}
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate max-w-48">
                          {b.guestInfo.email}
                        </p>
                      </td>
                      <td className="py-3 px-3 text-center text-xs text-slate-650 dark:text-slate-350">
                        {formatDate(b.checkIn)}
                      </td>
                      <td className="py-3 px-3 text-center text-xs text-slate-650 dark:text-slate-350">
                        {formatDate(b.checkOut)}
                      </td>
                      <td className="py-3 px-3 text-center text-xs text-slate-650 dark:text-slate-350">
                        {getNights(b.checkIn, b.checkOut)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-650 dark:text-slate-350">
                          <Users className="w-3.5 h-3.5 text-slate-400" />{" "}
                          {b.adults}
                          {b.children > 0 && (
                            <>
                              <Baby className="w-3.5 h-3.5 text-slate-400 ml-0.5" />{" "}
                              {b.children}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center text-sm font-extrabold text-slate-800 dark:text-slate-200">
                        {b.totalAmount?.toLocaleString()}₫
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusColor(b.status)}`}
                        >
                          {statusLabel(b.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile/Tablet Card List View - below lg (1024px) */}
            <div className="lg:hidden space-y-2.5 sm:space-y-3">
              {paged.map((b) => {
                const nights = getNights(b.checkIn, b.checkOut);
                return (
                  <div
                    key={b.id}
                    onClick={() => router.push(`/admin/bookings/${b.id}`)}
                    className="p-3 sm:p-4 bg-card rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs flex flex-col gap-2.5 sm:gap-3.5 cursor-pointer hover:shadow-xs active:bg-slate-50 dark:active:bg-slate-850 transition-all duration-200"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2 pb-2 sm:pb-2.5 border-b border-dashed border-slate-100 dark:border-slate-800/60">
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-xs sm:text-sm text-slate-850 dark:text-slate-200 truncate">
                          {b.guestInfo.fullName}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          {b.guestInfo.email}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 ${statusColor(b.status)}`}
                      >
                        {statusLabel(b.status)}
                      </span>
                    </div>

                    {/* Body */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs leading-normal">
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                          Lưu trú
                        </span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] sm:text-xs">
                          {formatDate(b.checkIn)} → {formatDate(b.checkOut)}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-1">
                          ({nights} đêm)
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                          Khách
                        </span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 mt-0.5 text-[11px] sm:text-xs">
                          <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400" />{" "}
                          {b.adults}
                          {b.children > 0 && (
                            <>
                              <Baby className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 ml-1" />{" "}
                              {b.children}
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-center pt-2 sm:pt-2.5 border-t border-slate-100 dark:border-slate-800/60">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400 font-medium">
                          Tổng thu:
                        </span>
                        <span className="font-extrabold text-xs sm:text-sm text-slate-850 dark:text-slate-200">
                          {b.totalAmount?.toLocaleString()}₫
                        </span>
                      </div>
                      <span className="text-primary text-[11px] sm:text-xs font-semibold">
                        Chi tiết →
                      </span>
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
    </div>
  );
}
