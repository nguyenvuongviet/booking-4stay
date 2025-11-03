"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ArrowUpDown, Check, ChevronDown } from "lucide-react";
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

        <div className="bg-white rounded-xl pl-2">
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
                <span className="text-base font-normal text-gray-900">
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
  onSort,
}: {
  onSort: (order: "asc" | "desc") => void;
}) {
  const [starOpen, setStarOpen] = useState(false);
  const [selectedStars, setSelectedStars] = useState<number[]>([]);
  const [priceOpen, setPriceOpen] = useState(false);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [sortOpen, setSortOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState<string>("");

  const handleSelectSort = (value: string) => {
    setSelectedSort(value);
    if (value === "asc" || value === "desc") {
      onSort(value);
    }
    setSortOpen(false);
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
    { label: "5 stars", value: 5 },
    { label: "4 stars", value: 4 },
    { label: "3 stars", value: 3 },
    { label: "2 stars", value: 2 },
    { label: "1 stars", value: 1 },
  ];

  const priceRanges = [
    { label: "Under 500,000 VND", value: "0-500000" },
    { label: "500,000 VND - 1,000,000 VND", value: "500000-1000000" },
    { label: "1,000,000 VND - 2,000,000 VND", value: "1000000-2000000" },
    { label: "2,000,000 VND - 3,000,000 VND", value: "2000000-3000000" },
    { label: "Over 3,000,000VND", value: "3000000+" },
  ];

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        {/* <Button
          variant="outline"
          size="default"
          className="rounded-2xl elegant-subheading gap-2 bg-transparent hover:bg-secondary/50 hover:cursor-pointer"
        >
          <Filter className="h-4 w-4" />
          All filters
        </Button> */}

        <CheckboxPopup
          title="Price"
          options={priceRanges}
          selectedValues={selectedPriceRanges}
          onToggle={(value) =>
            handleToggle(
              value as string,
              selectedPriceRanges,
              setSelectedPriceRanges
            )
          }
          onSeeResult={() =>
            console.log("[v0] Selected price ranges:", selectedPriceRanges)
          }
          open={priceOpen}
          onOpenChange={setPriceOpen}
        >
          <Button
            variant="outline"
            size="default"
            className="w-24 rounded-2xl elegant-subheading gap-3 bg-transparent hover:bg-secondary/50 hover:cursor-pointer"
          >
            Price
            <ChevronDown className="h-4 w-4" />
          </Button>
        </CheckboxPopup>

        <CheckboxPopup
          title="Star"
          options={starOptions}
          selectedValues={selectedStars}
          onToggle={(value) =>
            handleToggle(value as number, selectedStars, setSelectedStars)
          }
          onSeeResult={() => console.log("[v0] Selected stars:", selectedStars)}
          open={starOpen}
          onOpenChange={setStarOpen}
        >
          <Button
            variant="outline"
            size="default"
            className="w-24 rounded-2xl elegant-subheading gap-3 bg-transparent hover:bg-secondary/50 hover:cursor-pointer"
          >
            Star
            <ChevronDown className="h-4 w-4" />
          </Button>
        </CheckboxPopup>

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
              className="rounded-2xl elegant-subheading gap-3 bg-transparent hover:bg-secondary/50 hover:cursor-pointer"
            >
              <ArrowUpDown className="h-4 w-4" />
              {getSortLabel()}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </OptionsPopup>
        </div>
      </div>
    </>
  );
}
