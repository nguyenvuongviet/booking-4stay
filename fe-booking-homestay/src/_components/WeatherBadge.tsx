"use client";

import { getWeatherUI } from "@/_helper/weather.helper";
import { useWeather } from "@/_hooks/useWeather";
import { useLang } from "@/context/lang-context";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useLang();

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
      className={`relative w-full rounded-2xl overflow-hidden shadow-md lg:shadow-lg border border-white/20 dark:border-white/5 bg-linear-to-br ${bg}`}
    >
      {/* glass overlay */}
      <div className="absolute inset-0 backdrop-blur-2xl opacity-80" />

      {/* Mobile Collapsed Trigger Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="relative lg:hidden flex items-center justify-between px-3 py-2.5 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-all select-none z-10"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg drop-shadow-sm">{ui.icon}</span>
          <div className="text-left">
            <span className="text-[11px] font-bold text-foreground">
              {location}
            </span>
            <span className="text-[11px] font-bold text-primary ml-1.5">
              {weather.avgTemp}°C
            </span>
            <span className="text-[10px] text-foreground/50 ml-1.5 hidden sm:inline">
              — {weather.description}
            </span>
          </div>
        </div>
        <div className="text-foreground/50 p-0.5 bg-white/40 dark:bg-black/40 rounded-full">
          <ChevronDown
            size={12}
            className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {/* Expanded Content (always visible on desktop, toggleable on mobile) */}
      <div
        className={`relative px-3 py-3 ${isExpanded ? "block border-t border-black/5 dark:border-white/5" : "hidden"} lg:block`}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={prev}
            disabled={index === 0}
            className="p-1.5 rounded-full bg-white/50 backdrop-blur-md shadow-sm disabled:opacity-30"
          >
            <ChevronLeft size={14} />
          </button>

          <div className="text-center">
            <div className="text-xs font-semibold">
              {formatDay(date)} • {formatDate(date)}
            </div>
            <div className="text-[10px] text-gray-500">{location}</div>
          </div>

          <button
            onClick={next}
            disabled={index === data.length - 1}
            className="p-1.5 rounded-full bg-white/50 backdrop-blur-md shadow-sm disabled:opacity-30"
          >
            <ChevronRight size={14} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="h-20 relative overflow-hidden">
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
                <div className="text-2xl drop-shadow-md">
                  <span className={ui.color}>{ui.icon}</span>
                </div>

                <div className="text-2xl font-bold mt-0.5">
                  {weather.avgTemp}°
                </div>

                <div className="text-[10px] text-gray-600 mt-0.5">
                  {weather.minTemp}° / {weather.maxTemp}°
                </div>
              </div>

              {/* RIGHT */}
              <div className="flex flex-col items-center justify-center text-center space-y-1">
                <div className="text-xs font-medium">{weather.description}</div>

                <div className="text-[10px] text-gray-600">
                  💧 {t("langCode") === "en" ? "Humidity" : "Độ ẩm"}:{" "}
                  {weather.humidity}%
                </div>

                <div className="text-[10px] text-gray-600">
                  🌬️ {t("langCode") === "en" ? "Wind" : "Gió"}:{" "}
                  {weather.windSpeed} m/s
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* DOTS */}
        <div className="flex justify-center gap-1 mt-2">
          {data.slice(0, 7).map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === index ? "w-2 bg-primary" : "w-1 bg-primary/20"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
