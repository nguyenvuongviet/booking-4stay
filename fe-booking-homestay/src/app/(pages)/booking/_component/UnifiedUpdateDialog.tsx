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
import { get_unavailable_dates } from "@/services/bookingApi";
import { format } from "date-fns";
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
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: any) => Promise<void>;
  booking: any;
}

export function UnifiedUpdateDialog({
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

  useEffect(() => {
    if (open && booking) {
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
      }
    }
  }, [open, booking]);

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

      await onConfirm(data);
    } finally {
      setLoading(false);
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

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-white rounded-3xl max-h-[90vh] flex flex-col">
        <div className="p-6 pb-4 shrink-0">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl font-black text-gray-900">
              Sửa thông tin đặt phòng
            </DialogTitle>
            <DialogDescription className="text-gray-500 mt-2">
              Bạn có thể thay đổi ngày, số lượng khách và thông tin liên lạc.
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
                    {range?.from ? format(range.from, "dd/MM/yyyy") : "Chưa chọn"}
                  </div>
                </div>
                <div className="p-2 text-center">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> 
                    Trả phòng
                  </span>
                  <div className="text-[15px] font-black text-gray-800 mt-1">
                    {range?.to ? format(range.to, "dd/MM/yyyy") : "Chưa chọn"}
                  </div>
                </div>
              </div>

              <div className="flex justify-center w-full">
                <DateRangePicker
                  value={range}
                  onChange={setRange}
                  soldOutDates={soldOutDates}
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
                    onClick={() => setAdults((prev) => Math.max(1, prev - 1))}
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
                        Math.min(booking.room?.adultCapacity || 1, prev + 1),
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
                    onClick={() => setChildren((prev) => Math.max(0, prev - 1))}
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
                        Math.min(booking.room?.childCapacity || 0, prev + 1),
                      )
                    }
                    disabled={children >= (booking.room?.childCapacity || 0)}
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
