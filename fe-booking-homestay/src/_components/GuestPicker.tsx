"use client";

import { useLang } from "@/context/lang-context";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface GuestPickerProps {
  adults: number;
  children: number;
  setAdults: (value: number) => void;
  setChildren: (value: number) => void;
  maxAdults?: number;
  maxChildren?: number;
  onLimitReached?: (type: "adults" | "children", limit: number) => void;
  className?: string;
}

export default function GuestPicker({
  adults,
  children,
  setAdults,
  setChildren,
  maxAdults,
  maxChildren,
  onLimitReached,
  className,
}: GuestPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLang();

  const getGuestDisplayText = () => {
    const total = adults + children;
    if (t("langCode") === "en") {
      return `${total} Guest${total > 1 ? "s" : ""}`;
    }
    return `${total} Khách`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className={
            className ||
            "w-full h-12 px-4 border border-border rounded-3xl hover:border-ring focus:border-ring focus:ring-2 focus:ring-accent text-left flex items-center justify-between"
          }
        >
          <span
            className={`${!className ? "ml-8" : ""} text-sm elegant-subheading`}
          >
            {getGuestDisplayText()}
          </span>
          <ChevronDown
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary"
            size={18}
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-62.5 p-0 bg-white/90 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl"
        align="start"
      >
        <div className="p-6 space-y-4">
          {/* Adults */}
          <div className="flex items-center justify-between ">
            <div>
              <p className="elegant-subheading text-foreground font-semibold">
                {t("adults")}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                &gt;13 {t("year old")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAdults(Math.max(1, adults - 1))}
                disabled={adults <= 1}
                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-foreground hover:bg-gray-100 disabled:opacity-30 transition-colors"
              >
                -
              </button>
              <span className="w-6 text-center font-bold text-foreground">
                {adults}
              </span>
              <button
                onClick={() => {
                  if (maxAdults !== undefined && adults >= maxAdults) {
                    onLimitReached?.("adults", maxAdults);
                    return;
                  }
                  setAdults(adults + 1);
                }}
                disabled={maxAdults !== undefined && adults >= maxAdults}
                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-foreground hover:bg-gray-100 disabled:opacity-30 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Children */}
          <div className="flex items-center justify-between">
            <div>
              <p className="elegant-subheading text-foreground font-semibold">
                {t("children")}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                2 – 12 {t("year old")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setChildren(Math.max(0, children - 1))}
                disabled={children <= 0}
                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-foreground hover:bg-gray-100 disabled:opacity-30 transition-colors"
              >
                -
              </button>
              <span className="w-6 text-center font-bold text-foreground">
                {children}
              </span>
              <button
                onClick={() => {
                  if (maxChildren !== undefined && children >= maxChildren) {
                    onLimitReached?.("children", maxChildren);
                    return;
                  }
                  setChildren(children + 1);
                }}
                disabled={maxChildren !== undefined && children >= maxChildren}
                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-foreground hover:bg-gray-100 disabled:opacity-30 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          <Button
            onClick={() => setIsOpen(false)}
            className="w-full bg-primary text-white hover:bg-primary/90 rounded-2xl font-bold py-6"
          >
            Áp dụng
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
