"use client";

import { Button } from "@/_components/ui/button";
import DateRangePicker from "@/_components/ui/date-range-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/_components/ui/dialog";
import { Input } from "@/_components/ui/input";
import { Label } from "@/_components/ui/label";
import { Textarea } from "@/_components/ui/textarea";
import { toDateKey } from "@/app/(pages)/admin/_utils/calendar";
import { parseAbsoluteDate } from "@/lib/utils";
import { get_unavailable_dates } from "@/services/bookingApi";
import { get_room_calendar } from "@/services/roomApi";
import { eachDayOfInterval, format, subDays } from "date-fns";
import {
  CalendarDays,
  Mail,
  MessageSquare,
  Minus,
  Phone,
  Plus,
  User,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DateRange } from "react-day-picker";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: any) => Promise<void>;
  booking: any;
}

export function AdminBookingUpdateDialog({
  open,
  onClose,
  onConfirm,
  booking,
}: Props) {
  const [range, setRange] = useState<DateRange | undefined>();
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialRequest, setSpecialRequest] = useState("");
  const [loading, setLoading] = useState(false);
  const [soldOutDates, setSoldOutDates] = useState<Date[]>([]);
  const [roomPrices, setRoomPrices] = useState<
    { date: string; price: number }[]
  >([]);
  const [waiveFee, setWaiveFee] = useState(false);

  useEffect(() => {
    if (open && booking) {
      setRange({
        from: parseAbsoluteDate(booking.checkIn),
        to: parseAbsoluteDate(booking.checkOut),
      });
      setAdults(booking?.adults || 1);
      setChildren(booking?.children || 0);
      setName(booking?.guestInfo?.fullName || booking?.user?.name || "");
      setEmail(booking?.guestInfo?.email || booking?.user?.email || "");
      setPhone(
        booking?.guestInfo?.phoneNumber || booking?.user?.phoneNumber || "",
      );
      setSpecialRequest(booking?.guestInfo?.specialRequest || "");

      if (booking?.room?.id) {
        // Lấy ngày bận (loại trừ booking hiện tại)
        get_unavailable_dates(booking.room.id, booking.id).then((dates) => {
          const parsed = dates.map((d: string) => new Date(d + "T00:00:00"));
          setSoldOutDates(parsed);
        });

        // Lấy lịch giá
        const now = new Date();
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        Promise.all([
          get_room_calendar(
            booking.room.id,
            now.getMonth() + 1,
            now.getFullYear(),
          ),
          get_room_calendar(
            booking.room.id,
            nextMonth.getMonth() + 1,
            nextMonth.getFullYear(),
          ),
        ]).then(([cal1, cal2]) => {
          const combined = [...(cal1.calendar || []), ...(cal2.calendar || [])];
          const prices = combined
            .filter((day: any) => day.price !== Number(booking.room.price))
            .map((day: any) => ({ date: day.date, price: day.price }));
          setRoomPrices(prices);
        });
      }
      setWaiveFee(false);
    }
  }, [open, booking]);
  const currentTotal = Number(booking?.totalAmount || 0);

  const minDate = useMemo(() => {
    if (!booking?.checkIn) return new Date();
    const originalCheckIn = parseAbsoluteDate(booking.checkIn);
    const today = new Date();
    originalCheckIn.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return originalCheckIn.getTime() < today.getTime()
      ? originalCheckIn
      : today;
  }, [booking]);

  // Khóa ngày check-in nếu khách đã nhận phòng (check-in < hôm nay)
  const lockedFrom = useMemo(() => {
    if (!booking?.checkIn) return undefined;
    const originalCheckIn = parseAbsoluteDate(booking.checkIn);
    const today = new Date();
    originalCheckIn.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return originalCheckIn.getTime() < today.getTime()
      ? originalCheckIn
      : undefined;
  }, [booking]);

  const statusMap = useMemo(() => {
    const map = new Map<number, "AVAILABLE" | "BOOKED" | "BLOCKED">();
    soldOutDates.forEach((d) => {
      map.set(toDateKey(d), "BLOCKED");
    });
    return map;
  }, [soldOutDates]);

  const getPrice = useCallback(
    (date: Date) => {
      const dateKey = format(date, "yyyy-MM-dd");
      const override = roomPrices.find((p) => p.date === dateKey);
      return override ? override.price : Number(booking?.room?.price || 0);
    },
    [roomPrices, booking],
  );
  const previewPrice = useMemo(() => {
    if (!range?.from || !range?.to || !booking?.room) return null;
    try {
      const days = eachDayOfInterval({
        start: range.from,
        end: subDays(range.to, 1),
      });
      let rawTotal = 0;
      const basePrice = Number(booking.room.price || 0);
      days.forEach((day) => {
        const dateKey = format(day, "yyyy-MM-dd");
        const override = roomPrices.find((p) => p.date === dateKey);
        rawTotal += override ? override.price : basePrice;
      });
      const originalRaw = Number(booking.rawTotalPrice || 1);
      const originalDiscount = Number(booking.discountAmount || 0);
      const originalTotal = Number(booking.totalAmount || 0);
      const paidAmount = Number(booking.paidAmount || 0);

      const fixedFees = Math.max(
        0,
        originalTotal - (originalRaw - originalDiscount),
      );

      const discountPercent = originalDiscount / originalRaw;
      const newDiscount = Math.round(rawTotal * discountPercent);
      const newTotal = rawTotal - newDiscount + fixedFees;

      const priceDiff = newTotal - originalTotal;
      const actualDiff = newTotal - paidAmount;

      return {
        rawTotal,
        discount: newDiscount,
        total: newTotal,
        priceDiff,
        actualDiff,
        nights: days.length,
        fixedFees,
      };
    } catch (e) {
      return null;
    }
  }, [range, roomPrices, booking, currentTotal]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const data: any = {};

      if (
        range?.from &&
        format(range.from, "yyyy-MM-dd") !== booking?.checkIn
      ) {
        data.checkIn = format(range.from, "yyyy-MM-dd");
      }
      if (range?.to && format(range.to, "yyyy-MM-dd") !== booking?.checkOut) {
        data.checkOut = format(range.to, "yyyy-MM-dd");
      }
      if (adults !== booking?.adults) data.adults = adults;
      if (children !== (booking?.children || 0)) data.children = children;
      if (name !== (booking?.guestInfo?.fullName || booking?.user?.name || ""))
        data.guestFullName = name;
      if (email !== (booking?.guestInfo?.email || booking?.user?.email || ""))
        data.guestEmail = email;
      if (
        phone !==
        (booking?.guestInfo?.phoneNumber || booking?.user?.phoneNumber || "")
      )
        data.guestPhoneNumber = phone;
      if (specialRequest !== (booking?.guestInfo?.specialRequest || ""))
        data.specialRequest = specialRequest;

      if (waiveFee) data.waiveFee = true;

      await onConfirm(data);
    } finally {
      setLoading(false);
    }
  };

  const isChanged = () => {
    if (range?.from && format(range.from, "yyyy-MM-dd") !== booking?.checkIn)
      return true;
    if (range?.to && format(range.to, "yyyy-MM-dd") !== booking?.checkOut)
      return true;
    if (adults !== booking?.adults) return true;
    if (children !== (booking?.children || 0)) return true;
    if (name !== (booking?.guestInfo?.fullName || booking?.user?.name || ""))
      return true;
    if (email !== (booking?.guestInfo?.email || booking?.user?.email || ""))
      return true;
    if (
      phone !==
      (booking?.guestInfo?.phoneNumber || booking?.user?.phoneNumber || "")
    )
      return true;
    if (specialRequest !== (booking?.guestInfo?.specialRequest || ""))
      return true;
    if (waiveFee) return true;
    return false;
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-[95vw] sm:max-w-175 p-0 overflow-hidden bg-white rounded-3xl max-h-[90vh] flex flex-col">
        <div className="p-4.5 sm:p-6 pb-3 sm:pb-4 shrink-0">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-2xl font-black text-slate-850">
              Sửa thông tin đặt phòng
            </DialogTitle>
            <DialogDescription className="text-[10px] sm:text-sm text-gray-500 mt-1 sm:mt-2">
              Bạn có thể thay đổi ngày, số lượng khách và thông tin liên lạc.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50/50 overflow-y-auto space-y-4 sm:space-y-8 flex-1 border-y border-gray-100">
          <div className="space-y-2">
            <Label className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-2">
              <CalendarDays className="w-3.5 h-3.5 sm:w-4 text-primary" />
              1. Lịch trình
            </Label>
            <div className="space-y-3 sm:space-y-4 bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.04)]">
              <div className="grid grid-cols-2 gap-2 p-2 sm:p-3 bg-gray-50/50 rounded-xl sm:rounded-2xl border border-gray-100">
                <div className="p-1 sm:p-2 text-center border-r border-gray-200/50">
                  <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Nhận phòng
                  </span>
                  <div className="text-xs sm:text-[15px] font-bold sm:font-black text-gray-800 mt-1">
                    {range?.from
                      ? format(range.from, "dd/MM/yyyy")
                      : "Chưa chọn"}
                  </div>
                </div>
                <div className="p-1 sm:p-2 text-center">
                  <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    Trả phòng
                  </span>
                  <div className="text-xs sm:text-[15px] font-bold sm:font-black text-gray-800 mt-1">
                    {range?.to ? format(range.to, "dd/MM/yyyy") : "Chưa chọn"}
                  </div>
                </div>
              </div>

              <div className="flex justify-center w-full">
                {lockedFrom && (
                  <p className="text-[10px] sm:text-xs text-amber-700 font-bold bg-amber-50 border border-amber-100 rounded-lg px-3 py-1.5 mb-3 w-full text-center">
                    🔒 Khách đã nhận phòng — Chỉ cho phép đổi ngày trả phòng
                  </p>
                )}
                <DateRangePicker
                  value={range}
                  onChange={setRange}
                  statusMap={statusMap}
                  getPrice={getPrice}
                  defaultPrice={booking?.room?.price}
                  minDate={minDate}
                  lockedFrom={lockedFrom}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-3.5 h-3.5 sm:w-4 text-primary" />
              2. Số lượng khách
            </Label>
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-100 space-y-3.5 sm:space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                    Người lớn
                  </h4>
                  <p className="text-[10px] sm:text-xs text-gray-500">
                    Tối đa {booking?.room?.adultCapacity}
                  </p>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 rounded-full p-0.5 sm:p-1 border border-gray-100">
                  <button
                    onClick={() => setAdults((prev) => Math.max(1, prev - 1))}
                    disabled={adults <= 1}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white flex items-center justify-center text-gray-600 shadow-sm disabled:opacity-50"
                  >
                    <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                  <span className="w-3 sm:w-4 text-center text-xs sm:text-sm font-bold text-gray-900">
                    {adults}
                  </span>
                  <button
                    onClick={() =>
                      setAdults((prev) =>
                        Math.min(booking?.room?.adultCapacity || 1, prev + 1),
                      )
                    }
                    disabled={adults >= (booking?.room?.adultCapacity || 1)}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white flex items-center justify-center text-gray-600 shadow-sm disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                    Trẻ em
                  </h4>
                  <p className="text-[10px] sm:text-xs text-gray-500">
                    Tối đa {booking?.room?.childCapacity || 0}
                  </p>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 rounded-full p-0.5 sm:p-1 border border-gray-100">
                  <button
                    onClick={() => setChildren((prev) => Math.max(0, prev - 1))}
                    disabled={children <= 0}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white flex items-center justify-center text-gray-600 shadow-sm disabled:opacity-50"
                  >
                    <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                  <span className="w-3 sm:w-4 text-center text-xs sm:text-sm font-bold text-gray-900">
                    {children}
                  </span>
                  <button
                    onClick={() =>
                      setChildren((prev) =>
                        Math.min(booking?.room?.childCapacity || 0, prev + 1),
                      )
                    }
                    disabled={children >= (booking?.room?.childCapacity || 0)}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white flex items-center justify-center text-gray-600 shadow-sm disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-2">
              <User className="w-3.5 h-3.5 sm:w-4 text-primary" />
              3. Thông tin liên hệ
            </Label>

            <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-gray-100 space-y-3 sm:space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase ml-1">
                  Họ và tên
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 sm:top-3 w-4 h-4 text-gray-400" />
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nhập họ tên khách hàng"
                    className="pl-10 h-9 sm:h-11 rounded-xl border-gray-200 focus:ring-primary bg-gray-50 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase ml-1">
                    Số điện thoại
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 sm:top-3 w-4 h-4 text-gray-400" />
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="09xxx"
                      className="pl-10 h-9 sm:h-11 rounded-xl border-gray-200 focus:ring-primary bg-gray-50 text-xs sm:text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase ml-1">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 sm:top-3 w-4 h-4 text-gray-400" />
                    <Input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      placeholder="email@example.com"
                      className="pl-10 h-9 sm:h-11 rounded-xl border-gray-200 focus:ring-primary bg-gray-50 text-xs sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase ml-1">
                  Yêu cầu đặc biệt
                </Label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-2.5 sm:top-3 w-4 h-4 text-gray-400" />
                  <Textarea
                    value={specialRequest}
                    onChange={(e) => setSpecialRequest(e.target.value)}
                    placeholder="Ví dụ: Phòng tầng cao, nệm phụ, check-in sớm..."
                    className="pl-10 min-h-18.75 sm:min-h-25 rounded-xl border-gray-200 focus:ring-primary pt-2 bg-gray-50 text-xs sm:text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2.5 mt-3.5 bg-amber-50 p-3 sm:p-4 rounded-xl border border-amber-100">
              <input
                type="checkbox"
                id="waiveFee"
                checked={waiveFee}
                onChange={(e) => setWaiveFee(e.target.checked)}
                className="mt-0.5 w-3.5 h-3.5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
              />
              <div className="space-y-0.5">
                <Label
                  htmlFor="waiveFee"
                  className="text-xs sm:text-sm text-amber-900 font-bold cursor-pointer"
                >
                  Miễn phụ phí chênh lệch (Admin Override)
                </Label>
                <p className="text-[10px] sm:text-xs text-amber-700 leading-tight">
                  Khi đổi sang ngày có giá đắt hơn, hệ thống sẽ bỏ qua phần phụ
                  thu chênh lệch giá.
                </p>
              </div>
            </div>
            {/* Financial Impact Preview */}
            {previewPrice && isChanged() && (
              <div className="bg-slate-900 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 text-white shadow-xl space-y-4 sm:space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5 sm:pb-4">
                  <div className="space-y-0.5">
                    <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                      Xác nhận thay đổi
                    </p>
                    <h3 className="text-sm sm:text-lg font-bold">
                      Tóm tắt cập nhật
                    </h3>
                  </div>
                  <div className="px-2 py-0.5 bg-white/10 rounded-full border border-white/10">
                    <span className="text-[10px] sm:text-xs font-bold text-white/80">
                      {previewPrice.nights} đêm
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {/* Date Change */}
                  <div className="space-y-2 sm:space-y-3">
                    <p className="text-[9px] sm:text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5" /> Lịch trình
                    </p>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                        <p className="text-[11px] sm:text-xs text-white/40 line-through">
                          {format(new Date(booking.checkIn), "dd/MM")} -{" "}
                          {format(new Date(booking.checkOut), "dd/MM")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <p className="text-xs sm:text-sm font-bold text-white">
                          {format(range?.from!, "dd/MM")} -{" "}
                          {format(range?.to!, "dd/MM")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Guest Change */}
                  <div className="space-y-2 sm:space-y-3">
                    <p className="text-[9px] sm:text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" /> Khách lưu trú
                    </p>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                        <p className="text-[11px] sm:text-xs text-white/40 line-through">
                          {booking.adults} Người lớn{" "}
                          {booking.children > 0 &&
                            `, ${booking.children} Trẻ em`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <p className="text-xs sm:text-sm font-bold text-white">
                          {adults} Người lớn{" "}
                          {children > 0 && `, ${children} Trẻ em`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price Impact */}
                <div className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10 space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <span className="text-white/60">Tổng giá trị đơn mới:</span>
                    <span className="font-extrabold text-base sm:text-xl text-primary">
                      {previewPrice.total.toLocaleString()}₫
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2.5 sm:pt-3 border-t border-white/10">
                    <div className="space-y-0.5">
                      <span className="text-[9px] sm:text-[10px] font-bold text-white/40 uppercase tracking-widest">
                        Chênh lệch tổng đơn
                      </span>
                      <p className="text-xs sm:text-sm font-bold text-white/60">
                        {previewPrice.priceDiff > 0 ? "+" : ""}
                        {previewPrice.priceDiff.toLocaleString()}₫
                      </p>
                    </div>

                    <div className="text-right space-y-0.5">
                      <span className="text-[9px] sm:text-[10px] font-bold text-white/40 uppercase tracking-widest">
                        {previewPrice.actualDiff > 0
                          ? "Khách cần trả thêm"
                          : "Cần hoàn trả khách"}
                      </span>
                      <p
                        className={`text-xs sm:text-sm font-black ${previewPrice.actualDiff > 0 ? "text-rose-400" : "text-emerald-400"}`}
                      >
                        {Math.abs(previewPrice.actualDiff).toLocaleString()}₫
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Financial Impact Preview */}
            {booking && (
              <div className="mt-4 bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-sm">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  Tổng quan tài chính hiện tại
                </p>
                <div className="flex justify-between">
                  <span className="text-slate-600">Tổng đơn</span>
                  <span className="font-bold text-gray-900">
                    {Number(booking.totalAmount || 0).toLocaleString()}₫
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Đã thanh toán</span>
                  <span className="font-bold text-green-600">
                    {Number(booking.paidAmount || 0).toLocaleString()}₫
                  </span>
                </div>
                {Number(booking.refundAmount || 0) > 0 && (
                  <div className="flex justify-between pt-1 border-t border-dashed border-slate-200">
                    <span className="text-amber-700 font-bold">
                      Đang chờ hoàn
                    </span>
                    <span className="font-black text-amber-700">
                      {Number(booking.refundAmount).toLocaleString()}₫
                    </span>
                  </div>
                )}
                {booking.bankInfo?.bankAccountNumber && (
                  <div className="pt-1 border-t border-dashed border-slate-200 text-xs text-slate-500">
                    NH: {booking.bankInfo.bankName} —{" "}
                    {booking.bankInfo.bankAccountNumber} (
                    {booking.bankInfo.bankAccountName})
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 bg-white flex items-center justify-end gap-3 shrink-0">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={loading}
            className="rounded-full font-bold hover:bg-gray-100"
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !isChanged()}
            className="rounded-full font-bold px-8 bg-gray-900 hover:bg-gray-800 text-white"
          >
            {loading ? "Đang xử lý..." : "Lưu thay đổi"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
