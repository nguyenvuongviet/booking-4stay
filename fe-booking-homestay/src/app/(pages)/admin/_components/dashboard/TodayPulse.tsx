"use client";

import { Activity } from "lucide-react";

interface TodayPulseProps {
  checkInsToday: number;
  checkOutsToday: number;
  currentlyStaying: number;
  newBookingsToday: number;
}

export function TodayPulse({
  checkInsToday,
  checkOutsToday,
  currentlyStaying,
  newBookingsToday,
}: TodayPulseProps) {
  const items = [
    {
      label: "Lượt Check-in hôm nay",
      value: checkInsToday,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 border-emerald-100",
      desc: "Số đơn nhận phòng",
    },
    {
      label: "Lượt Check-out hôm nay",
      value: checkOutsToday,
      color: "text-sky-600",
      bgColor: "bg-sky-50 border-sky-100",
      desc: "Số đơn trả phòng",
    },
    {
      label: "Đang ở tại homestay",
      value: currentlyStaying,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50 border-indigo-100",
      desc: "Khách đang lưu trú",
    },
    {
      label: "Đơn đặt mới hôm nay",
      value: newBookingsToday,
      color: "text-amber-600",
      bgColor: "bg-amber-50 border-amber-100",
      desc: "Đơn đặt phòng mới",
    },
  ];

  return (
    <section className="bg-linear-to-r from-sky-500/10 via-indigo-500/5 to-transparent p-5 rounded-2xl border border-sky-100">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-sky-600 animate-pulse" />
        <h2 className="text-lg font-bold text-slate-800">
          Hoạt động vận hành hôm nay
        </h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((item, index) => (
          <div
            key={index}
            className={`p-4 rounded-xl border ${item.bgColor} flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow`}
          >
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {item.label}
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className={`text-2xl font-extrabold ${item.color}`}>
                {item.value}
              </span>
              <span className="text-xs text-gray-400 font-medium">lượt</span>
            </div>
            <span className="text-[10px] text-gray-400 mt-1">{item.desc}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
