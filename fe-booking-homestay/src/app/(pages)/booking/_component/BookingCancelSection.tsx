"use client";

import { Button } from "@/_components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/_components/ui/dialog";
import { Input } from "@/_components/ui/input";
import { Label } from "@/_components/ui/label";
import { Textarea } from "@/_components/ui/textarea";
import { AppConfigKey } from "@/constants/app.constant";
import { useLang } from "@/context/lang-context";
import { parseAbsoluteDate } from "@/lib/utils";
import { Booking } from "@/models/Booking";
import { appConfigApi } from "@/services/admin/appConfigApi";
import { cancel_booking } from "@/services/bookingApi";
import { Info, Loader2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export const BookingCancelSection = ({
  booking,
  onCancel,
}: {
  booking: Booking;
  onCancel?: (
    id: number | string,
    data: { reason: string; refundAmount: number | null },
    newBooking?: Booking,
  ) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [refundAmount, setRefundAmount] = useState<number | null>(null);
  const [systemPolicy, setSystemPolicy] = useState<any[]>([]);
  const [bankName, setBankName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const { t } = useLang();

  useEffect(() => {
    const fetchGlobalPolicy = async () => {
      try {
        const configs = await appConfigApi.getAllConfigs();
        const policy = configs.find(
          (c) => c.key === AppConfigKey.CANCELLATION_POLICY,
        )?.value;
        if (policy) setSystemPolicy(policy);
      } catch (err) {
        console.error("Failed to fetch global policy", err);
      }
    };
    if (
      open &&
      (!booking.cancellationPolicy ||
        (booking.cancellationPolicy as any[]).length === 0)
    ) {
      fetchGlobalPolicy();
    }
  }, [open, booking.cancellationPolicy]);

  const calculateRefund = () => {
    const policy =
      booking.cancellationPolicy?.length > 0
        ? booking.cancellationPolicy
        : systemPolicy;

    const now = new Date();
    const vnTimeMs = now.getTime() + 7 * 60 * 60 * 1000;
    const todayUtcMidnight = Math.floor(vnTimeMs / 86400000) * 86400000;

    const rawCheckIn = booking.checkIn as any;
    const checkInStr =
      rawCheckIn instanceof Date
        ? rawCheckIn.toISOString()
        : String(rawCheckIn);

    const checkInTime = Date.parse(checkInStr.substring(0, 10) + "T00:00:00Z");

    if (todayUtcMidnight >= checkInTime) return 0;

    const diffDays = (checkInTime - todayUtcMidnight) / 86400000;

    let refundPercent = 0;
    if (policy && policy.length > 0) {
      const sorted = [...policy].sort((a, b) => b.daysBefore - a.daysBefore);
      for (let i = 0; i < sorted.length; i++) {
        if (diffDays >= sorted[i].daysBefore) {
          const rawRate = sorted[i].refundPercent;
          refundPercent = rawRate > 1 ? rawRate / 100 : rawRate;
          break;
        }
      }
    }

    const total =
      (booking as any).totalPrice || (booking as any).totalAmount || 0;
    const paid = booking.paidAmount || 0;
    const cancellationFee = total * (1 - refundPercent);

    const refund = paid - cancellationFee;
    return refund > 0 ? refund : 0;
  };

  const handleCancelClick = () => {
    const refund = calculateRefund();
    setRefundAmount(refund);
    setOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!reason.trim()) {
      toast.error("Vui lòng nhập lý do hủy đặt phòng");
      return;
    }

    if (refundAmount && refundAmount > 0) {
      if (
        !bankName.trim() ||
        !bankAccountNumber.trim() ||
        !bankAccountName.trim()
      ) {
        toast.error(
          "Vui lòng nhập đầy đủ thông tin tài khoản ngân hàng để nhận tiền hoàn",
        );
        return;
      }
    }

    try {
      setLoading(true);
      const res = await cancel_booking(
        booking.id,
        reason,
        refundAmount && refundAmount > 0
          ? {
              bankName,
              bankAccountNumber,
              bankAccountName: bankAccountName.toUpperCase(),
            }
          : undefined,
      );

      toast.success(
        res.data?.message || `Đơn đặt phòng đã được hủy thành công.`,
      );

      onCancel?.(booking.id, { reason, refundAmount }, res.data?.booking);
      setOpen(false);
      setReason("");
      setBankName("");
      setBankAccountNumber("");
      setBankAccountName("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Hủy đặt phòng thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        className="w-full justify-start h-16 px-6 sm:px-8 rounded-3xl border-2 border-red-50 shadow-sm hover:shadow-md hover:border-red-200 hover:bg-red-50 flex items-center gap-4 group transition-all duration-300"
        onClick={handleCancelClick}
        disabled={loading}
      >
        <div className="p-2 bg-red-50 rounded-xl group-hover:bg-red-100 transition-colors">
          <XCircle className="w-5 h-5 text-red-500" />
        </div>
        <div className="flex flex-col items-start leading-tight">
          <span className="font-black text-red-600 transition-colors text-sm">
            {loading ? "Đang hủy..." : "Hủy đặt phòng"}
          </span>
          <span className="text-[9px] text-red-400 font-bold uppercase tracking-widest">
            Hủy ngay phút chót
          </span>
        </div>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-red-600 uppercase tracking-wider">
              Xác nhận hủy đặt phòng
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-2">
            <div className="rounded-2xl bg-gray-50 p-5 border border-gray-100 text-sm">
              <div className="flex items-center gap-2 font-black text-gray-900 mb-3 uppercase tracking-tighter">
                <Info className="w-4 h-4 text-primary" />
                Chính sách hoàn tiền áp dụng
              </div>
              <ul className="space-y-2">
                {(() => {
                  const policy =
                    booking.cancellationPolicy &&
                    (booking.cancellationPolicy as any[]).length > 0
                      ? (booking.cancellationPolicy as any[])
                      : systemPolicy;

                  if (policy && policy.length > 0) {
                    return [...policy]
                      .sort((a, b) => b.daysBefore - a.daysBefore)
                      .map((rule, idx) => (
                        <li
                          key={idx}
                          className="flex justify-between items-center text-gray-600"
                        >
                          <span>Trước {rule.daysBefore} ngày:</span>
                          <span className="font-bold text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-100 shadow-sm">
                            Hoàn {Number(rule.refundPercent) * 100}%
                          </span>
                        </li>
                      ));
                  }

                  return (
                    <li className="text-gray-400 italic">
                      Đang tải hoặc không có thông tin chính sách hủy.
                    </li>
                  );
                })()}
              </ul>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Lý do hủy phòng
              </p>
              <Textarea
                placeholder="Vui lòng nhập lý do để chúng tôi cải thiện dịch vụ..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-2xl min-h-[100px] border-gray-100 focus:ring-primary/20"
              />
            </div>

            {refundAmount !== null && refundAmount > 0 && (
              <div className="space-y-4 p-5 rounded-2xl bg-gray-50 border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Info className="w-3 h-3" /> Thông tin nhận tiền hoàn
                </p>
                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-gray-500 ml-1">
                      Tên ngân hàng
                    </Label>
                    <Input
                      placeholder="Ví dụ: Vietcombank, Techcombank..."
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="rounded-xl border-gray-200"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[11px] text-gray-500 ml-1">
                        Số tài khoản
                      </Label>
                      <Input
                        placeholder="Số tài khoản..."
                        value={bankAccountNumber}
                        onChange={(e) => setBankAccountNumber(e.target.value)}
                        className="rounded-xl border-gray-200"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] text-gray-500 ml-1">
                        Chủ tài khoản
                      </Label>
                      <Input
                        placeholder="Tên in trên thẻ..."
                        value={bankAccountName}
                        onChange={(e) =>
                          setBankAccountName(e.target.value.toUpperCase())
                        }
                        className="rounded-xl border-gray-200 uppercase"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {refundAmount !== null && (
              <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 text-sm">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-600">
                    Số tiền ước tính hoàn trả:
                  </span>
                  {refundAmount > 0 ? (
                    <span className="text-xl font-black text-primary">
                      {refundAmount.toLocaleString()} VND
                    </span>
                  ) : (
                    <span className="text-red-500 font-black">
                      KHÔNG HOÀN TIỀN
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 mt-2 italic">
                  * Phí phạt = Tổng đơn x (100% - % hoàn). Tiền hoàn = Đã đóng -
                  Phí phạt.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="rounded-xl hover:cursor-pointer hover:bg-secondary/50 "
            >
              {t("close")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmCancel}
              disabled={loading}
              className="rounded-xl hover:cursor-pointer hover:bg-red-500"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t("Submit")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
