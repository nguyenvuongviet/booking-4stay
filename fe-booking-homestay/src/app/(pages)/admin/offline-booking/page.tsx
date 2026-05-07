"use client";

import { Button } from "@/_components/ui/button";
import { Input } from "@/_components/ui/input";
import { Label } from "@/_components/ui/label";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/date";
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
import CalendarGrid from "../_components/calendar/CalendarGrid";
import { RoomSelectionGrid } from "./_components/RoomSelectionGrid";
import { useManualBookingForm } from "./_hooks/useManualBookingForm";

export default function ManualBookingPage() {
  const f = useManualBookingForm();

  if (f.success) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-green-700">
          Tạo đơn thành công!
        </h1>
        <p className="text-gray-600">
          Đơn đặt phòng thủ công đã được tạo.
          {f.createdBookingId && (
            <span>
              {" "}
              Mã đơn: <strong>#{f.createdBookingId}</strong>
            </span>
          )}
        </p>
        <div className="flex gap-3 justify-center pt-4">
          <Button onClick={f.reset} variant="outline" className="gap-2">
            <RotateCcw className="w-4 h-4" /> Tạo đơn mới
          </Button>
          <Link href="/admin/bookings">
            <Button className="gap-2">
              <CalendarDays className="w-4 h-4" /> Xem danh sách
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-gray-100">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3 text-gray-900">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
              <NotebookPen className="w-6 h-6" />
            </div>
            Tạo đơn đặt phòng thủ công
          </h1>
          <p className="text-gray-500 mt-2 ml-15 text-base">
            Xử lý nhanh các yêu cầu đặt phòng trực tiếp hoặc qua điện thoại.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Button
            variant="outline"
            onClick={f.reset}
            className="rounded-xl border-gray-200"
          >
            <RotateCcw className="w-4 h-4 mr-2" /> Làm mới
          </Button>
          <Link href="/admin/bookings">
            <Button variant="ghost" className="rounded-xl text-gray-500">
              Hủy bỏ
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* CỘT TRÁI: CHỌN PHÒNG & CHỌN NGÀY */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          {f.isQuickAction && f.selectedRoom && (
            <div className="bg-blue-600 p-8 rounded-4xl text-white shadow-xl shadow-blue-200 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <p className="text-blue-100 font-black uppercase tracking-widest text-[10px] mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Chế độ đặt phòng
                    nhanh
                  </p>
                  <h3 className="text-3xl font-black mb-1">
                    {f.selectedRoom.name}
                  </h3>
                  <p className="text-blue-50 font-bold text-lg flex items-center gap-2">
                    {formatDate(f.checkIn)} — {formatDate(f.checkOut)}
                    {f.pricing && (
                      <span className="bg-white/20 px-2 py-0.5 rounded-lg text-sm font-black">
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
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl font-bold backdrop-blur-md"
                >
                  Thay đổi lựa chọn
                </Button>
              </div>

              {f.loadingPrice && (
                <div className="mt-6 flex items-center gap-2 text-blue-100 text-xs font-bold bg-black/10 w-max px-3 py-1.5 rounded-full animate-pulse">
                  <Loader2 className="w-3 h-3 animate-spin" /> Đang kiểm tra
                  phòng trống...
                </div>
              )}

              {f.pricing && !f.pricing.available && (
                <div className="mt-6 p-4 bg-red-500/90 border border-red-400 rounded-2xl flex items-center gap-3 animate-in shake-1">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <p className="font-black text-sm">
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
            <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-3 text-gray-900">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <DoorOpen className="w-5 h-5" />
                  </div>
                  Bước 1 — Chọn phòng
                </h2>
                {f.selectedRoom && (
                  <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-black text-blue-700 uppercase tracking-tight">
                      {f.selectedRoom.name}
                    </span>
                  </div>
                )}
              </div>

              {f.loadingRooms ? (
                <div className="flex items-center justify-center py-12 text-gray-500 gap-2">
                  <Loader2 className="w-6 h-6 animate-spin" /> Đang tải phòng...
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
                "bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 transition-all duration-500",
                !f.selectedRoomId &&
                  "opacity-50 pointer-events-none grayscale-[0.5]",
              )}
            >
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-gray-900">
                <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600">
                  <CalendarDays className="w-5 h-5" />
                </div>
                Bước 2 — Chọn ngày nhận / trả phòng
              </h2>

              {!f.selectedRoomId ? (
                <div className="py-20 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <p className="text-gray-400 italic font-bold">
                    Vui lòng hoàn tất Bước 1 để chọn ngày
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                    <CalendarGrid
                      roomId={f.selectedRoomId || undefined}
                      defaultPrice={Number(f.selectedRoom?.price || 0)}
                      roomPriceDates={f.roomPriceDates}
                      soldOutDates={f.unavailableDays.map((d) => new Date(d))}
                      mode="selection"
                      onSelectionChange={(dates) => {
                        if (dates.length > 0) {
                          const sorted = [...dates].sort(
                            (a, b) => a.getTime() - b.getTime(),
                          );
                          const first = sorted[0];
                          const last = sorted[sorted.length - 1];
                          const formatLocal = (d: Date) => {
                            const offset = d.getTimezoneOffset() * 60000;
                            return new Date(d.getTime() - offset)
                              .toISOString()
                              .split("T")[0];
                          };
                          f.setCheckIn(formatLocal(first));
                          if (sorted.length > 1)
                            f.setCheckOut(formatLocal(last));
                          else f.setCheckOut("");
                        } else {
                          f.setCheckIn("");
                          f.setCheckOut("");
                        }
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="p-3 text-center border-r border-gray-200">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
                        Check-In
                      </span>
                      <div className="text-lg font-black text-gray-800 mt-2">
                        {f.checkIn ? formatDate(f.checkIn) : "—"}
                      </div>
                    </div>
                    <div className="p-3 text-center">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
                        Check-Out
                      </span>
                      <div className="text-lg font-black text-gray-800 mt-2">
                        {f.checkOut ? formatDate(f.checkOut) : "—"}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* CỘT PHẢI: THÔNG TIN KHÁCH & TỔNG KẾT (STICKY) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          <div className="sticky top-6 space-y-6">
            {/* Bước 3: Thông tin khách hàng */}
            <div
              className={cn(
                "bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 transition-all duration-500",
                (!f.checkIn || !f.checkOut || !f.pricing?.available) &&
                  "opacity-50 pointer-events-none",
              )}
            >
              <h2 className="text-lg font-bold mb-6 flex items-center gap-3 text-gray-900">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <User className="w-4 h-4" />
                </div>
                Bước 3 — Thông tin khách
              </h2>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black text-gray-500 uppercase ml-1">
                    Họ tên *
                  </Label>
                  <Input
                    placeholder="Ví dụ: Nguyễn Văn A"
                    className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white"
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
                    className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white"
                    value={f.guest.phone}
                    onChange={(e) =>
                      f.setGuest({ ...f.guest, phone: e.target.value })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-violet-50 rounded-2xl border border-violet-100">
                  <span className="text-xs font-bold text-violet-900">
                    Tạo tài khoản & tích điểm?
                  </span>
                  <button
                    type="button"
                    onClick={() => f.setCreateAccount(!f.createAccount)}
                    className={`w-10 h-5 rounded-full transition-colors relative ${f.createAccount ? "bg-violet-500" : "bg-gray-300"}`}
                  >
                    <div
                      className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${f.createAccount ? "left-5.5" : "left-0.5"}`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Bước 4: Thanh toán & Tóm tắt */}
            <div
              className={cn(
                "bg-white p-6 rounded-3xl shadow-[0_12px_40px_rgb(0,0,0,0.06)] border-2 border-primary/5 transition-all duration-500",
                (!f.checkIn ||
                  !f.checkOut ||
                  !f.guest.fullName ||
                  !f.guest.phone) &&
                  "opacity-50 pointer-events-none",
              )}
            >
              <h2 className="text-lg font-bold mb-6 flex items-center gap-3 text-gray-900">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                  <Banknote className="w-4 h-4" />
                </div>
                Bước 4 — Thanh toán
              </h2>

              {f.pricing && (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-2xl space-y-2">
                    <div className="flex justify-between text-xs font-bold text-gray-500">
                      <span>PHÒNG</span>
                      <span className="text-gray-900">
                        {f.selectedRoom?.name}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-gray-500">
                      <span>THỜI GIAN</span>
                      <span className="text-gray-900">
                        {f.pricing.nights} đêm
                      </span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-dashed border-gray-200">
                      <span className="font-bold text-gray-900">Tổng cộng</span>
                      <span className="font-black text-primary text-lg">
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
                        className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white font-black text-primary"
                        value={f.paidAmount || ""}
                        onChange={(e) => f.setPaidAmount(+e.target.value)}
                      />
                      <Button
                        variant="outline"
                        className="h-11 rounded-xl"
                        onClick={() => f.setPaidAmount(f.pricing!.rawTotal)}
                      >
                        Thu đủ
                      </Button>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className="w-full rounded-2xl h-14 font-black text-lg bg-primary hover:bg-primary/90 text-white shadow-lg mt-4"
                    disabled={f.submitting || !f.pricing.available}
                    onClick={f.handleSubmit}
                  >
                    {f.submitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Xác nhận đặt phòng
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
