"use client";

import { Card } from "@/_components/ui/card";
import {
  formatDateVN,
  formatDiscountBadge,
  formatExpiryDate,
} from "@/lib/utils/promotionUtils";
import { get_voucher_wallet } from "@/services/promotionApi";
import { Check, Copy } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface VoucherItem {
  id: number;
  status: string;
  collectedAt: string;
  usedAt?: string;
  promotion: {
    id: number;
    code: string;
    name: string;
    discountType: string;
    discountValue: number;
    maxDiscount?: number;
    minOrderValue?: number;
    startDate: string;
    endDate: string;
  };
}

const TAB_LABELS: Record<string, string> = {
  AVAILABLE: "Có thể dùng",
  USED: "Đã sử dụng",
  EXPIRED: "Đã hết hạn",
};

export default function VoucherWallet() {
  const [activeTab, setActiveTab] = useState("AVAILABLE");
  const [vouchers, setVouchers] = useState<VoucherItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const handleCopy = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  const fetchVouchers = async (status: string) => {
    setLoading(true);
    try {
      const data = await get_voucher_wallet(status);
      setVouchers(data);
    } catch {
      setVouchers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchVouchers(activeTab);
  }, [activeTab]);

  return (
    <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 md:p-8 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-xs animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl md:text-3xl elegant-heading tracking-tight dark:text-white">
          Ví Voucher
        </h2>
        <p className="text-[10px] sm:text-xs md:text-sm text-slate-500 mt-1">
          Quản lý mã giảm giá đã thu thập. Sử dụng tại trang thanh toán.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-50 dark:border-slate-800/60 pb-4 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-full">
        {Object.entries(TAB_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs rounded-full transition-all cursor-pointer font-bold whitespace-nowrap ${
              activeTab === key
                ? "bg-primary text-white shadow-xs"
                : "bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Voucher List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : vouchers.length === 0 ? (
        <Card className="p-8 sm:p-10 border border-slate-100 dark:border-slate-800/80 rounded-3xl text-center bg-slate-50/20 dark:bg-slate-900/40">
          <p className="text-slate-400 text-[10px] sm:text-xs md:text-sm">
            {activeTab === "AVAILABLE"
              ? "Bạn chưa có voucher nào. Hãy thu thập từ Blog hoặc Checkout!"
              : activeTab === "USED"
                ? "Chưa có voucher nào đã sử dụng."
                : "Không có voucher hết hạn."}
          </p>
        </Card>
      ) : (
        (() => {
          const pageSize = 6;
          const totalPages = Math.ceil(vouchers.length / pageSize);
          const paginatedVouchers = vouchers.slice(
            (page - 1) * pageSize,
            page * pageSize,
          );

          return (
            <>
              <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                {paginatedVouchers.map((v) => {
                  const cardContent = (
                    <Card
                      className={`flex flex-row gap-0 h-28 w-full relative overflow-hidden border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-xs transition-all duration-300 ${
                        v.status === "AVAILABLE"
                          ? "bg-white dark:bg-slate-900 hover:shadow-md hover:border-primary/20 hover:scale-[1.01] cursor-pointer"
                          : "bg-slate-50/50 dark:bg-slate-800/10 opacity-70"
                      }`}
                    >
                      {/* Left Stub (Discount Display) */}
                      <div
                        className={`w-24 sm:w-28 shrink-0 flex flex-col items-center justify-center border-r border-dashed border-slate-200 dark:border-slate-850 relative ${
                          v.status === "AVAILABLE"
                            ? "bg-linear-to-br from-emerald-500 to-teal-600 text-white"
                            : v.status === "USED"
                              ? "bg-linear-to-br from-slate-400 to-slate-500 text-slate-100 dark:from-slate-700 dark:to-slate-800 dark:text-slate-400"
                              : "bg-linear-to-br from-rose-500 to-red-600 text-white dark:from-red-900/40 dark:to-red-950/40 dark:text-red-400"
                        }`}
                      >
                        {/* Large discount amount */}
                        <span className="text-xl sm:text-2xl font-black tracking-tight text-center">
                          {formatDiscountBadge(v.promotion)}
                        </span>
                        <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest opacity-85 mt-0.5">
                          Giảm giá
                        </span>

                        {/* Stub Cutouts (Top & Bottom on the dividing line) */}
                        <div className="absolute -top-2 -right-2 w-4 h-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-full z-10"></div>
                        <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-full z-10"></div>
                      </div>

                      {/* Right Details */}
                      <div className="flex-1 p-3 sm:p-3.5 flex flex-col justify-between min-w-0">
                        <div className="space-y-1.5">
                          {/* Top Line: Code & Copy */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center">
                              <span className="font-mono text-[10px] sm:text-xs font-black text-primary bg-primary/5 dark:bg-primary/10 px-2 py-0.5 rounded border border-dashed border-primary/20 uppercase tracking-wider">
                                {v.promotion.code}
                              </span>
                              <button
                                onClick={(e) => handleCopy(v.promotion.code, e)}
                                className="ml-1 p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-primary transition-colors cursor-pointer shrink-0"
                                title="Sao chép mã"
                              >
                                {copiedCode === v.promotion.code ? (
                                  <Check className="w-3 h-3 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Conditions Details */}
                          <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
                            <div className="flex justify-between items-center gap-1">
                              <span className="text-slate-400 dark:text-slate-500">
                                Tối thiểu:
                              </span>
                              <strong className="text-slate-700 dark:text-slate-200 font-bold">
                                {v.promotion.minOrderValue &&
                                Number(v.promotion.minOrderValue) > 0
                                  ? `${Number(v.promotion.minOrderValue).toLocaleString()}đ`
                                  : "0đ"}
                              </strong>
                            </div>
                            <div className="flex justify-between items-center gap-1">
                              <span className="text-slate-400 dark:text-slate-500">
                                Tối đa:
                              </span>
                              <strong className="text-slate-700 dark:text-slate-200 font-bold">
                                {v.promotion.maxDiscount &&
                                Number(v.promotion.maxDiscount) > 0
                                  ? `${Number(v.promotion.maxDiscount).toLocaleString()}đ`
                                  : "Không giới hạn"}
                              </strong>
                            </div>
                          </div>
                        </div>

                        {/* Bottom line: HSD / Action / Used At */}
                        <div className="text-[8px] sm:text-[9px] text-slate-400 flex flex-row justify-between items-center gap-1 border-t border-slate-50 dark:border-slate-800/40 pt-1.5">
                          <span>
                            HSD: {formatExpiryDate(v.promotion.endDate)}
                          </span>

                          {v.status === "AVAILABLE" ? (
                            <span className="text-[9px] sm:text-[10px] font-extrabold text-primary hover:underline transition-colors shrink-0">
                              Dùng ngay →
                            </span>
                          ) : v.usedAt ? (
                            <span className="italic text-slate-400 shrink-0">
                              Đã dùng: {formatDateVN(v.usedAt)}
                            </span>
                          ) : (
                            <span className="text-red-500 font-semibold uppercase tracking-wider text-[8px] sm:text-[9px] shrink-0">
                              Hết hạn
                            </span>
                          )}
                        </div>
                      </div>
                    </Card>
                  );

                  return v.status === "AVAILABLE" ? (
                    <Link
                      href="/room"
                      key={v.id}
                      className="block no-underline"
                    >
                      {cardContent}
                    </Link>
                  ) : (
                    <div key={v.id} className="block">
                      {cardContent}
                    </div>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-6 mt-4 border-t border-slate-50 dark:border-slate-800/40">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    ← Trước
                  </button>
                  <span className="text-[10px] sm:text-xs text-slate-500 px-2 sm:px-3">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    Tiếp →
                  </button>
                </div>
              )}
            </>
          );
        })()
      )}
    </div>
  );
}
