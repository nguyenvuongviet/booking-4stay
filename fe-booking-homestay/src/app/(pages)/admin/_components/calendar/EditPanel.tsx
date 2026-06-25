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
  const [soldOut, setSoldOut] = useState<boolean>(!!isSoldOut);

  useEffect(() => {
    setPrice(currentPrice ?? "");
    setSoldOut(!!isSoldOut);
  }, [currentPrice, isSoldOut]);

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
      <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
        <h2 className="text-lg font-bold text-gray-900 tracking-tight">
          Chỉnh sửa <span className="text-blue-600">{label}</span>
        </h2>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
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
            <div className="space-y-5">
              {/* Default price */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Giá mặc định
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                    VND
                  </span>
                  <input
                    disabled
                    value={defaultPrice.toLocaleString()}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-500 font-medium cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Current Price */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Giá áp dụng <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">
                    VND
                  </span>
                  <input
                    type="number"
                    value={price}
                    placeholder={currentPrice === null ? "Nhiều mức giá" : ""}
                    onChange={(e) =>
                      setPrice(e.target.value ? Number(e.target.value) : "")
                    }
                    className="w-full pl-12 pr-4 py-3 bg-white border-2 border-blue-100 focus:border-blue-500 rounded-xl text-gray-900 font-bold transition-colors outline-none focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>

                {price !== "" && price !== defaultPrice && (
                  <div className="flex items-center gap-1 mt-2 text-sm font-medium">
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
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-gray-100/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                      soldOut
                        ? "bg-red-100 text-red-600"
                        : "bg-gray-200 text-gray-500",
                    )}
                  >
                    {soldOut ? (
                      <Lock className="w-5 h-5" />
                    ) : (
                      <Unlock className="w-5 h-5" />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <label
                      className="text-sm font-black text-gray-900 cursor-pointer"
                      onClick={() => setSoldOut(!soldOut)}
                    >
                      Khóa phòng
                    </label>
                    <p className="text-[10px] text-gray-500 font-medium leading-tight">
                      Không cho phép khách đặt vào ngày này
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSoldOut(!soldOut)}
                  className={cn(
                    "w-12 h-6 rounded-full transition-colors relative shadow-inner",
                    soldOut ? "bg-red-500" : "bg-gray-300",
                  )}
                >
                  <div
                    className={cn(
                      "absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-md",
                      soldOut ? "left-7" : "left-1",
                    )}
                  />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-8 border-t border-gray-100 grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="rounded-xl h-12"
                onClick={onClose}
              >
                Hủy bỏ
              </Button>
              <Button
                className="rounded-xl h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold"
                onClick={handleSave}
                disabled={isSaving || price === ""}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang lưu...
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
                  className="w-full rounded-xl border-blue-100 bg-blue-50/30 text-blue-600 hover:bg-blue-50 h-12 font-bold text-sm"
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
