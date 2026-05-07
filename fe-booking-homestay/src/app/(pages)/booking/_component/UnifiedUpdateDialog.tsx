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
import { parseAbsoluteDate } from "@/lib/utils";
import { get_unavailable_dates, update_booking } from "@/services/bookingApi";
import { get_room_calendar } from "@/services/roomApi";
import { eachDayOfInterval, format, subDays } from "date-fns";
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  CalendarDays,
  CheckCircle,
  Loader2,
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
import toast from "react-hot-toast";
import { toDateKey } from "../../admin/_utils/calendar";

interface Props {
  open: boolean;
  onClose: () => void;
  onUpdated: (newBooking: any, message: string) => void;
  booking: any;
  initialStep?: Step;
}

type Step = "edit" | "bank-info" | "success";

export function UnifiedUpdateDialog({
  open,
  onClose,
  onUpdated,
  booking,
  initialStep,
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

  // Step 2: Bank info for refund
  const [step, setStep] = useState<Step>("edit");
  const [refundInfo, setRefundInfo] = useState<{
    refundAmount: number;
    oldTotal: number;
    newTotal: number;
  } | null>(null);
  const [bankName, setBankName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [bankLoading, setBankLoading] = useState(false);

  useEffect(() => {
    if (open && booking) {
      // Xác định bước khởi đầu
      if (initialStep) {
        setStep(initialStep);
        if (initialStep === "bank-info") {
          setRefundInfo({
            refundAmount: Number(booking.refundAmount || 0),
            oldTotal: 0,
            newTotal: Number(booking.totalAmount || 0),
          });
        } else {
          setRefundInfo(null);
        }
      } else {
        // Nếu không có initialStep truyền vào -> tự động nhận diện
        const hasRefundPending =
          Number(booking.refundAmount || 0) > 0 &&
          !booking.bankInfo?.bankAccountNumber;

        if (hasRefundPending) {
          setStep("bank-info");
          setRefundInfo({
            refundAmount: Number(booking.refundAmount),
            oldTotal: 0,
            newTotal: Number(booking.totalAmount),
          });
        } else {
          setStep("edit");
          setRefundInfo(null);
        }
      }

      setBankName(booking.bankInfo?.bankName || "");
      setBankAccountNumber(booking.bankInfo?.bankAccountNumber || "");
      setBankAccountName(booking.bankInfo?.bankAccountName || "");

      setRange({
        from: parseAbsoluteDate(booking.checkIn),
        to: parseAbsoluteDate(booking.checkOut),
      });
      setAdults(booking.adults);
      setChildren(booking.children || 0);
      setName(booking.guestInfo?.fullName || booking.user?.name || "");
      setEmail(booking.guestInfo?.email || booking.user?.email || "");
      setPhone(
        booking.guestInfo?.phoneNumber || booking.user?.phoneNumber || "",
      );
      setSpecialRequest(booking.guestInfo?.specialRequest || "");

      if (booking.room?.id) {
        get_unavailable_dates(booking.room.id, booking.id).then((dates) => {
          const parsed = dates.map((d: string) => new Date(d + "T00:00:00"));
          setSoldOutDates(parsed);
        });

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
            .filter((day: any) => day.price !== Number(booking.room?.price))
            .map((day: any) => ({ date: day.date, price: day.price }));
          setRoomPrices(prices);
        });
      }
    }
  }, [open]);

  const currentTotal = Number(booking.totalAmount || 0);

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
      return override ? override.price : Number(booking.room?.price || 0);
    },
    [roomPrices, booking.room?.price],
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

      // Tính toán các khoản phí cố định (như phí dọn dẹp, phí dịch vụ...)
      // bằng cách lấy Tổng tiền thanh toán trừ đi (Tiền phòng gốc - Giảm giá)
      const fixedFees = Math.max(0, originalTotal - (originalRaw - originalDiscount));

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

      if (range?.from && format(range.from, "yyyy-MM-dd") !== booking.checkIn) {
        data.checkIn = format(range.from, "yyyy-MM-dd");
      }
      if (range?.to && format(range.to, "yyyy-MM-dd") !== booking.checkOut) {
        data.checkOut = format(range.to, "yyyy-MM-dd");
      }
      if (adults !== booking.adults) data.adults = adults;
      if (children !== (booking.children || 0)) data.children = children;
      if (name !== (booking.guestInfo?.fullName || booking.user?.name || ""))
        data.guestFullName = name;
      if (email !== (booking.guestInfo?.email || booking.user?.email || ""))
        data.guestEmail = email;
      if (
        phone !==
        (booking.guestInfo?.phoneNumber || booking.user?.phoneNumber || "")
      )
        data.guestPhoneNumber = phone;
      if (specialRequest !== (booking.guestInfo?.specialRequest || ""))
        data.specialRequest = specialRequest;

      // Gọi API update
      const resp = await update_booking(booking.id, data);
      const newBooking = resp.data?.booking;
      const message = resp.data?.message || "Cập nhật thành công!";

      // Cập nhật booking cho parent
      onUpdated(newBooking, message);
      onClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || "Không thể cập nhật. Vui lòng thử lại.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitBankInfo = async () => {
    if (
      !bankName.trim() ||
      !bankAccountNumber.trim() ||
      !bankAccountName.trim()
    ) {
      toast.error("Vui lòng nhập đầy đủ thông tin tài khoản ngân hàng");
      return;
    }

    setBankLoading(true);
    try {
      const resp = await update_booking(booking.id, {
        bankName: bankName.trim(),
        bankAccountNumber: bankAccountNumber.trim(),
        bankAccountName: bankAccountName.trim().toUpperCase(),
      });
      const newBooking = resp.data?.booking;
      if (newBooking) {
        onUpdated(newBooking, "Đã cập nhật thông tin ngân hàng thành công!");
      }
      setStep("success");
      toast.success("Đã gửi thông tin nhận hoàn tiền thành công!");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Gửi thông tin ngân hàng thất bại",
      );
    } finally {
      setBankLoading(false);
    }
  };

  const isChanged = () => {
    if (range?.from && format(range.from, "yyyy-MM-dd") !== booking.checkIn)
      return true;
    if (range?.to && format(range.to, "yyyy-MM-dd") !== booking.checkOut)
      return true;
    if (adults !== booking.adults) return true;
    if (children !== (booking.children || 0)) return true;
    if (name !== (booking.guestInfo?.fullName || booking.user?.name || ""))
      return true;
    if (email !== (booking.guestInfo?.email || booking.user?.email || ""))
      return true;
    if (
      phone !==
      (booking.guestInfo?.phoneNumber || booking.user?.phoneNumber || "")
    )
      return true;
    if (specialRequest !== (booking.guestInfo?.specialRequest || ""))
      return true;
    return false;
  };

  const handleClose = () => {
    setStep("edit");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-white rounded-3xl max-h-[90vh] flex flex-col">
        {/* ─── Step 1: Edit Form ─── */}
        {step === "edit" && (
          <>
            <div className="p-6 pb-4 shrink-0">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-2xl font-black text-gray-900">
                  Sửa thông tin đặt phòng
                </DialogTitle>
                <DialogDescription className="text-gray-500 mt-2">
                  Bạn có thể thay đổi ngày, số lượng khách và thông tin liên
                  lạc.
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="px-6 py-4 bg-gray-50/50 overflow-y-auto space-y-8 flex-1 border-y border-gray-100">
              <div className="space-y-3">
                <Label className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-primary" />
                  1. Lịch trình
                </Label>
                <div className="space-y-4 bg-white p-5 rounded-3xl border border-gray-100 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.04)]">
                  <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50/50 rounded-2xl border border-gray-100">
                    <div className="p-2 text-center border-r border-gray-200/50">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Nhận phòng
                      </span>
                      <div className="text-[15px] font-black text-gray-800 mt-1">
                        {range?.from
                          ? format(range.from, "dd/MM/yyyy")
                          : "Chưa chọn"}
                      </div>
                    </div>
                    <div className="p-2 text-center">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        Trả phòng
                      </span>
                      <div className="text-[15px] font-black text-gray-800 mt-1">
                        {range?.to
                          ? format(range.to, "dd/MM/yyyy")
                          : "Chưa chọn"}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center w-full">
                    <DateRangePicker
                      value={range}
                      onChange={setRange}
                      statusMap={statusMap}
                      getPrice={getPrice}
                      defaultPrice={booking.room?.price}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  2. Số lượng khách
                </Label>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900">Người lớn</h4>
                      <p className="text-xs text-gray-500">
                        Tối đa {booking.room?.adultCapacity}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 bg-gray-50 rounded-full p-1 border border-gray-100">
                      <button
                        onClick={() =>
                          setAdults((prev) => Math.max(1, prev - 1))
                        }
                        disabled={adults <= 1}
                        className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-600 shadow-sm disabled:opacity-50"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-4 text-center font-bold text-gray-900">
                        {adults}
                      </span>
                      <button
                        onClick={() =>
                          setAdults((prev) =>
                            Math.min(
                              booking.room?.adultCapacity || 1,
                              prev + 1,
                            ),
                          )
                        }
                        disabled={adults >= (booking.room?.adultCapacity || 1)}
                        className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-600 shadow-sm disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900">Trẻ em</h4>
                      <p className="text-xs text-gray-500">
                        Tối đa {booking.room?.childCapacity || 0}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 bg-gray-50 rounded-full p-1 border border-gray-100">
                      <button
                        onClick={() =>
                          setChildren((prev) => Math.max(0, prev - 1))
                        }
                        disabled={children <= 0}
                        className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-600 shadow-sm disabled:opacity-50"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-4 text-center font-bold text-gray-900">
                        {children}
                      </span>
                      <button
                        onClick={() =>
                          setChildren((prev) =>
                            Math.min(
                              booking.room?.childCapacity || 0,
                              prev + 1,
                            ),
                          )
                        }
                        disabled={
                          children >= (booking.room?.childCapacity || 0)
                        }
                        className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-600 shadow-sm disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  3. Thông tin liên hệ
                </Label>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-500 uppercase ml-1">
                      Họ và tên
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nhập họ tên khách hàng"
                        className="pl-10 h-11 rounded-xl border-gray-200 focus:ring-primary bg-gray-50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-500 uppercase ml-1">
                        Số điện thoại
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="09xxx"
                          className="pl-10 h-11 rounded-xl border-gray-200 focus:ring-primary bg-gray-50"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-500 uppercase ml-1">
                        Email
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          type="email"
                          placeholder="email@example.com"
                          className="pl-10 h-11 rounded-xl border-gray-200 focus:ring-primary bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-500 uppercase ml-1">
                      Yêu cầu đặc biệt
                    </Label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Textarea
                        value={specialRequest}
                        onChange={(e) => setSpecialRequest(e.target.value)}
                        placeholder="Ví dụ: Phòng tầng cao, nệm phụ, check-in sớm..."
                        className="pl-10 min-h-[100px] rounded-xl border-gray-200 focus:ring-primary pt-2.5 bg-gray-50"
                      />
                    </div>
                  </div>
                </div>

                {/* Financial Impact Preview */}
                {previewPrice && isChanged() && (
                  <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-2xl space-y-6 border border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                          Xác nhận thay đổi
                        </p>
                        <h3 className="text-lg font-bold">Tóm tắt cập nhật</h3>
                      </div>
                      <div className="px-3 py-1 bg-white/10 rounded-full border border-white/10">
                        <span className="text-xs font-bold text-white/80">
                          {previewPrice.nights} đêm
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      {/* Date Change */}
                      <div className="space-y-3">
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                          <CalendarDays className="w-3 h-3" /> Lịch trình
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                            <p className="text-xs text-white/40 line-through">
                              {format(new Date(booking.checkIn), "dd/MM")} - {format(new Date(booking.checkOut), "dd/MM")}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            <p className="text-sm font-bold text-white">
                              {format(range?.from!, "dd/MM")} - {format(range?.to!, "dd/MM")}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Guest Change */}
                      <div className="space-y-3">
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                          <Users className="w-3 h-3" /> Khách lưu trú
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                            <p className="text-xs text-white/40 line-through">
                              {booking.adults} Người lớn {booking.children > 0 && `, ${booking.children} Trẻ em`}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            <p className="text-sm font-bold text-white">
                              {adults} Người lớn {children > 0 && `, ${children} Trẻ em`}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Price Impact */}
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-white/60">Tổng giá trị đơn mới:</span>
                        <span className="font-black text-xl text-primary">
                          {previewPrice.total.toLocaleString()}₫
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/10">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                            Chênh lệch tổng đơn
                          </span>
                          <p className="text-sm font-bold text-white/60">
                            {previewPrice.priceDiff > 0 ? "+" : ""}{previewPrice.priceDiff.toLocaleString()}₫
                          </p>
                        </div>

                        <div className="text-right space-y-1">
                          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                            {previewPrice.actualDiff > 0 ? "Bạn cần trả thêm" : "Số tiền hoàn trả"}
                          </span>
                          <p className={`text-sm font-black ${previewPrice.actualDiff > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                            {Math.abs(previewPrice.actualDiff).toLocaleString()}₫
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 bg-white flex items-center justify-end gap-3 shrink-0">
              <Button
                type="button"
                variant="ghost"
                onClick={handleClose}
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
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  "Lưu thay đổi"
                )}
              </Button>
            </div>
          </>
        )}

        {/* ─── Step 2: Bank Info (khi có hoàn tiền chênh lệch) ─── */}
        {step === "bank-info" && refundInfo && (
          <>
            <div className="p-6 pb-4 shrink-0">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl font-black text-gray-900">
                  <Banknote className="w-5 h-5 text-amber-500" />
                  Thông tin nhận hoàn tiền
                </DialogTitle>
                <DialogDescription className="text-gray-500 mt-1">
                  Lịch trình đã được cập nhật. Vui lòng cung cấp thông tin ngân
                  hàng để nhận tiền hoàn trả.
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="px-6 py-4 overflow-y-auto flex-1 border-y border-gray-100 space-y-5">
              {/* Refund Summary */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <h4 className="text-sm font-bold text-amber-900">
                    Chi tiết hoàn tiền chênh lệch
                  </h4>
                </div>

                <div className="space-y-2 text-sm">
                  {refundInfo.oldTotal > 0 && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-amber-800">Tổng tiền cũ</span>
                        <span className="font-bold text-gray-700 line-through">
                          {refundInfo.oldTotal.toLocaleString()}₫
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-amber-800">Tổng tiền mới</span>
                        <span className="font-bold text-gray-900">
                          {refundInfo.newTotal.toLocaleString()}₫
                        </span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t border-amber-200">
                    <span className="text-amber-800 font-bold flex items-center gap-1">
                      <ArrowRight className="w-3 h-3" />
                      Số tiền hoàn trả
                    </span>
                    <span className="text-lg font-black text-green-600">
                      {refundInfo.refundAmount.toLocaleString()}₫
                    </span>
                  </div>
                </div>
              </div>

              {/* Bank Info Form */}
              <div className="space-y-4 bg-white p-5 rounded-2xl border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Thông tin tài khoản ngân hàng
                </p>

                <div className="space-y-1">
                  <Label className="text-[11px] text-gray-500 ml-1">
                    Tên ngân hàng
                  </Label>
                  <Input
                    placeholder="Ví dụ: Vietcombank, Techcombank, MB..."
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="rounded-xl border-gray-200 h-11"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-gray-500 ml-1">
                      Số tài khoản
                    </Label>
                    <Input
                      placeholder="Số tài khoản nhận tiền"
                      value={bankAccountNumber}
                      onChange={(e) => setBankAccountNumber(e.target.value)}
                      className="rounded-xl border-gray-200 h-11"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-gray-500 ml-1">
                      Chủ tài khoản
                    </Label>
                    <Input
                      placeholder="Tên in trên thẻ"
                      value={bankAccountName}
                      onChange={(e) =>
                        setBankAccountName(e.target.value.toUpperCase())
                      }
                      className="rounded-xl border-gray-200 h-11 uppercase"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700 leading-relaxed">
                <strong>Lưu ý:</strong> Số tiền hoàn sẽ được chuyển khoản thủ
                công bởi Quản trị viên sau khi xác nhận. Vui lòng đảm bảo thông
                tin ngân hàng chính xác.
              </div>
            </div>

            <div className="p-6 bg-white flex items-center justify-between shrink-0">
              <Button
                type="button"
                variant="ghost"
                onClick={handleClose}
                className="rounded-full font-bold text-gray-500 hover:bg-gray-100"
              >
                Để sau
              </Button>
              <Button
                type="button"
                onClick={handleSubmitBankInfo}
                disabled={bankLoading}
                className="rounded-full font-bold px-8 bg-amber-600 hover:bg-amber-700 text-white"
              >
                {bankLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  "Gửi thông tin nhận hoàn tiền"
                )}
              </Button>
            </div>
          </>
        )}

        {/* ─── Step 3: Success ─── */}
        {step === "success" && (
          <>
            <div className="p-8 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-black text-gray-900">
                Đã gửi thông tin thành công!
              </h3>
              <p className="text-gray-500 text-sm max-w-[400px] leading-relaxed">
                Thông tin ngân hàng của bạn đã được lưu. Quản trị viên sẽ xử lý
                hoàn tiền{" "}
                <span className="font-bold text-green-600">
                  {refundInfo?.refundAmount.toLocaleString()}₫
                </span>{" "}
                trong thời gian sớm nhất.
              </p>
            </div>
            <div className="p-6 bg-white flex justify-center shrink-0 border-t border-gray-100">
              <Button
                type="button"
                onClick={handleClose}
                className="rounded-full font-bold px-10 bg-gray-900 hover:bg-gray-800 text-white"
              >
                Đóng
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
