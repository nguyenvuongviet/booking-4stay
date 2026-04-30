"use client";

import { getWeatherUI } from "@/_helper/weather.helper";
import { useWeather } from "@/_hooks/useWeather";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function WeatherBadge({
  location,
  lat,
  lon,
}: {
  location?: string;
  lat?: number | string;
  lon?: number | string;
}) {
  const { data } = useWeather(lat, lon);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  if (!location || !data.length) return null;

  const weather = data[index];
  const ui = getWeatherUI(weather.icon);

  const date = new Date(weather.date);

  const formatDay = (d: Date) =>
    d.toLocaleDateString("en-US", { weekday: "short" });

  const formatDate = (d: Date) =>
    d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });

  const next = () => {
    setDirection(1);
    setIndex((i) => Math.min(i + 1, data.length - 1));
  };

  const prev = () => {
    setDirection(-1);
    setIndex((i) => Math.max(i - 1, 0));
  };
  const bgMap: any = {
    Nắng: "from-yellow-50 via-orange-50 to-sky-50",
    Mưa: "from-sky-100 via-blue-100 to-slate-100",
    "Nhiều mây": "from-gray-200 via-gray-100 to-sky-50",
  };

  const bg = bgMap[ui.label] || "from-sky-100 via-white to-blue-100";

  return (
    <div
      className={`relative w-full rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-linear-to-br ${bg}`}
    >
      {/* glass overlay */}
      <div className="absolute inset-0 backdrop-blur-2xl opacity-70" />

      <div className="relative p-4">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prev}
            disabled={index === 0}
            className="p-2 rounded-full bg-white/50 backdrop-blur-md shadow-sm disabled:opacity-30"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="text-center">
            <div className="text-sm font-semibold">
              {formatDay(date)} • {formatDate(date)}
            </div>
            <div className="text-[11px] text-gray-500">{location}</div>
          </div>

          <button
            onClick={next}
            disabled={index === data.length - 1}
            className="p-2 rounded-full bg-white/50 backdrop-blur-md shadow-sm disabled:opacity-30"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="h-25 relative overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={index}
              initial={{ opacity: 0, x: direction > 0 ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction > 0 ? -50 : 50 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 grid grid-cols-2 items-center"
            >
              {/* LEFT */}
              <div className="flex flex-col items-center justify-center">
                <div className="text-4xl drop-shadow-md">
                  <span className={ui.color}>{ui.icon}</span>
                </div>

                <div className="text-3xl font-bold mt-1">
                  {weather.avgTemp}°
                </div>

                <div className="text-xs text-gray-600 mt-1">
                  {weather.minTemp}° / {weather.maxTemp}°
                </div>
              </div>

              {/* RIGHT */}
              <div className="flex flex-col items-center justify-center text-center space-y-2">
                <div className="text-base font-medium">
                  {weather.description}
                </div>

                <div className="text-xs text-gray-600">
                  💧 Độ ẩm: {weather.humidity}%
                </div>

                <div className="text-xs text-gray-600">
                  🌬️ Gió: {weather.windSpeed} m/s
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* DOTS */}
        <div className="flex justify-center gap-1 mt-4">
          {data.slice(0, 7).map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === index ? "w-2 bg-primary" : "w-1 bg-muted/20"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
