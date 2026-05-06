"use client";

import type React from "react";

import { Button } from "@/_components/ui/button";
import { Checkbox } from "@/_components/ui/checkbox";
import { Label } from "@/_components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/_components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/_components/ui/radio-group";
import { useLang } from "@/context/lang-context";
import { ArrowUpDown, Check, ChevronDown, Filter, Star } from "lucide-react";
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
        className="w-80 p-0 shadow-lg rounded-xl"
        align="start"
        sideOffset={4}
      >
        <div className="absolute inset-0 -z-10 bg-black/20 backdrop-blur-sm rounded-xl" />
        <div className="bg-card rounded-xl p-6 space-y-4">
          {/* Star Rating Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              {/* <Star className="h-5 w-5 fill-amber-400 text-amber-400" /> */}
              <h3 className="text-lg elegant-sans">{t("rating")}</h3>
            </div>
            <RadioGroup
              value={selectedStars[0]?.toString() || ""}
              onValueChange={(value) => onToggleStar(Number(value))}
            >
              <div className="space-y-2">
                {starOptions.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-2"
                    onClick={() => onToggleStar(option.value)}
                  >
                    <RadioGroupItem
                      id={`star-${option.value}`}
                      value={option.value.toString()}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex items-center gap-1 flex-1 cursor-pointer">
                      {[...Array(option.value)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-amber-400 text-amber-400"
                        />
                      ))}
                    </div>
                    <Label
                      htmlFor={`star-${option.value}`}
                      className="text-sm elegant-subheading cursor-pointer"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Divider */}
          <div className="h-px bg-border" />

          {/* Price Section */}
          <div>
            <h3 className="text-lg elegant-sans mb-4">{t("price")}</h3>
            <div className="space-y-2">
              {priceRanges.map((option) => (
                <div key={option.value} className="flex items-center space-x-3">
                  <Checkbox
                    id={`price-${option.value}`}
                    checked={selectedPriceRanges.includes(option.value)}
                    onCheckedChange={() => onTogglePrice(option.value)}
                    className="w-5 h-5"
                  />
                  <Label
                    htmlFor={`price-${option.value}`}
                    className="text-sm elegant-subheading cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
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
        className="w-58 rounded-xl shadow-xl p-0 m-0"
        align="end"
        sideOffset={8}
      >
        <div className="bg-background rounded-xl">
          <div className="space-y-1">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onSelect(option.value);
                  onOpenChange(false);
                }}
                className="w-full flex items-center justify-center px-2 py-3 hover:bg-accent/50 rounded-md transition-colors"
              >
                <span className="elegant-subheading text-muted-foreground">
                  {option.label}
                </span>
                {selectedValue === option.value && (
                  <Check className="h-5 w-5 text-gray-900" />
                )}
              </button>
            ))}
          </div>
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
    minRating?: number;
    sortOrder?: "asc" | "desc";
  }) => void;
}) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedStars, setSelectedStars] = useState<number | null>(null);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [sortOpen, setSortOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState<string>("");
  const activeFilterCount =
    (selectedStars ? 1 : 0) +
    (selectedPriceRanges.length ? 1 : 0) +
    (selectedSort ? 1 : 0);

  const { t } = useLang();

  const applyFilters = (
    stars: number | null,
    prices: string[],
    sort: string,
  ) => {
    onFilterChange({
      priceRanges: prices,
      minRating: stars || undefined,
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
    const newValue = selectedStars === value ? null : value;
    setSelectedStars(newValue);
    applyFilters(newValue, selectedPriceRanges, selectedSort);
  };

  const handleTogglePrice = (value: string) => {
    const newValues = selectedPriceRanges.includes(value)
      ? selectedPriceRanges.filter((v) => v !== value) // bỏ chọn
      : [...selectedPriceRanges, value]; // chọn thêm
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
    { label: `4+ ${t("stars")}`, value: 4 },
    { label: `3+ ${t("stars")}`, value: 3 },
    { label: `2+ ${t("stars")}`, value: 2 },
    { label: `1+ ${t("stars")}`, value: 1 },
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
        selectedStars={selectedStars ? [selectedStars] : []}
        onToggleStar={handleToggleStar}
        open={filterOpen}
        onOpenChange={setFilterOpen}
        priceRanges={priceRanges}
        starOptions={starOptions}
      >
        <Button
          variant="outline"
          size="lg"
          className="shadow-sm text-foreground elegant-subheading"
        >
          {" "}
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span>{t("filter")}</span>
          {activeFilterCount > 0 && (
            <span className="text-xs font-semibold text-primary">
              ({activeFilterCount})
            </span>
          )}
          <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
        </Button>
      </CombinedFilterPopup>

      <div className="ml-auto">
        <OptionsPopup
          options={sortOptions}
          selectedValue={selectedSort}
          onSelect={handleSelectSort}
          open={sortOpen}
          onOpenChange={setSortOpen}
        >
          <Button
            variant="outline"
            size="lg"
            className="shadow-sm text-foreground elegant-subheading"
          >
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            {getSortLabel()}
            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
          </Button>
        </OptionsPopup>
      </div>
    </div>
  );
}
