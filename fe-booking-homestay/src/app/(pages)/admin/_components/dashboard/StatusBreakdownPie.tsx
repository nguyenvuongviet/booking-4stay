"use client";

import { Card } from "@/_components/ui/card";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
} from "recharts";

interface StatusItem {
  status: string;
  count: number;
}

interface StatusBreakdownPieProps {
  bookingStatusBreakdown: StatusItem[];
  statusColors: Record<string, { label: string; color: string }>;
}

export function StatusBreakdownPie({
  bookingStatusBreakdown,
  statusColors,
}: StatusBreakdownPieProps) {
  const pieChartData = bookingStatusBreakdown
    .map((item) => ({
      name: statusColors[item.status]?.label ?? item.status,
      value: item.count,
      status: item.status,
    }))
    .filter((item) => item.value > 0);

  return (
    <Card className="p-6 bg-white/70 backdrop-blur-md rounded-2xl border border-slate-100 shadow-xl shadow-slate-100/50 flex flex-col h-full">
      <h2 className="text-lg font-bold text-slate-800 mb-2">
        Cơ cấu trạng thái đặt phòng
      </h2>
      <p className="text-xs text-muted-foreground mb-6">
        Tỷ lệ các trạng thái đơn đặt phòng trên hệ thống.
      </p>

      <div className="flex-1 flex flex-col items-center justify-center min-h-55">
        {pieChartData.length === 0 ? (
          <div className="text-sm text-slate-400 py-10">
            Không có dữ liệu đơn phòng
          </div>
        ) : (
          <>
            <div className="w-full h-45 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    stroke="#fff"
                    strokeWidth={2}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={statusColors[entry.status]?.color ?? "#6b7280"}
                      />
                    ))}
                  </Pie>
                  <RTooltip
                    contentStyle={{
                      background: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid #f1f5f9",
                      borderRadius: "12px",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 text-xs justify-center max-w-sm">
              {pieChartData.slice(0, 6).map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      backgroundColor:
                        statusColors[item.status]?.color ?? "#6b7280",
                    }}
                  />
                  <span className="text-slate-600 font-medium">
                    {item.name}
                  </span>
                  <span className="text-slate-400">({item.value})</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
