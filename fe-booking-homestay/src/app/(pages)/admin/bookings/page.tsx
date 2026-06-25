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
import { useState } from "react";
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

  if (initialLoading || !raw) {
    return <div className="p-6">Đang tải dữ liệu…</div>;
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold">Quản lý đặt phòng</h1>
          <p className="text-gray-600 mt-1">
            Quản lý tất cả các đặt phòng của khách.
          </p>
        </div>

        <div className="flex gap-3">
          <RefreshButton onRefresh={refresh} />
          <Button onClick={exportExcel} className="cursor-pointer">
            <Download className="w-4 h-4 mr-2" /> Xuất excel
          </Button>
        </div>
      </div>

      <Card className="p-4 rounded-xl shadow-sm">
        <div className="flex flex-wrap items-center gap-4 w-full">
          <div className="relative min-w-65 flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 text-gray-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm tên hoặc email..."
              className="h-10 w-full pl-10 pr-3 border rounded-lg"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              className="h-10 px-3 border rounded-lg cursor-pointer"
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
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>
      </Card>

      <Card className="p-6 rounded-xl shadow-sm">
        <div className="overflow-x-auto min-h-125">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-sm">
                <th className="py-3 px-4 text-left font-semibold">Khách</th>
                <th className="py-3 px-4 text-left font-semibold">Phòng</th>
                <th
                  className={`py-3 px-4 text-center cursor-pointer font-semibold transition-colors select-none hover:bg-slate-50 dark:hover:bg-slate-800 ${
                    sortBy === "checkIn"
                      ? "text-primary dark:text-sky-400 font-bold"
                      : ""
                  }`}
                  onClick={() => toggleSort("checkIn")}
                >
                  <div className="flex items-center justify-center gap-1">
                    Ngày vào{" "}
                    {sortBy === "checkIn" && sortOrder === "asc" ? (
                      <ArrowUp className="w-4 h-4 text-primary dark:text-sky-400" />
                    ) : sortBy === "checkIn" && sortOrder === "desc" ? (
                      <ArrowDown className="w-4 h-4 text-primary dark:text-sky-400" />
                    ) : (
                      <ArrowUpDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </th>
                <th
                  className={`py-3 px-4 text-center cursor-pointer font-semibold transition-colors select-none hover:bg-slate-50 dark:hover:bg-slate-800 ${
                    sortBy === "checkOut"
                      ? "text-primary dark:text-sky-400 font-bold"
                      : ""
                  }`}
                  onClick={() => toggleSort("checkOut")}
                >
                  <div className="flex items-center justify-center gap-1">
                    Ngày ra{" "}
                    {sortBy === "checkOut" && sortOrder === "asc" ? (
                      <ArrowUp className="w-4 h-4 text-primary dark:text-sky-400" />
                    ) : sortBy === "checkOut" && sortOrder === "desc" ? (
                      <ArrowDown className="w-4 h-4 text-primary dark:text-sky-400" />
                    ) : (
                      <ArrowUpDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </th>
                <th
                  className={`py-3 px-4 text-center cursor-pointer font-semibold transition-colors select-none hover:bg-slate-50 dark:hover:bg-slate-800 ${
                    sortBy === "nights"
                      ? "text-primary dark:text-sky-400 font-bold"
                      : ""
                  }`}
                  onClick={() => toggleSort("nights")}
                >
                  <div className="flex items-center justify-center gap-1">
                    Số đêm{" "}
                    {sortBy === "nights" && sortOrder === "asc" ? (
                      <ArrowUp className="w-4 h-4 text-primary dark:text-sky-400" />
                    ) : sortBy === "nights" && sortOrder === "desc" ? (
                      <ArrowDown className="w-4 h-4 text-primary dark:text-sky-400" />
                    ) : (
                      <ArrowUpDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </th>
                <th
                  className={`py-3 px-4 text-center cursor-pointer font-semibold transition-colors select-none hover:bg-slate-50 dark:hover:bg-slate-800 ${
                    sortBy === "guests"
                      ? "text-primary dark:text-sky-400 font-bold"
                      : ""
                  }`}
                  onClick={() => toggleSort("guests")}
                >
                  <div className="flex items-center justify-center gap-1">
                    Số khách{" "}
                    {sortBy === "guests" && sortOrder === "asc" ? (
                      <ArrowUp className="w-4 h-4 text-primary dark:text-sky-400" />
                    ) : sortBy === "guests" && sortOrder === "desc" ? (
                      <ArrowDown className="w-4 h-4 text-primary dark:text-sky-400" />
                    ) : (
                      <ArrowUpDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </th>

                <th
                  className={`py-3 px-4 text-center cursor-pointer font-semibold transition-colors select-none hover:bg-slate-50 dark:hover:bg-slate-800 ${
                    sortBy === "total"
                      ? "text-primary dark:text-sky-400 font-bold"
                      : ""
                  }`}
                  onClick={() => toggleSort("total")}
                >
                  <div className="flex items-center justify-center gap-1">
                    Tổng tiền{" "}
                    {sortBy === "total" && sortOrder === "asc" ? (
                      <ArrowUp className="w-4 h-4 text-primary dark:text-sky-400" />
                    ) : sortBy === "total" && sortOrder === "desc" ? (
                      <ArrowDown className="w-4 h-4 text-primary dark:text-sky-400" />
                    ) : (
                      <ArrowUpDown className="w-4 h-4 text-slate-400" />
                    )}
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
                  className="border-b hover:bg-sky-100/50 dark:hover:bg-slate-800/80 hover:shadow-sm cursor-pointer transition-all duration-150"
                  onClick={() => router.push(`/admin/bookings/${b.id}`)}
                >
                  <td className="py-4 px-4">
                    <div className="font-medium">{b.guestInfo.fullName}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">
                      {b.guestInfo.email}
                    </div>
                    <div className="text-[10px] text-primary font-bold">
                      {b.guestInfo.phoneNumber}
                    </div>
                  </td>
                  <td className="py-4 px-4 font-medium">{b.room?.name}</td>
                  <td className="py-4 px-4 text-center">
                    {formatDate(b.checkIn)}
                  </td>
                  <td className="py-4 px-4 text-center">
                    {formatDate(b.checkOut)}
                  </td>
                  <td className="py-4 px-4 text-center">
                    {getNights(b.checkIn, b.checkOut)}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <Users className="w-4 h-4" /> {b.adults}
                      <Baby className="w-4 h-4" /> {b.children}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center font-semibold">
                    {b.totalAmount?.toLocaleString()} ₫
                  </td>

                  <td className="py-4 px-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColorClasses(
                        b.status,
                      )}`}
                    >
                      {translateStatus(b.status)}
                    </span>
                  </td>

                  <td
                    className="py-4 px-4 text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <BookingActionButtons
                      status={b.status}
                      id={b.id}
                      booking={b}
                      onEdit={() => setEditingBooking(b)}
                      onCancel={(id) => setCancelBookingId(id)}
                      onRefund={(bk) => setRefundBooking(bk)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
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
