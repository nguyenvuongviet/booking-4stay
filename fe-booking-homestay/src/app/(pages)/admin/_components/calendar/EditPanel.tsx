import { Button } from "@/_components/ui/button";
import { cn } from "@/lib/utils";
import { Booking } from "@/types/booking";
import { Loader2, Lock, Unlock, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

interface EditPanelProps {
  roomId?: number;
  dates: Date[];
  currentPrice: number | null; // null if multiple prices
  defaultPrice: number;
  isSoldOut: boolean | null; // null if multiple statuses
  booking?: Booking;
  onSave: (price: number, soldOut: boolean) => void;
  onClose: () => void;
  isSaving?: boolean;
}

export default function EditPanel({
  roomId,
  dates,
  currentPrice,
  defaultPrice,
  isSoldOut,
  booking,
  onSave,
  onClose,
  isSaving = false,
}: EditPanelProps) {
  const [price, setPrice] = useState<number | "">(currentPrice ?? "");
  const [priceInput, setPriceInput] = useState<string>("");
  const [soldOut, setSoldOut] = useState<boolean>(!!isSoldOut);

  useEffect(() => {
    setPrice(currentPrice ?? "");
    setPriceInput(currentPrice !== null && currentPrice !== undefined ? currentPrice.toLocaleString("vi-VN") : "");
    setSoldOut(!!isSoldOut);
  }, [currentPrice, isSoldOut]);

  const handlePriceChange = (val: string) => {
    const clean = val.replace(/\D/g, "");
    if (clean === "") {
      setPrice("");
      setPriceInput("");
    } else {
      const num = Number(clean);
      setPrice(num);
      setPriceInput(num.toLocaleString("vi-VN"));
    }
  };

  const handleSave = () => {
    if (price === "") return;
    onSave(price, soldOut);
  };

  const label = useMemo(() => {
    if (dates.length === 0) return "Chưa chọn ngày";
    if (dates.length === 1) {
      return dates[0].toLocaleDateString("vi-VN");
    }

    return `${dates.length} ngày được chọn`;
  }, [dates]);

  return (
    <div className="h-full bg-white border-l border-gray-100 flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.05)] relative">
      {/* Header */}
      <div className="flex items-center justify-between p-3.5 sm:p-5 border-b border-gray-100 bg-gray-50/50">
        <h2 className="text-xs sm:text-sm lg:text-base font-bold text-gray-900 tracking-tight">
          Chỉnh sửa <span className="text-blue-600">{label}</span>
        </h2>
        <button
          onClick={onClose}
          className="p-1 sm:p-1.5 text-gray-400 hover:text-gray-650 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-4 sm:space-y-6">
        {dates.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
              <X className="w-8 h-8 text-gray-300" />
            </div>
            <div className="space-y-1">
              <p className="text-gray-900 font-bold">Chưa chọn ngày</p>
              <p className="text-sm text-gray-500">
                Vui lòng chọn ngày trên lịch để chỉnh sửa
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Pricing Section */}
            <div className="space-y-4">
              {/* Default price */}
              <div className="space-y-1.5">
                <label className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Giá mặc định
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] sm:text-xs font-bold">
                    VND
                  </span>
                  <input
                    disabled
                    value={defaultPrice.toLocaleString()}
                    className="w-full pl-11 pr-3 py-1.5 sm:py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs sm:text-sm text-gray-500 font-bold cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Current Price */}
              <div className="space-y-1.5">
                <label className="text-[10px] sm:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Giá áp dụng <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] sm:text-xs font-bold">
                    VND
                  </span>
                  <input
                    type="text"
                    value={priceInput}
                    placeholder={currentPrice === null ? "Nhiều mức giá" : ""}
                    onChange={(e) => handlePriceChange(e.target.value)}
                    className="w-full pl-11 pr-3 py-1.5 sm:py-2.5 bg-white border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-xs sm:text-sm text-gray-900 font-bold transition-all outline-none"
                  />
                </div>

                {price !== "" && price !== defaultPrice && (
                  <div className="flex items-center gap-1 mt-1.5 sm:mt-2 text-xs sm:text-sm font-medium">
                    <span
                      className={
                        price > defaultPrice ? "text-red-500" : "text-green-500"
                      }
                    >
                      {price > defaultPrice ? "▲ Tăng" : "▼ Giảm"}{" "}
                      {Math.abs(price - defaultPrice).toLocaleString()} đ
                    </span>
                    <span className="text-gray-400">so với mặc định</span>
                  </div>
                )}
              </div>

              {/* Sold Out Toggle */}
              <div className="flex items-center justify-between p-2.5 sm:p-3.5 bg-gray-50 dark:bg-slate-900/50 rounded-xl border border-gray-100 dark:border-slate-800/60 hover:bg-gray-100/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-7 h-7 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-colors",
                      soldOut
                        ? "bg-red-500/10 text-red-600 dark:bg-red-950/30 dark:text-red-400"
                        : "bg-gray-200 dark:bg-slate-800 text-gray-500",
                    )}
                  >
                    {soldOut ? (
                      <Lock className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" />
                    ) : (
                      <Unlock className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <label
                      className="text-xs sm:text-sm font-bold text-gray-900 dark:text-slate-200 cursor-pointer"
                      onClick={() => setSoldOut(!soldOut)}
                    >
                      Khóa phòng
                    </label>
                    <p className="text-[9px] sm:text-[10px] text-gray-500 font-medium leading-tight">
                      Không cho phép khách đặt vào ngày này
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSoldOut(!soldOut)}
                  className={cn(
                    "w-10 h-5.5 rounded-full p-0.5 transition-colors flex items-center shadow-inner cursor-pointer",
                    soldOut ? "bg-red-500 justify-end" : "bg-slate-200 dark:bg-slate-800 justify-start",
                  )}
                >
                  <div className="w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-gray-100 dark:border-slate-800/60 grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="rounded-xl h-9.5 sm:h-11 text-xs font-semibold cursor-pointer"
                onClick={onClose}
              >
                Hủy bỏ
              </Button>
              <Button
                className="rounded-xl h-9.5 sm:h-11 bg-primary hover:bg-primary/95 text-white font-bold text-xs cursor-pointer"
                onClick={handleSave}
                disabled={isSaving || price === ""}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Lưu...
                  </>
                ) : (
                  "Lưu thay đổi"
                )}
              </Button>
            </div>

            {/* Quick Actions */}
            <div className="pt-4">
              <Link
                href={(() => {
                  const formatLocal = (d: Date) => {
                    const offset = d.getTimezoneOffset() * 60000;
                    return new Date(d.getTime() - offset)
                      .toISOString()
                      .split("T")[0];
                  };

                  const checkIn = formatLocal(dates[0]);
                  let checkOut = formatLocal(dates[dates.length - 1]);

                  if (dates.length === 1) {
                    const nextDay = new Date(dates[0]);
                    nextDay.setDate(nextDay.getDate() + 1);
                    checkOut = formatLocal(nextDay);
                  }

                  return `/admin/offline-booking?room=${roomId}&date=${checkIn}&endDate=${checkOut}`;
                })()}
              >
                <Button
                  variant="outline"
                  className="w-full rounded-xl border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 h-9.5 sm:h-11 font-bold text-xs cursor-pointer"
                >
                  + Đặt phòng nhanh
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
