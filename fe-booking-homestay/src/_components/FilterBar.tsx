"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/_components/ui/popover";
import { useLang } from "@/context/lang-context";
import { ArrowUpDown, Check, ChevronDown, Filter, Star } from "lucide-react";
import type React from "react";
import { useState } from "react";

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
            <h3 className="text-sm font-bold tracking-widest text-muted-foreground">
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
                    {/* {isSelected && <Check size={14} className="text-primary" />} */}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Price Section */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold tracking-widest text-muted-foreground">
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
                    {/* {isChecked && <Check size={14} className="text-primary" />} */}
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
                className={`w-full flex items-center justify-between px-2 py-3 rounded-2xl transition-all duration-300 ${
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

export function FilterBar({
  onFilterChange,
}: {
  onFilterChange: (filters: {
    priceRanges?: string[];
    minRating?: number[];
    sortOrder?: "asc" | "desc";
  }) => void;
}) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedStars, setSelectedStars] = useState<number[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [sortOpen, setSortOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState<string>("");
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

  return (
    <div className="flex items-center gap-4 mb-6">
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
              flex items-center gap-2 px-4 py-3 rounded-full transition-all duration-500 shadow-md backdrop-blur-xl border text-muted-foreground
            ${
              filterOpen || activeFilterCount > 0
                ? "border-primary/50 text-primary"
                : ""
            }
          `}
        >
          <Filter size={14} />
          <span className="text-xs tracking-wider ">{t("filter")}</span>
          {activeFilterCount > 0 && (
            <span className="flex items-center justify-center bg-white rounded-full w-4 h-4 text-primary text-[10px] elegant-sans">
              {activeFilterCount}
            </span>
          )}
          <ChevronDown
            size={16}
            className={`transition-transform duration-300 ${filterOpen ? "rotate-180" : ""}`}
          />
        </button>
      </CombinedFilterPopup>

      <div className="ml-auto">
        <OptionsPopup
          options={sortOptions}
          selectedValue={selectedSort}
          onSelect={handleSelectSort}
          open={sortOpen}
          onOpenChange={setSortOpen}
        >
          <button
            className={`
              flex items-center gap-2 px-4 py-3 rounded-full transition-all duration-500 shadow-md backdrop-blur-xl border text-muted-foreground
              ${
                sortOpen || selectedSort ? "border-primary/50 text-primary" : ""
              }
            `}
          >
            <ArrowUpDown size={16} />
            <span className="text-xs tracking-wider">{getSortLabel()}</span>
            <ChevronDown
              size={16}
              className={`transition-transform duration-300 ${sortOpen ? "rotate-180" : ""}`}
            />
          </button>
        </OptionsPopup>
      </div>
    </div>
  );
}
