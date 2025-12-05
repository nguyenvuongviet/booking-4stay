"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils/date";
import { saveAs } from "file-saver";
import {
  ArrowUpDown,
  Baby,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Filter,
  Search,
  Users,
} from "lucide-react";
import Link from "next/link";
import * as XLSX from "xlsx";
import { DateRangePicker } from "../_components/DateRangePicker";
import { RefreshButton } from "../_components/RefreshButton";
import { getStatusColorClasses } from "./[id]/_utils/color-utils";
import { useBookingList } from "./_hooks/useBookingList";

export default function BookingListPage() {
  const {
    loading,
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
    getNights,
    processed,
    refresh,
    accept,
    reject,
  } = useBookingList();

  if (loading || !raw) return <div className="p-6">Đang tải dữ liệu…</div>;

  const exportExcel = () => {
    const rows = processed.map((b) => ({
      ID: b.id,
      Guest: b.guestInfo.fullName,
      Email: b.guestInfo.email,
      Room: b.room?.name,
      CheckIn: formatDate(b.checkIn),
      CheckOut: formatDate(b.checkOut),
      Nights: getNights(b.checkIn, b.checkOut),
      Adults: b.adults,
      Children: b.children,
      Amount: b.totalAmount,
      Status: b.status,
    }));

    const sheet = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, "Bookings");

    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buffer]), "bookings.xlsx");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold">Quản lý đặt phòng</h1>
          <p className="text-gray-600">
            Quản lý tất cả các đặt phòng của khách.
          </p>
        </div>
        <RefreshButton onRefresh={refresh} />
      </div>

      <Card className="p-4 rounded-xl shadow-sm">
        <div className="flex flex-col lg:flex-row lg:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 w-full">
            <div className="relative min-w-[260px] flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 text-gray-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search guest name or email…"
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
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="CHECKED_IN">Checked-in</option>
                <option value="CHECKED_OUT">Checked-out</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>
            <DateRangePicker value={dateRange} onChange={setDateRange} />
          </div>

          <Button
            className="h-10 bg-green-600 text-white flex items-center gap-2"
            onClick={exportExcel}
          >
            <Download className="w-4 h-4" /> Export
          </Button>
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
                    {b.status === "PENDING" ? (
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          className="bg-green-600 text-white"
                          onClick={() => accept(b.id)}
                        >
                          Duyệt
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => reject(b.id)}
                        >
                          Từ chối
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">–</span>
                    )}
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

        <div className="flex justify-between items-center mt-6">
          <p className="text-sm text-gray-500">
            Page {page} / {pageCount}
          </p>

          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={page === pageCount}
              onClick={() => setPage(page + 1)}
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
