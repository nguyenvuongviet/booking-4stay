"use client";

import { Button } from "@/_components/ui/button";
import { Skeleton } from "@/_components/ui/skeleton";
import { formatExpiryDate } from "@/lib/utils/promotionUtils";
import { Pencil, Trash } from "lucide-react";
import { useMemo, useState } from "react";
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
  const [sortField, setSortField] = useState<
    "discountValue" | "minOrderValue" | "maxDiscount" | null
  >(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const handleSort = (
    field: "discountValue" | "minOrderValue" | "maxDiscount",
  ) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedItems = useMemo(() => {
    if (!sortField) return items;
    return [...items].sort((a: any, b: any) => {
      const valA = Number(a[sortField]) || 0;
      const valB = Number(b[sortField]) || 0;
      return sortOrder === "asc" ? valA - valB : valB - valA;
    });
  }, [items, sortField, sortOrder]);
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
      return <span className="font-semibold text-primary">{val}%</span>;
    }
    return (
      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
        {val.toLocaleString("vi-VN")}đ
      </span>
    );
  };

  const getMaxDiscountDisplay = (promo: Promotion) => {
    if (promo.discountType === "PERCENTAGE" && promo.maxDiscount) {
      return (
        <span className="text-slate-650 dark:text-slate-300 font-medium">
          tối đa {Number(promo.maxDiscount).toLocaleString("vi-VN")}đ
        </span>
      );
    }
    return <span className="text-slate-400">—</span>;
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

  const renderSortHeader = (
    label: string,
    field: "discountValue" | "minOrderValue" | "maxDiscount",
  ) => {
    const isCurrent = sortField === field;
    return (
      <th
        className="py-3.5 px-4 text-left font-semibold cursor-pointer select-none hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        onClick={() => handleSort(field)}
      >
        <div className="flex items-center gap-1.5">
          <span>{label}</span>
          <span className="text-[10px] text-muted-foreground/60 font-mono">
            {isCurrent ? (sortOrder === "asc" ? "▲" : "▼") : "↕"}
          </span>
        </div>
      </th>
    );
  };

  return (
    <>
      {/* ==================== Desktop Table (lg+) ==================== */}
      <div className="hidden lg:block overflow-x-auto rounded-xl border bg-white dark:bg-slate-900 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b text-slate-500 dark:text-slate-400">
              <th className="py-3.5 px-4 text-left font-semibold">Mã</th>
              <th className="py-3.5 px-4 text-left font-semibold">
                Chiến dịch
              </th>
              <th className="py-3.5 px-4 text-left font-semibold">Loại</th>
              {renderSortHeader("Mức giảm", "discountValue")}
              {renderSortHeader("Giảm tối đa", "maxDiscount")}
              {renderSortHeader("Đơn tối thiểu", "minOrderValue")}
              <th className="py-3.5 px-4 text-left font-semibold">Lượt dùng</th>
              <th className="py-3.5 px-4 text-left font-semibold">Hiệu lực</th>
              <th className="py-3.5 px-4 text-center font-semibold">Public</th>
              <th className="py-3.5 px-4 text-center font-semibold">
                Kích hoạt
              </th>
              <th className="py-3.5 px-4 text-center w-24">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading &&
              [...Array(4)].map((_, i) => (
                <tr key={i} className="border-b">
                  <td className="py-4 px-4">
                    <Skeleton className="h-4 w-16 rounded font-mono" />
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton className="h-4 w-32 rounded" />
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton className="h-4 w-12 rounded" />
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton className="h-4 w-24 rounded" />
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton className="h-4 w-16 rounded" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-10 rounded" />
                      <Skeleton className="h-1.5 w-20 rounded-full" />
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <Skeleton className="h-3.5 w-14 rounded" />
                      <Skeleton className="h-3 w-28 rounded" />
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <Skeleton className="h-2 w-2 mx-auto rounded-full" />
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton className="h-5 w-9 mx-auto rounded-full" />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex gap-1 justify-center">
                      <Skeleton className="h-8 w-8 rounded-lg" />
                      <Skeleton className="h-8 w-8 rounded-lg" />
                    </div>
                  </td>
                </tr>
              ))}

            {!loading &&
              sortedItems.map((promo) => (
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
                  <td className="py-4 px-4">{getMaxDiscountDisplay(promo)}</td>
                  <td className="py-4 px-4 text-slate-600 dark:text-slate-300">
                    {Number(promo.minOrderValue) > 0
                      ? `${Number(promo.minOrderValue).toLocaleString("vi-VN")}đ`
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
                    <div className="space-y-1 min-w-32.5">
                      <div>
                        {getStatusBadge(promo.startDate, promo.endDate)}
                      </div>
                      <div className="text-[10px] text-slate-600 dark:text-slate-300 flex flex-col gap-0.5">
                        <span>{formatExpiryDate(promo.startDate)}</span>
                        <span className="text-slate-400">
                          → {formatExpiryDate(promo.endDate)}
                        </span>
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
                        className="hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        onClick={() => onEdit(promo)}
                      >
                        <Pencil className="w-4 h-4 text-slate-500 hover:text-slate-700" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
                        onClick={() => onDelete(promo.id)}
                      >
                        <Trash className="w-4 h-4 text-red-500 hover:text-red-700" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

            {!loading && items.length === 0 && (
              <tr>
                <td
                  colSpan={11}
                  className="py-12 text-center text-slate-500 dark:text-slate-400"
                >
                  Không tìm thấy mã giảm giá nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ==================== Mobile Cards Layout (<lg) ==================== */}
      <div className="lg:hidden space-y-3">
        {loading &&
          [...Array(3)].map((_, i) => (
            <div
              key={i}
              className="border rounded-xl p-4 bg-white dark:bg-slate-900 shadow-xs space-y-3"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4.5 w-20 rounded font-mono" />
                  <Skeleton className="h-4 w-3/4 rounded" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border text-xs">
                <div className="space-y-1">
                  <Skeleton className="h-3 w-16 rounded" />
                  <Skeleton className="h-4 w-20 rounded" />
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-3 w-16 rounded" />
                  <Skeleton className="h-4 w-24 rounded" />
                </div>
              </div>
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs">
                  <Skeleton className="h-3.5 w-10 rounded" />
                  <Skeleton className="h-3.5 w-12 rounded" />
                </div>
                <Skeleton className="h-1.5 w-full rounded-full" />
              </div>
              <div className="flex items-center justify-between border-t pt-3 mt-1">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <Skeleton className="h-3 w-12 rounded" />
                    <Skeleton className="h-4 w-8 rounded-full" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Skeleton className="h-3 w-12 rounded" />
                    <Skeleton className="h-4 w-8 rounded-full" />
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
              </div>
            </div>
          ))}

        {!loading &&
          sortedItems.map((promo) => (
            <div
              key={promo.id}
              className="border rounded-xl p-4 bg-white dark:bg-slate-900 shadow-xs space-y-3"
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <span className="font-mono font-bold text-primary select-all text-sm sm:text-base">
                    {promo.code}
                  </span>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm mt-0.5 truncate">
                    {promo.name}
                  </h3>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium shrink-0 ${getPromoTypeBadge(
                    promo.promotionType,
                  )}`}
                >
                  {promo.promotionType}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border text-xs text-slate-650 dark:text-slate-300">
                <div>
                  <span className="text-muted-foreground block text-[10px]">
                    Giảm giá:
                  </span>
                  <div className="flex flex-col gap-0.5 mt-0.5">
                    {getDiscountDisplay(promo)}
                    {getMaxDiscountDisplay(promo)}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">
                    Đơn tối thiểu:
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block mt-0.5">
                    {Number(promo.minOrderValue) > 0
                      ? `${Number(promo.minOrderValue).toLocaleString("vi-VN")}đ`
                      : "0đ"}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Lượt dùng:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {promo.usedCount} / {promo.usageLimit || "∞"}
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
              </div>

              <div className="flex items-center justify-between text-xs border-t border-dashed pt-3 mt-1 text-slate-500">
                <div className="flex flex-col gap-0.5">
                  <span>Bắt đầu: {formatExpiryDate(promo.startDate)}</span>
                  <span>Kết thúc: {formatExpiryDate(promo.endDate)}</span>
                </div>
                <div>{getStatusBadge(promo.startDate, promo.endDate)}</div>
              </div>

              <div className="flex items-center justify-between border-t pt-3 mt-1">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">
                      Public:
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        promo.isPublic ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">
                      Kích hoạt:
                    </span>
                    <FancySwitch
                      size="xs"
                      checked={promo.isActive}
                      onChange={() => onToggle(promo.id)}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    onClick={() => onEdit(promo)}
                  >
                    <Pencil className="w-3.5 h-3.5 text-slate-500" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
                    onClick={() => onDelete(promo.id)}
                  >
                    <Trash className="w-3.5 h-3.5 text-red-500" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

        {!loading && items.length === 0 && (
          <div className="border rounded-xl p-8 text-center text-muted-foreground bg-white dark:bg-slate-900">
            Không tìm thấy mã giảm giá nào.
          </div>
        )}
      </div>
    </>
  );
}
