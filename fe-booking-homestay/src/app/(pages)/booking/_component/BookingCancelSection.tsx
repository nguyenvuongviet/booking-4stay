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
import { useLang } from "@/context/lang-context";
import { Booking } from "@/models/Booking";
import {
  CancelPreviewResult,
  getCancelPreview,
} from "@/services/admin/bookingsApi";
import { cancel_booking } from "@/services/bookingApi";
import {
  Ban,
  Calculator,
  Clock,
  Info,
  Loader2,
  Shield,
  XCircle,
} from "lucide-react";
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
  const [preview, setPreview] = useState<CancelPreviewResult | null>(null);
  const [bankName, setBankName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const { t } = useLang();

  useEffect(() => {
    if (open && booking.id) {
      setLoading(true);
      getCancelPreview(Number(booking.id))
        .then((data) => {
          setPreview(data);
          setRefundAmount(data.suggestedRefundAmount);
        })
        .catch((err) => {
          console.error("Failed to fetch cancel preview", err);
        })
        .finally(() => setLoading(false));
    }
  }, [open, booking.id]);

  const getRefundLabel = (percent: number) => {
    if (percent >= 1) return "Hoàn 100%";
    if (percent > 0) return `Hoàn ${Math.round(percent * 100)}%`;
    return "Không hoàn tiền";
  };

  const getPolicyDescription = (daysLeft: number) => {
    if (daysLeft < 0) return "Đã quá ngày check-in";
    if (daysLeft === 0) return "Ngày check-in hôm nay";
    return `Còn ${daysLeft} ngày trước check-in`;
  };

  const handleCancelClick = () => {
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
        className="w-full justify-center h-16 px-6 sm:px-8 rounded-3xl border-2 border-red-50 shadow-sm hover:shadow-md hover:border-red-200 hover:bg-red-50 flex items-center gap-4 group transition-all duration-300"
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
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto elegant-scrollbar">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-black text-gray-900">
              <Ban className="w-5 h-5 text-red-500" />
              Xác nhận hủy đặt phòng
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {loading && (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <p className="text-sm text-gray-500 font-medium">
                  Đang tính toán chính sách...
                </p>
              </div>
            )}

            {preview && !loading && (
              <>
                {/* Policy Calculation */}
                <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-200/60 space-y-4">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-slate-400" />
                    <h4 className="font-black text-slate-700 text-[11px] uppercase tracking-wider">
                      Kết quả tính toán chính sách
                    </h4>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2.5 text-sm">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-slate-100 shadow-sm">
                        <Clock className="w-4 h-4 text-blue-500" />
                      </div>
                      <span className="text-slate-600 font-bold">
                        {getPolicyDescription(preview.daysUntilCheckIn)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 text-sm">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-slate-100 shadow-sm">
                        <Shield className="w-4 h-4 text-green-500" />
                      </div>
                      <span className="text-slate-600 font-medium">
                        Quy tắc áp dụng:{" "}
                        <strong className="text-slate-900">
                          {getRefundLabel(preview.appliedRefundPercent)}
                        </strong>
                      </span>
                    </div>
                  </div>

                  {/* Policy Rules Reference */}
                  {preview.cancellationPolicy &&
                    preview.cancellationPolicy.length > 0 && (
                      <div className="bg-white rounded-xl p-4 mt-2 space-y-1.5 border border-slate-100 shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                          <Info className="w-3 h-3" /> Chi tiết chính sách huỷ
                        </p>
                        {[...preview.cancellationPolicy]
                          .sort((a, b) => b.daysBefore - a.daysBefore)
                          .map((rule, i) => (
                            <div
                              key={i}
                              className={`flex justify-between text-xs py-2 px-3 rounded-lg transition-all ${
                                preview.daysUntilCheckIn >= rule.daysBefore &&
                                (i === 0 ||
                                  preview.daysUntilCheckIn <
                                    preview.cancellationPolicy.sort(
                                      (a, b) => b.daysBefore - a.daysBefore,
                                    )[i - 1]?.daysBefore)
                                  ? "bg-blue-50 text-blue-700 font-black ring-1 ring-blue-100 shadow-sm"
                                  : "text-slate-500/70"
                              }`}
                            >
                              <span>
                                ≥ {rule.daysBefore} ngày trước check-in
                              </span>
                              <span>
                                Hoàn {Math.round(rule.refundPercent * 100)}%
                              </span>
                            </div>
                          ))}
                      </div>
                    )}
                </div>

                {/* Refund Summary Result */}
                <div className="bg-white rounded-2xl border-2 border-gray-100 p-5 space-y-4 shadow-sm">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                    <span className="text-sm font-bold text-gray-500">
                      Phí phạt huỷ đơn
                    </span>
                    <span className="text-base font-black text-red-500">
                      {preview.suggestedCancellationFee.toLocaleString()}₫
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-black text-gray-800">
                      Số tiền hoàn trả ước tính
                    </span>
                    {preview.suggestedRefundAmount > 0 ? (
                      <span className="text-2xl font-black text-primary">
                        {preview.suggestedRefundAmount.toLocaleString()}₫
                      </span>
                    ) : (
                      <span className="text-lg font-black text-red-500 uppercase">
                        Không hoàn tiền
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 italic leading-tight">
                    * Phí phạt = Tổng đơn x (100% - % hoàn).
                    <br />* Tiền hoàn = Số tiền đã thanh toán - Phí phạt.
                  </p>
                </div>

                {/* Reason */}
                <div className="space-y-3">
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Lý do hủy phòng
                  </p>
                  <Textarea
                    placeholder="Vui lòng nhập lý do để chúng tôi cải thiện dịch vụ..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full rounded-2xl min-h-[100px] border-gray-100 focus:ring-primary/20 bg-gray-50/50 transition-all focus:bg-white"
                  />
                </div>

                {/* Bank Info if refund > 0 */}
                {preview.suggestedRefundAmount > 0 && (
                  <div className="space-y-4 p-5 rounded-2xl bg-primary/5 border border-primary/10 shadow-inner">
                    <p className="text-[11px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                      <Calculator className="w-3.5 h-3.5" /> Thông tin nhận tiền
                      hoàn
                    </p>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-bold text-gray-500 ml-1">
                          Tên ngân hàng
                        </Label>
                        <Input
                          placeholder="Ví dụ: Vietcombank, Techcombank..."
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          className="rounded-xl border-gray-100 h-11 bg-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-[11px] font-bold text-gray-500 ml-1">
                            Số tài khoản
                          </Label>
                          <Input
                            placeholder="Số tài khoản..."
                            value={bankAccountNumber}
                            onChange={(e) =>
                              setBankAccountNumber(e.target.value)
                            }
                            className="rounded-xl border-gray-100 h-11 bg-white"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[11px] font-bold text-gray-500 ml-1">
                            Chủ tài khoản
                          </Label>
                          <Input
                            placeholder="Tên in trên thẻ..."
                            value={bankAccountName}
                            onChange={(e) =>
                              setBankAccountName(e.target.value.toUpperCase())
                            }
                            className="rounded-xl border-gray-100 h-11 bg-white uppercase font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
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
