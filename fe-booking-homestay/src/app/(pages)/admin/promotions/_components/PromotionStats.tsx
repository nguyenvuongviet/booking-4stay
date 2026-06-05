"use client";
import { Card } from "@/_components/ui/card";
import {
  Award,
  CalendarDays,
  CheckCircle,
  Crown,
  History,
  Percent,
  Sparkles,
  Tag,
  TrendingUp,
  UserPlus,
} from "lucide-react";

interface KpiData {
  totalPromotions: number;
  activePromotions: number;
  totalUsages: number;
  totalDiscountAmount: number;
}

interface TopPromotion {
  id: number;
  code: string;
  name: string;
  promotionType: string;
  discountType: string;
  discountValue: number;
  usageLimit: number;
  usedCount: number;
  usageRate: number;
}

interface TypeBreakdown {
  type: string;
  count: number;
  totalUsed: number;
}

interface Props {
  kpi?: KpiData;
  topPromotions?: TopPromotion[];
  byType?: TypeBreakdown[];
}

const TYPE_LABELS: Record<string, { label: string; icon: any; color: string }> =
  {
    WELCOME: {
      label: "Mã Chào Mừng",
      icon: UserPlus,
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    THANKYOU: {
      label: "Mã Cảm Ơn",
      icon: History,
      color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    LOYALTY: {
      label: "Thành Viên",
      icon: Crown,
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    SEASONAL: {
      label: "Sự Kiện/Mùa",
      icon: CalendarDays,
      color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    },
    NORMAL: {
      label: "Thông Thường",
      icon: Tag,
      color: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
    },
  };

export default function PromotionStats({
  kpi,
  topPromotions = [],
  byType = [],
}: Props) {
  const stats = [
    {
      title: "Tổng số chiến dịch",
      value: kpi?.totalPromotions ?? 0,
      icon: Tag,
      color:
        "from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400",
      border: "border-blue-100 dark:border-blue-900/50",
    },
    {
      title: "Đang hoạt động",
      value: kpi?.activePromotions ?? 0,
      icon: CheckCircle,
      color:
        "from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-100 dark:border-emerald-900/50",
    },
    {
      title: "Số lượt đã dùng",
      value: kpi?.totalUsages ?? 0,
      icon: Award,
      color:
        "from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400",
      border: "border-amber-100 dark:border-amber-900/50",
    },
    {
      title: "Tổng tiền đã giảm",
      value: `${(kpi?.totalDiscountAmount ?? 0).toLocaleString()}đ`,
      icon: TrendingUp,
      color: "from-rose-500/10 to-pink-500/10 text-rose-600 dark:text-rose-400",
      border: "border-rose-100 dark:border-rose-900/50",
    },
  ];

  // Calculate total usages for breakdown percentages
  const grandTotalUsages = byType.reduce((sum, t) => sum + t.totalUsed, 0) || 1;

  return (
    <div className="space-y-6">
      {/* 4 KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card
              key={i}
              className={`p-6 bg-linear-to-br ${stat.color} ${stat.border} border shadow-sm rounded-2xl flex items-center justify-between transition-all hover:scale-[1.02] duration-300`}
            >
              <div className="space-y-1">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {stat.title}
                </span>
                <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {stat.value}
                </h3>
              </div>
              <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                <Icon className="w-6 h-6" />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Visual Analytics Section */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Top Performing Coupons */}
        <Card className="p-6 rounded-2xl border shadow-sm bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2 mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Top 5 Coupon Hiệu Quả Nhất
            </h2>
          </div>

          {topPromotions.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
              Chưa có dữ liệu sử dụng coupon
            </div>
          ) : (
            <div className="space-y-4">
              {topPromotions.slice(0, 5).map((promo) => {
                const typeConfig =
                  TYPE_LABELS[promo.promotionType] || TYPE_LABELS.NORMAL;
                return (
                  <div key={promo.id} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded uppercase tracking-wider">
                          {promo.code}
                        </span>
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">
                          {promo.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${typeConfig.color}`}
                        >
                          {typeConfig.label}
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {promo.usedCount} lượt dùng
                        </span>
                      </div>
                    </div>

                    {/* Progress bar container */}
                    <div className="relative">
                      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-linear-to-r from-primary to-orange-500 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(promo.usageRate, 100)}%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-muted-foreground mt-1">
                        <span>
                          Giới hạn: {promo.usageLimit || "Không giới hạn"}
                        </span>
                        <span className="font-semibold text-primary">
                          {promo.usageRate}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Breakdown by Type */}
        <Card className="p-6 rounded-2xl border shadow-sm bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2 mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Percent className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Hiệu Suất Theo Phân Loại Mã
            </h2>
          </div>

          {byType.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
              Chưa có dữ liệu phân loại coupon
            </div>
          ) : (
            <div className="space-y-4">
              {byType.map((bt) => {
                const typeConfig = TYPE_LABELS[bt.type] || TYPE_LABELS.NORMAL;
                const Icon = typeConfig.icon;
                const percentage = Math.round(
                  (bt.totalUsed / grandTotalUsages) * 100,
                );

                return (
                  <div
                    key={bt.type}
                    className="flex items-center justify-between gap-4 p-3 rounded-xl border border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${typeConfig.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          {typeConfig.label}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {bt.count} chiến dịch
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-slate-900 dark:text-white block">
                        {bt.totalUsed.toLocaleString()} lượt
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        Chiếm {percentage}% tổng dùng
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
