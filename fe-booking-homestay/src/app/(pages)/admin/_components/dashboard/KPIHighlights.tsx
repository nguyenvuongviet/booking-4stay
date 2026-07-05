"use client";

import { Card } from "@/_components/ui/card";
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Home,
  Star,
  Wallet,
} from "lucide-react";

interface KPIHighlightsProps {
  totalRevenue: number;
  revenueChangePercent: number;
  totalBookings: number;
  bookingsChangePercent: number;
  occupancyRate: number;
  occupancyRateChangePercent: number;
  averageRating: number;
  totalReviews: number;
}

export function KPIHighlights({
  totalRevenue,
  revenueChangePercent,
  totalBookings,
  bookingsChangePercent,
  occupancyRate,
  occupancyRateChangePercent,
  averageRating,
  totalReviews,
}: KPIHighlightsProps) {
  const kpiData = [
    {
      label: "Doanh thu thực tế",
      value: totalRevenue.toLocaleString() + " ₫",
      icon: Wallet,
      change: revenueChangePercent,
      changeLabel: "so với tháng trước",
      iconColor: "text-sky-600 bg-sky-50",
    },
    {
      label: "Tỷ lệ lấp đầy",
      value: occupancyRate.toFixed(1) + "%",
      icon: Home,
      change: occupancyRateChangePercent,
      changeLabel: "chênh lệch tháng trước",
      iconColor: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Tổng lượt đặt phòng",
      value: totalBookings.toLocaleString(),
      icon: Calendar,
      change: bookingsChangePercent,
      changeLabel: "so với tháng trước",
      iconColor: "text-indigo-600 bg-indigo-50",
    },
    {
      label: "Đánh giá dịch vụ",
      value: averageRating.toFixed(1) + " / 5.0",
      icon: Star,
      subText: `${totalReviews} lượt đánh giá`,
      iconColor: "text-amber-600 bg-amber-50",
    },
  ];

  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
      {kpiData.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <Card
            key={idx}
            className="p-3.5 sm:p-6 relative bg-white/70 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-sm sm:shadow-xl shadow-slate-100/50 border border-slate-100 hover:scale-[1.02] transition-transform duration-300 overflow-hidden"
          >
            {/* Background design pattern */}
            <div className="absolute -top-12 -right-12 w-24 h-24 sm:w-28 sm:h-28 bg-slate-50 rounded-full opacity-40 z-0"></div>

            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  {kpi.label}
                </p>
                <h3 className="text-base sm:text-2xl font-extrabold text-slate-800 mt-1.5 sm:mt-2 tracking-tight">
                  {kpi.value}
                </h3>
              </div>
              <div
                className={`p-2 sm:p-3 rounded-lg sm:rounded-xl shrink-0 ${kpi.iconColor}`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-50 flex flex-wrap items-center gap-1 relative z-10 text-[9px] sm:text-xs">
              {kpi.change !== undefined ? (
                <>
                  <span
                    className={`flex items-center gap-0.5 font-bold shrink-0 ${
                      kpi.change >= 0 ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {kpi.change >= 0 ? (
                      <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    )}
                    {kpi.change >= 0 ? "+" : ""}
                    {kpi.change.toFixed(1)}%
                  </span>
                  <span className="text-slate-400 font-medium leading-tight">
                    {kpi.changeLabel}
                  </span>
                </>
              ) : (
                <span className="text-slate-400 font-medium flex items-center gap-1">
                  <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500 fill-amber-500" />
                  {kpi.subText}
                </span>
              )}
            </div>
          </Card>
        );
      })}
    </section>
  );
}
