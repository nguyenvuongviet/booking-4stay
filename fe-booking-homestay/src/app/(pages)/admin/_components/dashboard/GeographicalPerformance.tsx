"use client";

import { Card } from "@/_components/ui/card";
import { MapPin } from "lucide-react";

interface ProvinceItem {
  provinceName: string;
  bookings: number;
  revenue: number;
}

interface GeographicalPerformanceProps {
  provinceDistribution: ProvinceItem[];
}

export function GeographicalPerformance({
  provinceDistribution,
}: GeographicalPerformanceProps) {
  return (
    <Card className="p-6 bg-white/70 backdrop-blur-md rounded-2xl border border-slate-100 shadow-xl shadow-slate-100/50 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-2">
        <MapPin className="w-5 h-5 text-indigo-500" />
        <h2 className="text-lg font-bold text-slate-800">
          Top khu vực kinh doanh hiệu quả
        </h2>
      </div>
      <p className="text-xs text-muted-foreground mb-6">
        Thống kê doanh số theo địa điểm Tỉnh / Thành phố.
      </p>

      <div className="flex-1 flex flex-col justify-between">
        {provinceDistribution.length === 0 ? (
          <div className="text-sm text-slate-400 py-12 text-center my-auto">
            Chưa có dữ liệu đặt phòng theo khu vực
          </div>
        ) : (
          <div className="space-y-5 my-auto">
            {provinceDistribution.map((item, index) => {
              const maxRevenue = provinceDistribution[0]?.revenue || 1;
              const ratioWidth = (item.revenue / maxRevenue) * 100;
              return (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700 flex items-center gap-1.5">
                      <span className="w-4 h-4 bg-slate-100 rounded-full flex items-center justify-center text-[10px] text-slate-500 font-bold">
                        {index + 1}
                      </span>
                      {item.provinceName}
                    </span>
                    <span className="text-slate-800">
                      {item.revenue.toLocaleString()} ₫
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-1000"
                      style={{ width: `${ratioWidth}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                    <span>{item.bookings} lượt đặt đơn</span>
                    <span>{ratioWidth.toFixed(0)}% so với top 1</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div className="pt-4 border-t border-slate-50 mt-6 text-center text-xs text-slate-400 font-medium">
          Số liệu thống kê dựa trên doanh thu của các homestay đã nhận phòng.
        </div>
      </div>
    </Card>
  );
}
