"use client";

import { Card } from "@/_components/ui/card";
import { useState } from "react";
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";

interface MonthlyData {
  month: string;
  revenue: number;
  bookings: number;
}

interface RevenueTrendChartProps {
  revenue: MonthlyData[];
  year: number;
  onYearChange: (year: number) => void;
  currentYear: number;
}

export function RevenueTrendChart({
  revenue,
  year,
  onYearChange,
  currentYear,
}: RevenueTrendChartProps) {
  const [hideEmptyMonths, setHideEmptyMonths] = useState(true);

  const chartData = revenue.map((m) => ({
    month: m.month,
    revenue: Number(m.revenue ?? 0),
    bookings: Number(m.bookings ?? 0),
  }));

  const filteredMonthlyData = revenue.filter(
    (m) => !hideEmptyMonths || Number(m.revenue) > 0 || Number(m.bookings) > 0,
  );

  const selectedYearRevenueTotal = revenue.reduce(
    (sum, m) => sum + Number(m.revenue ?? 0),
    0,
  );
  const selectedYearBookingsTotal = revenue.reduce(
    (sum, m) => sum + Number(m.bookings ?? 0),
    0,
  );

  return (
    <Card className="p-6 bg-white/70 backdrop-blur-md rounded-2xl border border-slate-100 shadow-xl shadow-slate-100/50">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            Biểu đồ doanh thu & lượt đặt phòng
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Chi tiết xu hướng phát triển doanh số theo từng tháng.
          </p>
          <div className="flex flex-wrap gap-2 mt-3 text-xs">
            <span className="bg-sky-50 text-sky-700 px-2.5 py-1 rounded-md font-semibold">
              Tổng doanh thu năm {year}:{" "}
              {selectedYearRevenueTotal.toLocaleString()} ₫
            </span>
            <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md font-semibold">
              Tổng đơn năm {year}: {selectedYearBookingsTotal} lượt
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs font-semibold text-slate-500">
            Năm báo cáo:
          </span>
          <select
            className="h-9 px-3 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            value={year}
            onChange={(e) => onYearChange(Number(e.target.value))}
          >
            {Array.from({ length: 5 }).map((_, i) => {
              const y = currentYear - i;
              return (
                <option key={y} value={y}>
                  {y}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      <div className="h-75 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: -5, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f1f5f9"
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              className="text-[10px] text-slate-400 font-medium"
            />
            <YAxis
              yAxisId="left"
              tickLine={false}
              axisLine={false}
              className="text-[10px] text-slate-400 font-medium"
              tickFormatter={(v) => (v / 1_000_000).toFixed(0) + " tr"}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickLine={false}
              axisLine={false}
              className="text-[10px] text-slate-400 font-medium"
              tickFormatter={(v) => v.toLocaleString()}
            />
            <RTooltip
              contentStyle={{
                background: "rgba(255, 255, 255, 0.95)",
                border: "1px solid #f1f5f9",
                borderRadius: "12px",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
              }}
              formatter={(value: any, name) => {
                if (name === "revenue")
                  return [Number(value).toLocaleString() + " ₫", "Doanh thu"];
                return [value + " đơn", "Lượt đặt"];
              }}
            />
            <Legend iconType="circle" className="text-xs font-semibold" />

            <Area
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              stroke="#0ea5e9"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
            <Bar
              yAxisId="right"
              dataKey="bookings"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
              barSize={16}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed table view toggle */}
      <div className="mt-6 pt-5 border-t border-slate-100">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-bold text-slate-800">
            Chi tiết doanh số theo từng tháng
          </span>
          <label className="flex items-center gap-1.5 text-[11px] text-slate-500 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hideEmptyMonths}
              onChange={(e) => setHideEmptyMonths(e.target.checked)}
              className="rounded border-slate-300 text-sky-500 focus:ring-sky-500 h-3.5 w-3.5"
            />
            Ẩn tháng không có giao dịch
          </label>
        </div>

        <div className="overflow-x-auto max-h-40 overflow-y-auto border border-slate-100 rounded-lg">
          <table className="w-full text-xs text-left">
            <thead className="sticky top-0 bg-slate-50 text-slate-400 font-semibold border-b border-slate-100 z-10">
              <tr>
                <th className="py-2.5 px-3">Tháng</th>
                <th className="py-2.5 px-3 text-center">Số lượng đơn</th>
                <th className="py-2.5 px-3 text-right">Doanh thu đạt được</th>
                <th className="py-2.5 px-3 text-right">% Đóng góp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredMonthlyData.map((m) => {
                const revenuePercent =
                  selectedYearRevenueTotal > 0
                    ? (Number(m.revenue) / selectedYearRevenueTotal) * 100
                    : 0;
                return (
                  <tr
                    key={m.month}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="py-2 px-3 font-semibold text-slate-700">
                      {m.month}
                    </td>
                    <td className="py-2 px-3 text-center text-slate-600 font-medium">
                      {m.bookings} đơn
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-slate-800">
                      {Number(m.revenue).toLocaleString()} ₫
                    </td>
                    <td className="py-2 px-3 text-right text-slate-400 font-medium">
                      {revenuePercent.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
              {filteredMonthlyData.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="py-8 text-center text-slate-400 italic"
                  >
                    Không có dữ liệu kinh doanh trong năm {year}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}
