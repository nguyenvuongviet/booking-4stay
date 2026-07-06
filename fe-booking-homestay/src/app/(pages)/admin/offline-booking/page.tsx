"use client";

import { Button } from "@/_components/ui/button";
import { Calendar } from "@/_components/ui/calendar";
import { Input } from "@/_components/ui/input";
import { Label } from "@/_components/ui/label";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/date";
import { addMonths } from "date-fns";
import {
  Banknote,
  CalendarDays,
  CheckCircle2,
  DoorOpen,
  Loader2,
  NotebookPen,
  RotateCcw,
  Send,
  User,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { type DateRange } from "react-day-picker";
import toast from "react-hot-toast";
import { toDateKey } from "../_utils/calendar";
import { RoomSelectionGrid } from "./_components/RoomSelectionGrid";
import { useManualBookingForm } from "./_hooks/useManualBookingForm";

export default function ManualBookingPage() {
  const f = useManualBookingForm();

  if (f.success) {
    return (
      <div className="max-w-xl mx-auto py-8 sm:py-16 px-4 text-center space-y-4 sm:space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-green-100 mb-2 sm:mb-4">
          <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-green-700">
          Tạo đơn thành công!
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Đơn đặt phòng thủ công đã được tạo.
          {f.createdBookingId && (
            <span>
              {" "}
              Mã đơn: <strong>#{f.createdBookingId}</strong>
            </span>
          )}
        </p>
        <div className="flex gap-2 sm:gap-3 justify-center pt-2 sm:pt-4">
          <Button
            onClick={f.reset}
            variant="outline"
            className="gap-1.5 sm:gap-2 h-9 sm:h-10 text-xs sm:text-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Tạo đơn mới
          </Button>
          <Link href="/admin/bookings">
            <Button className="gap-1.5 sm:gap-2 h-9 sm:h-10 text-xs sm:text-sm">
              <CalendarDays className="w-3.5 h-3.5" /> Xem danh sách
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 sm:mb-8 pb-4 sm:pb-6 border-b border-gray-100 gap-4">
        <div>
          <h1 className="text-xl sm:text-3xl font-black flex items-center gap-2 sm:gap-3 text-gray-900 leading-tight">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              <NotebookPen className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            Tạo đơn đặt phòng thủ công
          </h1>
          <p className="text-gray-500 mt-1 sm:mt-2 ml-0 sm:ml-15 text-xs sm:text-base">
            Xử lý nhanh các yêu cầu đặt phòng trực tiếp hoặc qua điện thoại.
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto justify-end sm:justify-start">
          <Button
            variant="outline"
            onClick={f.reset}
            className="rounded-xl border-gray-200 text-xs sm:text-sm h-9 sm:h-10"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5 sm:mr-2" /> Làm mới
          </Button>
          <Link href="/admin/bookings">
            <Button
              variant="outline"
              className="rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 text-xs sm:text-sm h-9 sm:h-10 cursor-pointer"
            >
              Hủy bỏ
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* CỘT TRÁI: CHỌN PHÒNG & CHỌN NGÀY */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          {f.isQuickAction && f.selectedRoom && (
            <div className="bg-blue-600 p-4 sm:p-8 rounded-2xl sm:rounded-4xl text-white shadow-xl shadow-blue-200 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6">
                <div>
                  <p className="text-blue-100 font-black uppercase tracking-widest text-[9px] sm:text-[10px] mb-1 sm:mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Chế độ đặt phòng
                    nhanh
                  </p>
                  <h3 className="text-xl sm:text-3xl font-black mb-1 leading-tight">
                    {f.selectedRoom.name}
                  </h3>
                  <p className="text-blue-55 font-bold text-sm sm:text-lg flex items-center gap-2">
                    {formatDate(f.checkIn)} — {formatDate(f.checkOut)}
                    {f.pricing && (
                      <span className="bg-white/20 px-2 py-0.5 rounded-lg text-xs sm:text-sm font-black">
                        {f.pricing.nights} đêm
                      </span>
                    )}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    // Reset quick action to show steps
                    const url = new URL(window.location.href);
                    url.searchParams.delete("room");
                    url.searchParams.delete("date");
                    url.searchParams.delete("endDate");
                    window.history.replaceState({}, "", url.toString());
                    window.location.reload();
                  }}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl font-bold backdrop-blur-md text-xs sm:text-sm h-9 sm:h-10"
                >
                  Thay đổi lựa chọn
                </Button>
              </div>

              {f.loadingPrice && (
                <div className="mt-4 sm:mt-6 flex items-center gap-2 text-blue-100 text-[10px] sm:text-xs font-bold bg-black/10 w-max px-3 py-1.5 rounded-full animate-pulse">
                  <Loader2 className="w-3 h-3 animate-spin" /> Đang kiểm tra
                  phòng trống...
                </div>
              )}

              {f.pricing && !f.pricing.available && (
                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-red-500/90 border border-red-400 rounded-xl sm:rounded-2xl flex items-center gap-3 animate-in shake-1">
                  <span className="text-xl">⚠️</span>
                  <div>
                    <p className="font-black text-xs sm:text-sm">
                      Phòng không trống trong khoảng thời gian này!
                    </p>
                    <p className="text-xs text-red-100 font-medium">
                      Vui lòng chọn ngày khác hoặc phòng khác.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bước 1: Chọn phòng (Chỉ hiện nếu không phải quick action) */}
          {!f.isQuickAction && (
            <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
              <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
                <h2 className="text-base sm:text-xl font-bold flex items-center gap-2 sm:gap-3 text-gray-900 leading-tight">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                    <DoorOpen className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                  </div>
                  Bước 1 — Chọn phòng
                </h2>
                {f.selectedRoom && (
                  <div className="flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-[10px] font-black text-blue-700 uppercase tracking-tight">
                      {f.selectedRoom.name}
                    </span>
                  </div>
                )}
              </div>

              {f.loadingRooms ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 animate-pulse">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="border border-slate-100 rounded-2xl overflow-hidden space-y-3 bg-slate-50/50 p-3 h-full"
                    >
                      <div className="w-full h-32 bg-slate-200 rounded-xl" />
                      <div className="h-4 w-32 bg-slate-200 rounded-md" />
                      <div className="h-3 w-16 bg-slate-150 rounded-md" />
                    </div>
                  ))}
                </div>
              ) : (
                <RoomSelectionGrid
                  rooms={f.rooms}
                  selectedRoomId={f.selectedRoomId}
                  onSelect={(id) => f.setSelectedRoomId(id)}
                />
              )}
            </div>
          )}

          {/* Bước 2: Chọn ngày (Chỉ hiện nếu không phải quick action) */}
          {!f.isQuickAction && (
            <div
              className={cn(
                "bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 transition-all duration-500",
                !f.selectedRoomId &&
                  "opacity-50 pointer-events-none grayscale-[0.5]",
              )}
            >
              <h2 className="text-base sm:text-xl font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 text-gray-900 leading-tight">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 shrink-0">
                  <CalendarDays className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                </div>
                Bước 2 — Chọn ngày nhận / trả phòng
              </h2>

              {!f.selectedRoomId ? (
                <div className="py-12 sm:py-20 text-center bg-gray-50 rounded-xl sm:rounded-2xl border border-dashed border-gray-200">
                  <p className="text-gray-400 italic font-bold text-xs sm:text-sm">
                    Vui lòng hoàn tất Bước 1 để chọn ngày
                  </p>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                    <AdminInlineDateRangePicker
                      checkIn={f.checkIn}
                      checkOut={f.checkOut}
                      onChange={(checkIn, checkOut) => {
                        f.setCheckIn(checkIn);
                        f.setCheckOut(checkOut);
                      }}
                      defaultPrice={Number(f.selectedRoom?.price || 0)}
                      roomPriceDates={f.roomPriceDates}
                      soldOutDates={f.unavailableDays.map((d) => new Date(d))}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* CỘT PHẢI: THÔNG TIN KHÁCH & TỔNG KẾT (STICKY) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          <div className="sticky top-6 space-y-6">
            {/* Tóm tắt thời gian đặt phòng */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 space-y-3">
              <h2 className="text-sm font-bold flex items-center gap-2 text-gray-900 uppercase tracking-wider">
                <CalendarDays className="w-4 h-4 text-violet-600" />
                Thời gian lưu trú
              </h2>
              <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="p-1 sm:p-2 text-center border-r border-gray-200">
                  <span className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center justify-center">
                    Check-In
                  </span>
                  <div className="text-xs sm:text-base font-extrabold text-gray-800 mt-1">
                    {f.checkIn ? formatDate(f.checkIn) : "—"}
                  </div>
                </div>
                <div className="p-1 sm:p-2 text-center">
                  <span className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center justify-center">
                    Check-Out
                  </span>
                  <div className="text-xs sm:text-base font-extrabold text-gray-800 mt-1">
                    {f.checkOut ? formatDate(f.checkOut) : "—"}
                  </div>
                </div>
              </div>
            </div>

            {/* Bước 3: Thông tin khách hàng */}
            <div
              className={cn(
                "bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 transition-all duration-500",
                (!f.checkIn || !f.checkOut || !f.pricing?.available) &&
                  "opacity-50 pointer-events-none",
              )}
            >
              <h2 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 text-gray-900 leading-tight">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                Bước 3 — Thông tin khách
              </h2>

              <div className="space-y-3 sm:space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black text-gray-500 uppercase ml-1">
                    Họ tên *
                  </Label>
                  <Input
                    placeholder="Ví dụ: Nguyễn Văn A"
                    className="h-9.5 sm:h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white text-xs sm:text-sm"
                    value={f.guest.fullName}
                    onChange={(e) =>
                      f.setGuest({ ...f.guest, fullName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black text-gray-500 uppercase ml-1">
                    Số điện thoại *
                  </Label>
                  <Input
                    placeholder="0901234567"
                    className="h-9.5 sm:h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white text-xs sm:text-sm"
                    value={f.guest.phone}
                    onChange={(e) =>
                      f.setGuest({ ...f.guest, phone: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black text-gray-500 uppercase ml-1">
                    Email (Không bắt buộc)
                  </Label>
                  <Input
                    placeholder="nguyenvana@gmail.com"
                    className="h-9.5 sm:h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white text-xs sm:text-sm"
                    value={f.guest.email}
                    onChange={(e) =>
                      f.setGuest({ ...f.guest, email: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black text-gray-500 uppercase ml-1">
                      Người lớn *
                    </Label>
                    <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 overflow-hidden h-9.5 sm:h-11">
                      <button
                        type="button"
                        onClick={() => f.setAdults(Math.max(1, f.adults - 1))}
                        className="px-3 h-full hover:bg-gray-100 font-bold text-gray-600 transition-colors text-sm cursor-pointer"
                      >
                        -
                      </button>
                      <span className="flex-1 text-center font-bold text-xs sm:text-sm text-gray-800">
                        {f.adults}
                      </span>
                      <button
                        type="button"
                        onClick={() => f.setAdults(f.adults + 1)}
                        className="px-3 h-full hover:bg-gray-100 font-bold text-gray-600 transition-colors text-sm cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black text-gray-500 uppercase ml-1">
                      Trẻ em
                    </Label>
                    <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 overflow-hidden h-9.5 sm:h-11">
                      <button
                        type="button"
                        onClick={() =>
                          f.setChildren(Math.max(0, f.children - 1))
                        }
                        className="px-3 h-full hover:bg-gray-100 font-bold text-gray-600 transition-colors text-sm cursor-pointer"
                      >
                        -
                      </button>
                      <span className="flex-1 text-center font-bold text-xs sm:text-sm text-gray-800">
                        {f.children}
                      </span>
                      <button
                        type="button"
                        onClick={() => f.setChildren(f.children + 1)}
                        className="px-3 h-full hover:bg-gray-100 font-bold text-gray-600 transition-colors text-sm cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 sm:p-3 bg-violet-50 rounded-xl sm:rounded-2xl border border-violet-100">
                  <span className="text-[11px] sm:text-xs font-bold text-violet-900">
                    Tạo tài khoản & tích điểm?
                  </span>
                  <button
                    type="button"
                    onClick={() => f.setCreateAccount(!f.createAccount)}
                    className={`w-9 h-4.5 sm:w-10 sm:h-5 rounded-full transition-colors relative cursor-pointer ${f.createAccount ? "bg-violet-500" : "bg-gray-300"}`}
                  >
                    <div
                      className={`absolute top-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-white rounded-full transition-all ${f.createAccount ? "left-5 sm:left-5.5" : "left-0.5"}`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Bước 4: Thanh toán & Tóm tắt */}
            <div
              className={cn(
                "bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-[0_12px_40px_rgb(0,0,0,0.06)] border-2 border-primary/5 transition-all duration-500",
                (!f.checkIn ||
                  !f.checkOut ||
                  !f.guest.fullName ||
                  !f.guest.phone) &&
                  "opacity-50 pointer-events-none",
              )}
            >
              <h2 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 text-gray-900 leading-tight">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                  <Banknote className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                Bước 4 — Thanh toán
              </h2>

              {f.loadingPrice ? (
                <div className="space-y-3.5 animate-pulse">
                  <div className="p-3 sm:p-4 bg-gray-100/50 rounded-xl sm:rounded-2xl space-y-2.5">
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                    <div className="h-4 bg-gray-200 rounded w-1/2 pt-2 border-t border-dashed border-gray-200" />
                  </div>
                  <div className="h-10 bg-gray-200 rounded-xl w-full" />
                </div>
              ) : f.pricing ? (
                <div className="space-y-3.5 sm:space-y-4">
                  <div className="p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl space-y-2">
                    <div className="flex justify-between text-[11px] sm:text-xs font-bold text-gray-500">
                      <span>PHÒNG</span>
                      <span className="text-gray-900">
                        {f.selectedRoom?.name}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] sm:text-xs font-bold text-gray-500">
                      <span>THỜI GIAN</span>
                      <span className="text-gray-900">
                        {f.pricing.nights} đêm
                      </span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm pt-2 border-t border-dashed border-gray-200">
                      <span className="font-bold text-gray-900">Tổng cộng</span>
                      <span className="font-extrabold sm:font-black text-primary text-base sm:text-lg">
                        {f.pricing.rawTotal.toLocaleString()}₫
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black text-gray-500 uppercase ml-1">
                      Số tiền đã thu (₫)
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        className="h-9.5 sm:h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white font-black text-primary text-xs sm:text-sm"
                        value={f.paidAmount || ""}
                        onChange={(e) => f.setPaidAmount(+e.target.value)}
                      />
                      <Button
                        variant="outline"
                        className="h-9.5 sm:h-11 rounded-xl text-xs sm:text-sm px-3 cursor-pointer"
                        onClick={() => f.setPaidAmount(f.pricing!.rawTotal)}
                      >
                        Thu đủ
                      </Button>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className="w-full rounded-xl sm:rounded-2xl h-11 sm:h-14 font-black text-sm sm:text-lg bg-primary hover:bg-primary/90 text-white shadow-lg mt-3 sm:mt-4 cursor-pointer"
                    disabled={f.submitting || !f.pricing.available}
                    onClick={f.handleSubmit}
                  >
                    {f.submitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        Xác nhận đặt phòng
                      </>
                    )}
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Submitting Overlay */}
      {f.submitting && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-xs z-50 flex flex-col items-center justify-center gap-3 animate-in fade-in duration-200">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-sm font-bold text-gray-700">
            Đang khởi tạo đơn đặt phòng...
          </p>
        </div>
      )}
    </div>
  );
}

function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

interface AdminInlineDateRangePickerProps {
  checkIn: string;
  checkOut: string;
  onChange: (checkIn: string, checkOut: string) => void;
  defaultPrice: number;
  roomPriceDates: { date: string; price: number }[];
  soldOutDates: Date[];
}

export function AdminInlineDateRangePicker({
  checkIn,
  checkOut,
  onChange,
  defaultPrice,
  roomPriceDates,
  soldOutDates,
}: AdminInlineDateRangePickerProps) {
  const [currentMonth, setCurrentMonth] = React.useState<Date>(new Date());

  const selectedRange = React.useMemo<DateRange | undefined>(() => {
    if (!checkIn) return undefined;
    return {
      from: new Date(checkIn + "T00:00:00"),
      to: checkOut ? new Date(checkOut + "T00:00:00") : undefined,
    };
  }, [checkIn, checkOut]);

  const priceMap = React.useMemo(() => {
    const map = new Map<number, number>();
    roomPriceDates.forEach(({ date, price }) => {
      const d = new Date(date.includes("T") ? date : date + "T00:00:00");
      if (!isNaN(d.getTime())) {
        map.set(toDateKey(d), price);
      }
    });
    return map;
  }, [roomPriceDates]);

  const getPrice = React.useCallback(
    (date: Date) => priceMap.get(toDateKey(date)) ?? defaultPrice,
    [priceMap, defaultPrice],
  );

  const soldOutSet = React.useMemo(() => {
    return new Set(soldOutDates.map((d) => toDateKey(d)));
  }, [soldOutDates]);

  const isSoldOut = (date: Date) => {
    return soldOutSet.has(toDateKey(date));
  };

  const isRangeValid = (from: Date, to: Date) => {
    let d = new Date(from);
    while (d < to) {
      if (isSoldOut(d)) return false;
      d.setDate(d.getDate() + 1);
    }
    return true;
  };

  const handlePick = React.useCallback(
    (day?: Date) => {
      if (!day) return;

      const isSelectingCheckIn =
        !selectedRange || (selectedRange.from && selectedRange.to);
      if (isSelectingCheckIn && isSoldOut(day)) {
        toast.error(
          "Ngày này đã có khách đặt hoặc bị khóa, không thể chọn làm ngày nhận phòng!",
        );
        return;
      }

      const hasCompleteRange = selectedRange?.from && selectedRange?.to;
      if (!selectedRange || hasCompleteRange) {
        onChange(formatDateISO(day), "");
        return;
      }

      const from = selectedRange.from!;
      const isSameDay = from.getTime() === day.getTime();
      let newRange: DateRange = isSameDay
        ? { from, to: undefined }
        : day < from
          ? { from: day, to: from }
          : { from, to: day };

      if (newRange.from && newRange.to) {
        if (!isRangeValid(newRange.from, newRange.to)) {
          onChange(formatDateISO(day), "");
          toast.error(
            "Khoảng ngày đã chọn chứa ngày hết phòng. Vui lòng chọn khoảng khác.",
          );
          return;
        }
      }

      onChange(
        newRange.from ? formatDateISO(newRange.from) : "",
        newRange.to ? formatDateISO(newRange.to) : "",
      );
    },
    [selectedRange, onChange, soldOutSet],
  );

  return (
    <div className="w-full flex flex-col items-center justify-center p-2 bg-transparent">
      <div className="flex flex-col xl:flex-row gap-6 justify-center w-full">
        {[0, 1].map((i) => (
          <Calendar
            key={i}
            mode="range"
            selected={selectedRange}
            onDayClick={(day) => handlePick(day)}
            onSelect={() => {}}
            month={i === 0 ? currentMonth : addMonths(currentMonth, 1)}
            onMonthChange={(date) => {
              if (i === 0) {
                setCurrentMonth(date);
              } else {
                setCurrentMonth(addMonths(date, -1));
              }
            }}
            disabled={[{ before: new Date() }]}
            modifiers={{
              soldOut: (date) => isSoldOut(date),
            }}
            modifiersClassNames={{
              soldOut: "sold-out-day",
            }}
            getPrice={getPrice}
            defaultPrice={defaultPrice}
            showOutsideDays={false}
            className={`
              border-none shadow-none bg-transparent w-full max-w-60 sm:max-w-70 md:max-w-[320px]
              [--cell-size:1.8rem] sm:[--cell-size:2rem] md:[--cell-size:2.2rem] lg:[--cell-size:2.4rem]
              [&_.rdp-month_caption]:text-sm [&_.rdp-month_caption]:font-bold [&_.rdp-month_caption]:mb-1
              [&_.rdp-weekday]:text-[10px] [&_.rdp-weekday]:font-bold [&_.rdp-weekday]:text-gray-400 [&_.rdp-weekday]:uppercase [&_.rdp-weekday]:tracking-wider
              [&_.rdp-day]:text-[11px] [&_.rdp-day]:font-semibold [&_.rdp-day_selected]:bg-primary  
              [&_.rdp-day_selected:hover]:bg-primary/90
              [&_.rdp-day_range_middle]:bg-primary/20 
              [&_.rdp-day_range_middle:hover]:bg-primary/40
              [&_.rdp-day_start]:rounded-l-md [&_.rdp-day_end]:rounded-r-md
              [&_.rdp-day_outside]:hidden
              transition-colors duration-200
              ${i === 1 ? "hidden xl:block" : ""}
            `}
          />
        ))}
      </div>
    </div>
  );
}
