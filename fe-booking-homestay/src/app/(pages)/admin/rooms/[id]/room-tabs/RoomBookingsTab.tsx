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

  const statusColor = (status: string) =>
    ({
      CONFIRMED: "bg-green-100 text-green-700",
      PENDING: "bg-yellow-100 text-yellow-700",
      CHECKED_IN: "bg-blue-100 text-blue-700",
      CHECKED_OUT: "bg-gray-200 text-gray-700",
      CANCELLED: "bg-red-100 text-red-700",
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

  return (
    <div className="space-y-6">
      <Card className="p-4 rounded-xl shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 w-full">
            <div className="relative flex-1 min-w-62.5 max-w-95">
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
                className="h-10 px-3 border rounded-lg cursor-pointer"
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

            <div className="min-w-65">
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
                        b.status,
                      )}`}
                    >
                      {b.status}
                    </span>
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
