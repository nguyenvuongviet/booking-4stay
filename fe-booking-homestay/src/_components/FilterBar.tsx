"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/_components/ui/popover";
import type { DailyWeather } from "@/_helper/weather.helper";
import { getWeatherUI } from "@/_helper/weather.helper";
import { useLang } from "@/context/lang-context";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpDown,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Star,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";

function CombinedFilterPopup({
  selectedPriceRanges,
  onTogglePrice,
  selectedStars,
  onToggleStar,
  open,
  onOpenChange,
  children,
  priceRanges,
  starOptions,
}: {
  selectedPriceRanges: string[];
  onTogglePrice: (value: string) => void;
  selectedStars: number[];
  onToggleStar: (value: number) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children?: React.ReactNode;
  priceRanges: { label: string; value: string }[];
  starOptions: { label: string; value: number }[];
}) {
  const { t } = useLang();

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className="w-80 p-0 bg-white/90 dark:bg-black/90 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden"
        align="start"
        sideOffset={4}
      >
        <div className="absolute inset-0 -z-10 bg-black/20 backdrop-blur-sm rounded-xl" />
        <div className="bg-card rounded-xl p-6 space-y-4">
          {/* Star Rating Section */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold tracking-widest text-foreground/60">
              {t("rating")}
            </h3>
            <div className="space-y-2">
              {starOptions.map((option) => {
                const isSelected = selectedStars.includes(option.value);
                return (
                  <div
                    key={option.value}
                    onClick={() => onToggleStar(option.value)}
                    className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all duration-300 border ${
                      isSelected
                        ? "bg-primary/10 border-primary/20"
                        : "border-secondary/30 hover:border-secondary/80"
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={`${i < option.value ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                    <span
                      className={`text-xs ${isSelected ? "text-primary" : "text-foreground"}`}
                    >
                      {option.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Price Section */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold tracking-widest text-foreground/60">
              {t("price")}
            </h3>
            <div className="space-y-2">
              {priceRanges.map((option) => {
                const isChecked = selectedPriceRanges.includes(option.value);
                return (
                  <div
                    key={option.value}
                    onClick={() => onTogglePrice(option.value)}
                    className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all duration-300 border ${
                      isChecked
                        ? "bg-primary/10 border-primary/20"
                        : "border-secondary/30 hover:border-secondary/80"
                    }`}
                  >
                    <span
                      className={`text-xs ${isChecked ? "text-primary" : "text-foreground"}`}
                    >
                      {option.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function OptionsPopup({
  options,
  selectedValue,
  onSelect,
  open,
  onOpenChange,
  children,
}: {
  options: { label: string; value: string }[];
  selectedValue: string;
  onSelect: (value: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className="w-56 p-2 bg-white/90 dark:bg-black/90 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl"
        align="end"
        sideOffset={4}
      >
        <div className="space-y-1">
          {options.map((option) => {
            const isSelected = selectedValue === option.value;
            return (
              <button
                key={option.value}
                onClick={() => {
                  onSelect(option.value);
                  onOpenChange(false);
                }}
                className={`w-full flex items-center justify-between px-2 py-3 rounded-2xl transition-all duration-300 cursor-pointer ${
                  isSelected ? "text-primary font-bold" : "hover:font-bold"
                }`}
              >
                <span className="text-sm tracking-wide">{option.label}</span>
                {isSelected && <Check size={14} />}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function WeatherPopup({
  weatherData,
  location,
  open,
  onOpenChange,
  children,
}: {
  weatherData: DailyWeather[];
  location: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const { t } = useLang();

  if (!weatherData.length) return <>{children}</>;

  const weather = weatherData[index];
  const ui = getWeatherUI(weather.icon);
  const date = new Date(weather.date);

  const formatDay = (d: Date) =>
    d.toLocaleDateString("en-US", { weekday: "short" });
  const formatDate = (d: Date) =>
    d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });

  const next = () => {
    setDirection(1);
    setIndex((i) => Math.min(i + 1, weatherData.length - 1));
  };
  const prev = () => {
    setDirection(-1);
    setIndex((i) => Math.max(i - 1, 0));
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className="w-72 p-0 bg-white/90 dark:bg-black/90 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        align="center"
        sideOffset={4}
      >
        <div className="p-3">
          {/* Header with nav */}
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={prev}
              disabled={index === 0}
              className="p-1 rounded-full bg-white/50 dark:bg-white/10 backdrop-blur-md shadow-sm disabled:opacity-30 cursor-pointer"
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
              disabled={index === weatherData.length - 1}
              className="p-1 rounded-full bg-white/50 dark:bg-white/10 backdrop-blur-md shadow-sm disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Content */}
          <div className="h-20 relative overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={index}
                initial={{ opacity: 0, x: direction > 0 ? 40 : -40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction > 0 ? -40 : 40 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 grid grid-cols-2 items-center"
              >
                {/* LEFT */}
                <div className="flex flex-col items-center justify-center">
                  <div className="text-2xl drop-shadow-md">
                    <span className={ui.color}>{ui.icon}</span>
                  </div>
                  <div className="text-xl font-bold mt-0.5">
                    {weather.avgTemp}°
                  </div>
                  <div className="text-[10px] text-gray-600 mt-0.5">
                    {weather.minTemp}° / {weather.maxTemp}°
                  </div>
                </div>

                {/* RIGHT */}
                <div className="flex flex-col items-center justify-center text-center space-y-1">
                  <div className="text-xs font-medium">
                    {weather.description}
                  </div>
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

          {/* Dots */}
          <div className="flex justify-center gap-1 mt-2">
            {weatherData.slice(0, 7).map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === index ? "w-2 bg-primary" : "w-1 bg-primary/20"
                }`}
              />
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function FilterBar({
  filters,
  onFilterChange,
  weatherData,
  weatherLocation,
}: {
  filters?: {
    priceRanges?: string[];
    minRating?: number[];
    sortOrder?: "asc" | "desc";
  };
  onFilterChange: (filters: {
    priceRanges?: string[];
    minRating?: number[];
    sortOrder?: "asc" | "desc";
  }) => void;
  weatherData?: DailyWeather[];
  weatherLocation?: string;
}) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedStars, setSelectedStars] = useState<number[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [sortOpen, setSortOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState<string>("");
  const [weatherOpen, setWeatherOpen] = useState(false);

  useEffect(() => {
    if (filters) {
      setSelectedStars(filters.minRating || []);
      setSelectedPriceRanges(filters.priceRanges || []);
      setSelectedSort(filters.sortOrder || "");
    }
  }, [filters]);
  const activeFilterCount =
    (selectedStars.length ? 1 : 0) +
    (selectedPriceRanges.length ? 1 : 0) +
    (selectedSort ? 1 : 0);

  const { t } = useLang();

  const applyFilters = (stars: number[], prices: string[], sort: string) => {
    onFilterChange({
      priceRanges: prices,
      minRating: stars.length > 0 ? stars : undefined,
      sortOrder:
        sort === "asc" || sort === "desc"
          ? (sort as "asc" | "desc")
          : undefined,
    });
  };

  const handleSelectSort = (value: string) => {
    const newSort = selectedSort === value ? "" : value;
    setSelectedSort(newSort);
    applyFilters(selectedStars, selectedPriceRanges, newSort);
  };

  const handleToggleStar = (value: number) => {
    const newValue = selectedStars.includes(value)
      ? selectedStars.filter((v) => v !== value)
      : [...selectedStars, value];
    setSelectedStars(newValue);
    applyFilters(newValue, selectedPriceRanges, selectedSort);
  };

  const handleTogglePrice = (value: string) => {
    const newValues = selectedPriceRanges.includes(value)
      ? selectedPriceRanges.filter((v) => v !== value)
      : [...selectedPriceRanges, value];
    setSelectedPriceRanges(newValues);
    applyFilters(selectedStars, newValues, selectedSort);
  };

  const sortOptions = [
    { label: t("price lowest to highest"), value: "asc" },
    { label: t("price highest to lowest"), value: "desc" },
  ];

  const getSortLabel = () => {
    const option = sortOptions.find((opt) => opt.value === selectedSort);
    return option?.label || t("sort by price");
  };

  const starOptions = [
    { label: `5 ${t("stars")}`, value: 5 },
    { label: `4 ${t("stars")}`, value: 4 },
    { label: `3 ${t("stars")}`, value: 3 },
    { label: `2 ${t("stars")}`, value: 2 },
    { label: `1 ${t("stars")}`, value: 1 },
  ];

  const priceRanges = [
    { label: `${t("under")} 500,000 VND`, value: "0-500000" },
    { label: "500,000 VND - 1,000,000 VND", value: "500000-1000000" },
    { label: "1,000,000 VND - 2,000,000 VND", value: "1000000-2000000" },
    { label: "2,000,000 VND - 3,000,000 VND", value: "2000000-3000000" },
    { label: `${t("over")} 3,000,000 VND`, value: "3000000+" },
  ];

  // Get current weather for button label
  const currentWeather = weatherData?.[0];
  const weatherUi = currentWeather ? getWeatherUI(currentWeather.icon) : null;

  return (
    <div className="flex flex-row items-center justify-between w-full gap-2 sm:gap-4">
      {/* Left group: Filter & Sort */}
      <div className="flex flex-row items-center gap-1.5 min-[400px]:gap-2 flex-1 min-w-0">
        <div className="flex-initial min-w-0">
          <CombinedFilterPopup
            selectedPriceRanges={selectedPriceRanges}
            onTogglePrice={handleTogglePrice}
            selectedStars={selectedStars}
            onToggleStar={handleToggleStar}
            open={filterOpen}
            onOpenChange={setFilterOpen}
            priceRanges={priceRanges}
            starOptions={starOptions}
          >
            <button
              className={`
                flex items-center justify-center rounded-full transition-all duration-500 shadow-md backdrop-blur-xl border border-border bg-white/90 dark:bg-black/90 text-foreground/70 hover:text-foreground cursor-pointer w-full
                h-9 min-[400px]:h-10
                px-2.5 min-[400px]:px-3
                gap-1 min-[400px]:gap-1.5
                text-[11px] min-[400px]:text-xs
                ${
                  filterOpen || activeFilterCount > 0
                    ? "border-primary/50 text-primary"
                    : ""
                }
              `}
            >
              <Filter className="w-3 h-3 min-[400px]:w-3.5 min-[400px]:h-3.5" />
              <span className="tracking-wider truncate">{t("filter")}</span>
              {activeFilterCount > 0 && (
                <span className="flex items-center justify-center bg-white rounded-full w-4 h-4 text-primary text-[10px] elegant-sans shrink-0">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown
                className={`w-3 h-3 min-[400px]:w-3.5 min-[400px]:h-3.5 shrink-0 transition-transform duration-300 ${filterOpen ? "rotate-180" : ""}`}
              />
            </button>
          </CombinedFilterPopup>
        </div>

        <div className="flex-initial min-w-0">
          <OptionsPopup
            options={sortOptions}
            selectedValue={selectedSort}
            onSelect={handleSelectSort}
            open={sortOpen}
            onOpenChange={setSortOpen}
          >
            <button
              className={`
                flex items-center justify-center rounded-full transition-all duration-500 shadow-md backdrop-blur-xl border border-border bg-white/90 dark:bg-black/90 text-foreground/70 hover:text-foreground cursor-pointer w-full
                h-9 min-[400px]:h-10
                px-2.5 min-[400px]:px-3
                gap-1 min-[400px]:gap-1.5
                text-[11px] min-[400px]:text-xs
                ${
                  sortOpen || selectedSort
                    ? "border-primary/50 text-primary"
                    : ""
                }
              `}
            >
              <ArrowUpDown className="w-3 h-3 min-[400px]:w-3.5 min-[400px]:h-3.5" />
              <span className="tracking-wider truncate">{getSortLabel()}</span>
              <ChevronDown
                className={`w-3 h-3 min-[400px]:w-3.5 min-[400px]:h-3.5 shrink-0 transition-transform duration-300 ${sortOpen ? "rotate-180" : ""}`}
              />
            </button>
          </OptionsPopup>
        </div>
      </div>

      {/* Right group: Weather */}
      {weatherLocation && (
        <div className="flex-initial">
          {weatherData && weatherData.length > 0 ? (
            <WeatherPopup
              weatherData={weatherData}
              location={weatherLocation}
              open={weatherOpen}
              onOpenChange={setWeatherOpen}
            >
              <button
                className={`
                  flex items-center justify-center rounded-full transition-all duration-500 shadow-md backdrop-blur-xl border border-border bg-white/90 dark:bg-black/90 text-foreground/70 hover:text-foreground cursor-pointer
                  h-9 min-[400px]:h-10
                  px-2 min-[400px]:px-2.5
                  gap-1 min-[400px]:gap-1.25
                  text-[11px] min-[400px]:text-xs
                  ${weatherOpen ? "border-primary/50 text-primary" : ""}
                `}
              >
                <span className="text-xs min-[400px]:text-sm shrink-0">
                  {weatherUi?.icon || "☁️"}
                </span>
                <span className="font-semibold tracking-wider">
                  {currentWeather?.avgTemp}°
                </span>
                <ChevronDown
                  className={`w-3 h-3 min-[400px]:w-3.5 min-[400px]:h-3.5 shrink-0 transition-transform duration-300 ${weatherOpen ? "rotate-180" : ""}`}
                />
              </button>
            </WeatherPopup>
          ) : (
            <button
              disabled
              className="flex items-center justify-center rounded-full shadow-md border border-border bg-white/90 dark:bg-black/90 text-foreground/30 animate-pulse cursor-wait h-9 min-[400px]:h-10 px-2 min-[400px]:px-2.5 gap-1 min-[400px]:gap-1.25 text-[11px] min-[400px]:text-xs"
            >
              <span className="text-xs min-[400px]:text-sm shrink-0">☁️</span>
              <span className="font-semibold tracking-wider select-none">
                --°
              </span>
              <ChevronDown className="w-3 h-3 min-[400px]:w-3.5 min-[400px]:h-3.5 shrink-0 opacity-30" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
