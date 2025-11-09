"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ArrowUpDown, Check, ChevronDown, Star, Filter } from "lucide-react";
import { useState } from "react";

function CheckboxPopup({
  title,
  options,
  selectedValues,
  onToggle,
  onSeeResult,
  open,
  onOpenChange,
  children,
}: {
  title: string;
  options: { label: string; value: string | number }[];
  selectedValues: (string | number)[];
  onToggle: (value: string | number) => void;
  onSeeResult: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children?: React.ReactNode;
}) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className="w-76 p-0 shadow-lg rounded-xl "
        align="start"
        sideOffset={4}
      >
        <div className="absolute inset-0 -z-10 bg-black/20 backdrop-blur-sm rounded-xl" />
        <div className="bg-card rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-4">{title}</h3>
          <div className="space-y-4 mb-6 ">
            {options.map((option) => (
              <div key={option.value} className=" flex items-center space-x-3">
                <Checkbox
                  id={`${title}-${option.value}`}
                  checked={selectedValues.includes(option.value)}
                  onCheckedChange={() => onToggle(option.value)}
                  className="w-5 h-5"
                />
                <Label
                  htmlFor={`${title}-${option.value}`}
                  className="text-sm font-normal cursor-pointer "
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-full h-10 w-24 text-sm font-medium hover:bg-secondary/50"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                onSeeResult();
                onOpenChange(false);
              }}
              className="flex-1 rounded-full h-10 w-24 text-sm font-medium bg-primary hover:bg-primary/80 text-white"
            >
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function CombinedFilterPopup({
  selectedPriceRanges,
  onTogglePrice,
  selectedStars,
  onToggleStar,
  onApplyFilters,
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
  onApplyFilters: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children?: React.ReactNode;
  priceRanges: { label: string; value: string }[];
  starOptions: { label: string; value: number }[];
}) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className="w-80 p-0 shadow-lg rounded-xl"
        align="start"
        sideOffset={4}
      >
        <div className="absolute inset-0 -z-10 bg-black/20 backdrop-blur-sm rounded-xl" />
        <div className="bg-card rounded-xl p-6 space-y-6">
          {/* Star Rating Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              {/* <Star className="h-5 w-5 fill-amber-400 text-amber-400" /> */}
              <h3 className="text-lg elegant-sans">Rating</h3>
            </div>
            <RadioGroup
              value={selectedStars[0]?.toString() || ""}
              onValueChange={(value) => onToggleStar(Number(value))}
            >
              <div className="space-y-3">
                {starOptions.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-3"
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
            <h3 className="text-lg elegant-sans mb-4">Price</h3>
            <div className="space-y-3">
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

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-full h-10 text-sm elegant-sans"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                onApplyFilters();
                onOpenChange(false);
              }}
              className="flex-1 rounded-full h-10 text-sm elegant-sans bg-primary hover:bg-primary/80"
            >
              Apply
            </Button>
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
        className="w-72 rounded-xl shadow-xl p-0 m-0"
        align="end"
        sideOffset={8}
      >
        <div className="absolute inset-0 pl-2 -z-10 bg-black/20 backdrop-blur-sm rounded-xl" />

        <div className="bg-background rounded-xl pl-2">
          <div className="space-y-1">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onSelect(option.value);
                  onOpenChange(false);
                }}
                className="w-full flex items-center justify-between px-3 py-3 text-left hover:bg-gray-50 rounded-md transition-colors"
              >
                <span className="text-base elegant-subheading text-muted-foreground">
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
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    sortOrder?: "asc" | "desc";
  }) => void;
}) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedStars, setSelectedStars] = useState<number | null>(null);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [sortOpen, setSortOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState<string>("");

  const handleApplyFilters = (overrideSort?: string) => {
    let minPrice: number | undefined;
    let maxPrice: number | undefined;
    let minRating: number | undefined;

    if (selectedPriceRanges.length > 0) {
      // Mảng chứa tất cả min và max tạm thời
      const minList: number[] = [];
      const maxList: number[] = [];

      selectedPriceRanges.forEach((range) => {
        if (range.includes("+")) {
          // Ví dụ: "3000000+"
          const min = Number.parseInt(range.replace("+", ""));
          minList.push(min);
        } else {
          // Ví dụ: "500000-1000000"
          const [min, max] = range.split("-").map(Number);
          minList.push(min);
          maxList.push(max);
        }
      });

      // Lấy min nhỏ nhất và max lớn nhất
      minPrice = Math.min(...minList);
      if (maxList.length > 0) {
        maxPrice = Math.max(...maxList);
      }

      // Nếu có dấu "+", nghĩa là không có giới hạn trên
      if (selectedPriceRanges.some((r) => r.includes("+"))) {
        maxPrice = undefined;
      }
    }

    if (selectedStars) {
      minRating = selectedStars;
    }

    onFilterChange({
      minPrice,
      maxPrice,
      minRating,
      sortOrder:
        overrideSort === "asc" || overrideSort === "desc"
          ? (overrideSort as "asc" | "desc")
          : selectedSort === "asc" || selectedSort === "desc"
          ? (selectedSort as "asc" | "desc")
          : undefined,
    });
  };

  const handleSelectSort = (value: string) => {
    setSelectedSort(value);
    setSortOpen(false);
    handleApplyFilters(value);
  };

  const sortOptions = [
    { label: "Price lowest to highest", value: "asc" },
    { label: "Price highest to lowest", value: "desc" },
  ];

  const getSortLabel = () => {
    const option = sortOptions.find((opt) => opt.value === selectedSort);
    return option?.label || "Sort";
  };

  const handleToggle = <T,>(
    value: T,
    selectedValues: T[],
    setSelectedValues: (values: T[]) => void
  ) => {
    setSelectedValues(
      selectedValues.includes(value)
        ? selectedValues.filter((v) => v !== value)
        : [...selectedValues, value]
    );
  };

  const starOptions = [
    { label: "4+ stars", value: 4 },
    { label: "3+ stars", value: 3 },
    { label: "2+ stars", value: 2 },
    { label: "1+ stars", value: 1 },
  ];

  const priceRanges = [
    { label: "Under 500,000 VND", value: "0-500000" },
    { label: "500,000 VND - 1,000,000 VND", value: "500000-1000000" },
    { label: "1,000,000 VND - 2,000,000 VND", value: "1000000-2000000" },
    { label: "2,000,000 VND - 3,000,000 VND", value: "2000000-3000000" },
    { label: "Over 3,000,000 VND", value: "3000000+" },
  ];

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <CombinedFilterPopup
          selectedPriceRanges={selectedPriceRanges}
          onTogglePrice={(value) =>
            handleToggle(value, selectedPriceRanges, setSelectedPriceRanges)
          }
          selectedStars={selectedStars ? [selectedStars] : []}
          onToggleStar={(value) =>
            setSelectedStars(selectedStars === value ? null : value)
          }
          onApplyFilters={handleApplyFilters}
          open={filterOpen}
          onOpenChange={setFilterOpen}
          priceRanges={priceRanges}
          starOptions={starOptions}
        >
          <Button
            variant="outline"
            size="default"
            className="rounded-full px-5 py-2 gap-2
                      border border-border bg-card shadow-sm
                      hover:shadow-md
                      transition-all duration-200
                      text-foreground elegant-subheading
                      flex items-center">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span>Filters</span>
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
              size="default"
              className="rounded-full px-5 py-2 gap-2
                      border border-border bg-card shadow-sm
                      hover:shadow-md
                      transition-all duration-200
                      text-foreground elegant-subheading
                      flex items-center"
            >
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              {getSortLabel()}
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
            </Button>
          </OptionsPopup>
        </div>
      </div>
    </>
  );
}
