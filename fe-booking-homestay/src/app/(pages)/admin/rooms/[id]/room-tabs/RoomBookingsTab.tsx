"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils/date";
import { Booking } from "@/types/booking";
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
import { useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import * as XLSX from "xlsx";
import { DateRangePicker } from "../../../_components/DateRangePicker";
import { Pagination } from "../../../_components/Pagination";

interface Props {
  bookings: Booking[];
}

export default function RoomBookingsTab({ bookings }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [sortCheckIn, setSortCheckIn] = useState<"asc" | "desc" | null>(null);
  const [sortTotal, setSortTotal] = useState<"asc" | "desc" | null>(null);

  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const pageSize = 10;
  const [page, setPage] = useState(1);

  const statusColor = (status: string) =>
    ({
      CONFIRMED: "bg-green-100 text-green-700",
      PENDING: "bg-yellow-100 text-yellow-700",
      CHECKED_IN: "bg-blue-100 text-blue-700",
      CHECKED_OUT: "bg-gray-200 text-gray-700",
      CANCELLED: "bg-red-100 text-red-700",
    }[status] || "bg-gray-100 text-gray-800");

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
        (b) => b.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    if (dateRange?.from) {
      data = data.filter(
        (b) => new Date(b.checkIn) >= new Date(dateRange.from!)
      );
    }
    if (dateRange?.to)
      data = data.filter((b) => new Date(b.checkIn) <= new Date(dateRange.to!));
    if (sortCheckIn) {
      data.sort((a, b) =>
        sortCheckIn === "asc"
          ? +new Date(a.checkIn) - +new Date(b.checkIn)
          : +new Date(b.checkIn) - +new Date(a.checkIn)
      );
    }
    if (sortTotal) {
      data.sort((a, b) =>
        sortTotal === "asc"
          ? (a.totalAmount ?? 0) - (b.totalAmount ?? 0)
          : (b.totalAmount ?? 0) - (a.totalAmount ?? 0)
      );
    }
    return data;
  }, [bookings, searchTerm, statusFilter, dateRange, sortCheckIn, sortTotal]);

  const pageCount = Math.max(1, Math.ceil(processed.length / pageSize));
  const paged = processed.slice((page - 1) * pageSize, page * pageSize);

  const exportExcel = () => {
    const rows = processed.map((b) => ({
      ID: b.id,
      Guest: b.guestInfo.fullName,
      Email: b.guestInfo.email,
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

    saveAs(
      new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      "bookings.xlsx"
    );
  };

  return (
    <div className="space-y-6">
      <Card className="p-4 rounded-xl shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 w-full">
            <div className="relative flex-1 min-w-[250px] max-w-[380px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 text-muted-foreground" />
              <input
                placeholder="Search guest name or email…"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="h-10 w-full pl-10 pr-3 border rounded-lg"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                className="h-10 px-3 border rounded-lg"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="CHECKED_IN">Checked-in</option>
                <option value="CHECKED_OUT">Checked-out</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div className="min-w-[260px]">
              <DateRangePicker value={dateRange} onChange={setDateRange} />
            </div>
          </div>

          <Button
            onClick={exportExcel}
            className="h-10 bg-green-600 text-white flex items-center gap-2"
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
                <th
                  className="py-3 px-4 text-center font-semibold cursor-pointer"
                  onClick={() =>
                    setSortCheckIn(sortCheckIn === "asc" ? "desc" : "asc")
                  }
                >
                  <div className="flex items-center justify-center gap-1">
                    Ngày vào <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center font-semibold">Ngày ra</th>
                <th className="py-3 px-4 text-center font-semibold">Số đêm</th>
                <th className="py-3 px-4 text-center font-semibold">
                  Số khách
                </th>
                <th
                  className="py-3 px-4 text-center font-semibold cursor-pointer"
                  onClick={() =>
                    setSortTotal(sortTotal === "asc" ? "desc" : "asc")
                  }
                >
                  <div className="flex items-center justify-center gap-1">
                    Tổng tiền <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center font-semibold">
                  Trạng thái
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
                    <p className="font-medium">{b.guestInfo.fullName}</p>
                    <p className="text-xs text-muted-foreground">
                      {b.guestInfo.email}
                    </p>
                  </td>
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
                    {b.totalAmount?.toLocaleString()}₫
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor(
                        b.status
                      )}`}
                    >
                      {b.status}
                    </span>
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
    </div>
  );
}
