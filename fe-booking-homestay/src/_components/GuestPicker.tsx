"use client";

import { useLang } from "@/context/lang-context";
import { Baby, ChevronDown, Minus, Plus, User } from "lucide-react";
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
  compact?: boolean;
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
  compact = false,
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
            `w-full relative border border-border rounded-full hover:border-primary/40 focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 text-left flex items-center justify-between cursor-pointer transition-all duration-300 shadow-2xs bg-card ${compact ? "h-10 px-2.5" : "h-14 px-5 md:h-12 md:px-3 lg:h-14 lg:px-5"}`
          }
        >
          <span
            className={`${!className ? (compact ? "ml-6" : "ml-8 md:ml-6 lg:ml-8") : ""} font-medium elegant-subheading truncate ${compact ? "text-xs md:text-[11px] lg:text-xs" : "text-sm md:text-[11px] lg:text-sm"}`}
          >
            {getGuestDisplayText()}
          </span>
          <ChevronDown
            className={`absolute text-muted-foreground transition-transform duration-300 ${compact ? "right-2.5" : "right-4 md:right-2.5 lg:right-4"} ${
              isOpen ? "rotate-180 text-primary" : ""
            }`}
            size={compact ? 13 : 16}
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-80 p-0 bg-white/95 dark:bg-black/95 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden"
        align="start"
        sideOffset={6}
      >
        <div className="p-6 space-y-6">
          {/* Adults */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-2xl dark:bg-primary/25">
                <User size={18} />
              </div>
              <div>
                <p className="elegant-subheading text-foreground font-semibold text-sm">
                  {t("adults")}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                  &gt;13 {t("year old")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setAdults(Math.max(1, adults - 1))}
                disabled={adults <= 1}
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all duration-200 cursor-pointer"
              >
                <Minus size={14} />
              </button>
              <span className="w-6 text-center font-bold text-foreground text-sm select-none tabular-nums">
                {adults}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (maxAdults !== undefined && adults >= maxAdults) {
                    onLimitReached?.("adults", maxAdults);
                    return;
                  }
                  setAdults(adults + 1);
                }}
                disabled={maxAdults !== undefined && adults >= maxAdults}
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all duration-200 cursor-pointer"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Children */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-2xl dark:bg-primary/25">
                <Baby size={18} />
              </div>
              <div>
                <p className="elegant-subheading text-foreground font-semibold text-sm">
                  {t("children")}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                  2 - 12 {t("year old")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setChildren(Math.max(0, children - 1))}
                disabled={children <= 0}
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all duration-200 cursor-pointer"
              >
                <Minus size={14} />
              </button>
              <span className="w-6 text-center font-bold text-foreground text-sm select-none tabular-nums">
                {children}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (maxChildren !== undefined && children >= maxChildren) {
                    onLimitReached?.("children", maxChildren);
                    return;
                  }
                  setChildren(children + 1);
                }}
                disabled={maxChildren !== undefined && children >= maxChildren}
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all duration-200 cursor-pointer"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          <Button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-full bg-primary hover:bg-primary/90 text-white rounded-full font-bold h-11 text-xs uppercase tracking-wider shadow-sm transition-all duration-300 active:scale-[0.98] cursor-pointer"
          >
            {t("langCode") === "en" ? "Apply" : "Áp dụng"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
