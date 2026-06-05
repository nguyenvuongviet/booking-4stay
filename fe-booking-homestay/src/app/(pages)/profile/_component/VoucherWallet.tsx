"use client";

import { Card } from "@/_components/ui/card";
import { formatDateVN, formatDiscount } from "@/lib/utils/promotionUtils";
import { get_voucher_wallet } from "@/services/promotionApi";
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
    fetchVouchers(activeTab);
  }, [activeTab]);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl elegant-heading">Ví Voucher</h2>
      <p className="text-sm text-muted-foreground">
        Quản lý mã giảm giá đã thu thập. Sử dụng tại trang thanh toán.
      </p>

      {/* Tabs */}
      <div className="flex gap-2">
        {Object.entries(TAB_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 text-sm rounded-full transition-all cursor-pointer ${
              activeTab === key
                ? "bg-primary text-white shadow-md"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Voucher List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : vouchers.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground text-sm">
            {activeTab === "AVAILABLE"
              ? "Bạn chưa có voucher nào. Hãy thu thập từ Blog hoặc Checkout!"
              : activeTab === "USED"
                ? "Chưa có voucher nào đã sử dụng."
                : "Không có voucher hết hạn."}
          </p>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {vouchers.map((v) => (
            <Card
              key={v.id}
              className={`p-4 relative overflow-hidden border-l-4 transition-all hover:shadow-md ${
                v.status === "AVAILABLE"
                  ? "border-l-green-500"
                  : v.status === "USED"
                    ? "border-l-gray-400 opacity-70"
                    : "border-l-red-400 opacity-60"
              }`}
            >
              {/* Code badge */}
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                  {v.promotion.code}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    v.status === "AVAILABLE"
                      ? "bg-green-100 text-green-700"
                      : v.status === "USED"
                        ? "bg-gray-100 text-gray-600"
                        : "bg-red-100 text-red-600"
                  }`}
                >
                  {TAB_LABELS[v.status]}
                </span>
              </div>

              {/* Name + Discount */}
              <h4 className="font-medium text-sm mb-1">{v.promotion.name}</h4>
              <p className="text-sm text-green-600 font-medium">
                Giảm {formatDiscount(v.promotion)}
              </p>

              {/* Details */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                {v.promotion.minOrderValue &&
                  Number(v.promotion.minOrderValue) > 0 && (
                    <span>
                      Đơn tối thiểu:{" "}
                      {Number(v.promotion.minOrderValue).toLocaleString()}đ
                    </span>
                  )}
                <span>
                  HSD: {formatDateVN(v.promotion.startDate)} -{" "}
                  {formatDateVN(v.promotion.endDate)}
                </span>
              </div>

              {/* Used date */}
              {v.usedAt && (
                <p className="text-xs text-muted-foreground mt-1">
                  Đã dùng: {formatDateVN(v.usedAt)}
                </p>
              )}

              {/* Dashed divider pattern (coupon style) */}
              {v.status === "AVAILABLE" && (
                <div className="absolute right-0 top-0 bottom-0 w-8 flex items-center">
                  <div className="w-4 h-4 bg-background rounded-full absolute -right-2 top-1/2 -translate-y-1/2"></div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
