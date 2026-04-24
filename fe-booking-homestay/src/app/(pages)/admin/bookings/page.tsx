"use client";

import { Button } from "@/_components/ui/button";
import { Card } from "@/_components/ui/card";
import { formatDate } from "@/lib/utils/date";
import { saveAs } from "file-saver";
import {
  ArrowUpDown,
  Baby,
  Download,
  Eye,
  Filter,
  Search,
  Users,
} from "lucide-react";
import Link from "next/link";
import ExcelJS from "exceljs";
import { DateRangePicker } from "../_components/DateRangePicker";
import { Pagination } from "../_components/Pagination";
import { RefreshButton } from "../_components/RefreshButton";
import {
  BOOKING_STATUS_MAP,
  getStatusColorClasses,
} from "../_utils/color-utils";
import { BookingActionButtons } from "./_components/BookingActionButtons";
import { BookingActionDialog } from "./_components/BookingActionDialog";
import { useBookingActions } from "./_hooks/useBookingActions";
import { useBookingList } from "./_hooks/useBookingList";

export default function BookingListPage() {
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
    sortCheckIn,
    setSortCheckIn,
    sortTotal,
    setSortTotal,
    processed,
    getNights,
    refresh,
  } = useBookingList();

  const {
    dialog,
    openAccept,
    openReject,
    openRefund,
    openAdminCancel,
    closeDialog,
    handleConfirm,
  } = useBookingActions(refresh);

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
    worksheet.getRow(1).alignment = { vertical: "middle", horizontal: "center" };

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
          <Button onClick={exportExcel}>
            <Download className="w-4 h-4 mr-2" /> Xuất excel
          </Button>
        </div>
      </div>

      <Card className="p-4 rounded-xl shadow-sm">
        <div className="flex flex-wrap items-center gap-4 w-full">
          <div className="relative min-w-[260px] flex-1">
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
              className="h-10 px-3 border rounded-lg"
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
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-sm">
                <th className="py-3 px-4 text-left font-semibold">Khách</th>
                <th className="py-3 px-4 text-left font-semibold">Phòng</th>
                <th
                  className="py-3 px-4 text-center cursor-pointer font-semibold"
                  onClick={() =>
                    setSortCheckIn(sortCheckIn === "asc" ? "desc" : "asc")
                  }
                >
                  <div className="flex items-center justify-center gap-1">
                    Ngày vào <ArrowUpDown className="w-4" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center font-semibold">Ngày ra</th>
                <th className="py-3 px-4 text-center font-semibold">Số đêm</th>
                <th className="py-3 px-4 text-center font-semibold">
                  Số khách
                </th>

                <th
                  className="py-3 px-4 text-center cursor-pointer font-semibold"
                  onClick={() =>
                    setSortTotal(sortTotal === "asc" ? "desc" : "asc")
                  }
                >
                  <div className="flex items-center justify-center gap-1">
                    Tổng tiền <ArrowUpDown className="w-4" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center font-semibold">
                  Trạng thái
                </th>
                <th className="py-3 px-4 text-center font-semibold">
                  Hành động
                </th>
                <th className="py-3 px-4 text-center font-semibold">
                  Chi tiết
                </th>
              </tr>
            </thead>

            <tbody>
              {paged.map((b) => (
                <tr key={b.id} className="border-b hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="font-medium">{b.guestInfo.fullName}</div>
                    <div className="text-xs text-gray-500">
                      {b.guestInfo.email}
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
                        b.status
                      )}`}
                    >
                      {b.status}
                    </span>
                  </td>

                  <td className="py-4 px-4 text-center">
                    <BookingActionButtons
                      status={b.status}
                      id={b.id}
                      paidAmount={b.paidAmount}
                      onAccept={openAccept}
                      onReject={openReject}
                      onRefund={openRefund}
                      onCancel={openAdminCancel}
                    />
                  </td>

                  <td className="py-4 px-4 text-center">
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

        <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
      </Card>

      <BookingActionDialog
        dialog={dialog}
        onCancel={closeDialog}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
