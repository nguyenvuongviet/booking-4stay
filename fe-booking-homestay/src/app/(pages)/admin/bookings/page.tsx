"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils/date";
import {
  acceptBooking,
  refundBooking,
  rejectBooking,
} from "@/services/admin/bookingsApi";
import { saveAs } from "file-saver";
import {
  ArrowUpDown,
  Baby,
  Check,
  Download,
  Eye,
  Filter,
  Search,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { DateRangePicker } from "../_components/DateRangePicker";
import { Pagination } from "../_components/Pagination";
import { RefreshButton } from "../_components/RefreshButton";
import {
  BOOKING_STATUS_MAP,
  getStatusColorClasses,
} from "../_utils/color-utils";
import { InputDialog } from "./_components/InputDialog";
import { useBookingList } from "./_hooks/useBookingList";
import Error from "next/error";

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
    getNights,
    processed,
    refresh,
  } = useBookingList();

  const [dialog, setDialog] = useState({
    open: false,
    mode: null as "accept" | "reject" | null,
    id: null as number | null,
  });

  const [refundDialog, setRefundDialog] = useState({
    open: false,
    id: null as number | null,
    maxAmount: 0,
  });

  const openRefund = (id: number, maxAmount: number) => {
    setRefundDialog({
      open: true,
      id,
      maxAmount,
    });
  };

  const handleRefund = async (amount: string) => {
    try {
      await refundBooking(refundDialog.id!, Number(amount));

      toast.success("Hoàn tiền thành công");
      refresh();
    } catch (err) {
      const errorMessage = (err as { response: { data: { message: string } } })
        .response?.data?.message;
      toast.error(errorMessage || "Hoàn tiền thất bại");
    } finally {
      setRefundDialog({ open: false, id: null, maxAmount: 0 });
    }
  };

  const openAccept = (id: number) =>
    setDialog({ open: true, mode: "accept", id });

  const openReject = (id: number) =>
    setDialog({ open: true, mode: "reject", id });

  const handleConfirm = async (value: string) => {
    try {
      if (dialog.mode === "accept") {
        await acceptBooking(dialog.id!, parseInt(value, 10));
        toast.success("Duyệt booking thành công");
      } else {
        await rejectBooking(dialog.id!, value);
        toast.success("Từ chối booking thành công");
      }
      refresh();
    } catch (err) {
      const errorMessage = (err as { response: { data: { message: string } } })
        .response?.data?.message;
      toast.error(errorMessage || "Thao tác thất bại");
    } finally {
      setDialog({ open: false, mode: null, id: null });
    }
  };

  if (initialLoading || !raw) {
    return <div className="p-6">Đang tải dữ liệu…</div>;
  }

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
                    {b.status === "PENDING" ? (
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          className="bg-green-600 text-white"
                          onClick={() => openAccept(b.id)}
                        >
                          <Check className="w-4 h-4" /> Duyệt
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => openReject(b.id)}
                        >
                          <X className="w-4 h-4" /> Huỷ
                        </Button>
                      </div>
                    ) : b.status === "WAITING_REFUND" ? (
                      <Button
                        size="sm"
                        className="bg-blue-600 text-white"
                        onClick={() => openRefund(b.id, b.paidAmount!)}
                      >
                        Hoàn tiền
                      </Button>
                    ) : (
                      <span className="text-xs text-gray-400 italic">-</span>
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

        <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
      </Card>

      <InputDialog
        open={dialog.open}
        title={
          dialog.mode === "accept"
            ? "Nhập số tiền khách đã trả"
            : "Lý do từ chối"
        }
        placeholder={dialog.mode === "accept" ? "VD: 1500000" : "Nhập lý do..."}
        type={dialog.mode === "accept" ? "number" : "text"}
        confirmText={
          dialog.mode === "accept" ? "Duyệt booking" : "Từ chối booking"
        }
        onCancel={() => setDialog({ open: false, mode: null, id: null })}
        onConfirm={handleConfirm}
      />

      <InputDialog
        open={refundDialog.open}
        title="Hoàn tiền cho booking"
        description={`Số tiền tối đa có thể hoàn: ${refundDialog.maxAmount?.toLocaleString()}₫`}
        placeholder="Nhập số tiền hoàn"
        type="number"
        confirmText="Xác nhận hoàn tiền"
        onCancel={() =>
          setRefundDialog({ open: false, id: null, maxAmount: 0 })
        }
        onConfirm={handleRefund}
      />
    </div>
  );
}
