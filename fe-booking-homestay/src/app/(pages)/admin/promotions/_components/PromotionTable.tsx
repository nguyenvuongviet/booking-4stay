"use client";

import { Button } from "@/_components/ui/button";
import { formatExpiryDate } from "@/lib/utils/promotionUtils";
import { Pencil, Trash } from "lucide-react";
import { FancySwitch } from "../../_components/ui/fancy-switch";

interface Promotion {
  id: number;
  code: string;
  name: string;
  promotionType: string;
  discountType: string;
  discountValue: number;
  maxDiscount?: number;
  minOrderValue: number;
  usageLimit: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isPublic: boolean;
  targetLevelId?: number;
  targetLevel?: {
    id: number;
    name: string;
  };
  usageStats?: {
    totalUsed: number;
    totalCollected: number;
  };
}

interface Props {
  items: Promotion[];
  loading: boolean;
  onEdit: (promo: Promotion) => void;
  onDelete: (id: number) => void;
  onToggle: (id: number) => void;
}

export default function PromotionTable({
  items,
  loading,
  onEdit,
  onDelete,
  onToggle,
}: Props) {
  const getPromoTypeBadge = (type: string) => {
    switch (type) {
      case "WELCOME":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      case "SEASONAL":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "LOYALTY":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
      case "BLOG":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "THANKYOU":
        return "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const getDiscountDisplay = (promo: Promotion) => {
    const val = Number(promo.discountValue);
    if (promo.discountType === "PERCENTAGE") {
      return (
        <span className="font-semibold text-primary">
          {val}%
          {promo.maxDiscount && (
            <span className="block text-[10px] text-muted-foreground font-normal">
              tối đa {Number(promo.maxDiscount).toLocaleString()}đ
            </span>
          )}
        </span>
      );
    }
    return (
      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
        {val.toLocaleString()}đ
      </span>
    );
  };

  const getStatusBadge = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now > end) {
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-sans font-bold bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50 uppercase tracking-wider">
          Đã hết hạn
        </span>
      );
    }
    if (now < start) {
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-sans font-bold bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50 uppercase tracking-wider">
          Sắp diễn ra
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-sans font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50 uppercase tracking-wider">
        Hoạt động
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-500">Đang tải danh sách...</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-white dark:bg-slate-900 shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800/50 border-b text-slate-500 dark:text-slate-400">
            <th className="py-3.5 px-4 text-left font-semibold">Mã</th>
            <th className="py-3.5 px-4 text-left font-semibold">Chiến dịch</th>
            <th className="py-3.5 px-4 text-left font-semibold">Loại</th>
            <th className="py-3.5 px-4 text-left font-semibold">Mức giảm</th>
            <th className="py-3.5 px-4 text-left font-semibold">
              Đơn tối thiểu
            </th>
            <th className="py-3.5 px-4 text-left font-semibold">Lượt dùng</th>
            <th className="py-3.5 px-4 text-left font-semibold">Hiệu lực</th>
            <th className="py-3.5 px-4 text-center font-semibold">Public</th>
            <th className="py-3.5 px-4 text-center font-semibold">Kích hoạt</th>
            <th className="py-3.5 px-4 text-center w-24">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {items.map((promo) => (
            <tr
              key={promo.id}
              className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
            >
              <td className="py-4 px-4 font-mono font-bold text-primary select-all">
                {promo.code}
              </td>
              <td className="py-4 px-4">
                <div className="font-medium text-slate-900 dark:text-white max-w-45 truncate">
                  {promo.name}
                </div>
              </td>
              <td className="py-4 px-4">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPromoTypeBadge(
                    promo.promotionType,
                  )}`}
                >
                  {promo.promotionType}
                </span>
              </td>
              <td className="py-4 px-4">{getDiscountDisplay(promo)}</td>
              <td className="py-4 px-4 text-slate-600 dark:text-slate-300">
                {Number(promo.minOrderValue) > 0
                  ? `${Number(promo.minOrderValue).toLocaleString()}đ`
                  : "0đ"}
              </td>
              <td className="py-4 px-4">
                <div className="space-y-1 max-w-28">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {promo.usedCount}
                    </span>
                    <span className="text-slate-400">/</span>
                    <span className="text-slate-500 font-medium">
                      {promo.usageLimit || "∞"}
                    </span>
                  </div>
                  {promo.usageLimit > 0 && (
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          promo.usedCount >= promo.usageLimit
                            ? "bg-rose-500"
                            : promo.usedCount / promo.usageLimit >= 0.8
                              ? "bg-amber-500"
                              : "bg-primary"
                        }`}
                        style={{
                          width: `${Math.min((promo.usedCount / promo.usageLimit) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  )}
                  {promo.usageStats && (
                    <span className="text-[9px] text-muted-foreground block leading-none">
                      Ví: {promo.usageStats.totalCollected}
                    </span>
                  )}
                </div>
              </td>
              <td className="py-4 px-4 text-xs text-slate-500 font-mono">
                <div className="space-y-1 min-w-52.5">
                  <div>{getStatusBadge(promo.startDate, promo.endDate)}</div>
                  <div className="text-[10px] text-slate-600 dark:text-slate-300">
                    {formatExpiryDate(promo.startDate)} →{" "}
                    {formatExpiryDate(promo.endDate)}
                  </div>
                </div>
              </td>
              <td className="py-4 px-4 text-center">
                <span
                  className={`inline-block w-2 h-2 rounded-full ${
                    promo.isPublic ? "bg-green-500" : "bg-gray-300"
                  }`}
                  title={promo.isPublic ? "Công khai" : "Ẩn"}
                />
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center justify-center">
                  <FancySwitch
                    size="xs"
                    checked={promo.isActive}
                    onChange={() => onToggle(promo.id)}
                  />
                </div>
              </td>
              <td className="py-4 px-4 text-center">
                <div className="flex items-center justify-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="hover:bg-slate-100 dark:hover:bg-slate-800"
                    onClick={() => onEdit(promo)}
                  >
                    <Pencil className="w-4 h-4 text-slate-500 hover:text-slate-700" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="hover:bg-red-50 dark:hover:bg-red-950/20"
                    onClick={() => onDelete(promo.id)}
                  >
                    <Trash className="w-4 h-4 text-red-500 hover:text-red-700" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}

          {items.length === 0 && (
            <tr>
              <td
                colSpan={10}
                className="py-12 text-center text-slate-500 dark:text-slate-400"
              >
                Không tìm thấy mã giảm giá nào.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
