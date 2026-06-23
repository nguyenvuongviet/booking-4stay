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
  icon?: React.ReactNode;
  label?: string;
  variant?: "default" | "transparent";
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
  icon,
  label,
  variant = "default",
}: GuestPickerProps) {
  const isTransparent = variant === "transparent";
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
            className
              ? `${className} relative flex items-center gap-3 w-full`
              : `w-full relative rounded-full text-left flex items-center justify-between cursor-pointer transition-all duration-300 ${compact ? "h-10 px-2.5" : "h-14 px-5 md:h-12 md:px-3 lg:h-14 lg:px-5"} ${
                  isTransparent
                    ? "border border-white/20 bg-transparent hover:bg-white/10 focus:outline-hidden"
                    : "border border-border hover:border-primary/40 focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-2xs bg-card"
                }`
          }
        >
          {icon}
          <div
            className={
              icon ? "text-left w-full flex-1" : "truncate w-full flex-1"
            }
          >
            {label && (
              <p className="text-[8px] sm:text-[10px] uppercase tracking-widest text-white/70 font-bold drop-shadow-sm mb-0.5">
                {label}
              </p>
            )}
            <span
              className={`${!className ? (compact ? "ml-6" : "ml-8 md:ml-6 lg:ml-8") : ""} font-medium elegant-subheading truncate ${compact ? "text-xs md:text-[11px] lg:text-xs" : "text-xs sm:text-sm md:text-[11px] lg:text-sm"} ${
                !className
                  ? isTransparent
                    ? adults === 1 && children === 0
                      ? "text-white/50"
                      : "text-white"
                    : adults === 1 && children === 0
                      ? "text-muted"
                      : "text-foreground"
                  : ""
              }`}
            >
              {getGuestDisplayText()}
            </span>
          </div>
          <ChevronDown
            className={`absolute right-4 md:right-2.5 lg:right-4 top-1/2 -translate-y-1/2 transition-transform duration-300 ${
              isOpen
                ? "rotate-180 text-primary"
                : isTransparent && !className
                  ? "text-white/50"
                  : "text-muted-foreground"
            }`}
            size={compact ? 13 : 16}
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-72 sm:w-80 p-0 bg-white/95 dark:bg-black/95 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden z-1050"
        align="start"
        sideOffset={6}
      >
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Adults */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-primary/10 text-primary rounded-xl sm:rounded-2xl dark:bg-primary/25">
                <User className="w-4.5 h-4.5 sm:w-4.5 sm:h-4.5" />
              </div>
              <div>
                <p className="elegant-subheading text-foreground font-semibold text-xs sm:text-sm">
                  {t("adults")}
                </p>
                <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                  &gt;13 {t("year old")}
                </p>
                {maxAdults !== undefined && (
                  <p className="text-[8px] sm:text-[9px] text-primary/70 uppercase tracking-wider font-bold mt-0.5">
                    {t("langCode") === "en"
                      ? `Max: ${maxAdults}`
                      : `Tối đa: ${maxAdults}`}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={() => setAdults(Math.max(1, adults - 1))}
                disabled={adults <= 1}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-border flex items-center justify-center text-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all duration-200 cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <span className="w-5 text-center font-bold text-foreground text-xs sm:text-sm select-none tabular-nums">
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
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-border flex items-center justify-center text-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all duration-200 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>

          {/* Children */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-primary/10 text-primary rounded-xl sm:rounded-2xl dark:bg-primary/25">
                <Baby className="w-4.5 h-4.5 sm:w-4.5 sm:h-4.5" />
              </div>
              <div>
                <p className="elegant-subheading text-foreground font-semibold text-xs sm:text-sm">
                  {t("children")}
                </p>
                <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                  2 - 12 {t("year old")}
                </p>
                {maxChildren !== undefined && (
                  <p className="text-[8px] sm:text-[9px] text-primary/70 uppercase tracking-wider font-bold mt-0.5">
                    {t("langCode") === "en"
                      ? `Max: ${maxChildren}`
                      : `Tối đa: ${maxChildren}`}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={() => setChildren(Math.max(0, children - 1))}
                disabled={children <= 0}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-border flex items-center justify-center text-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all duration-200 cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <span className="w-5 text-center font-bold text-foreground text-xs sm:text-sm select-none tabular-nums">
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
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-border flex items-center justify-center text-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all duration-200 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>

          <Button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-full bg-primary hover:bg-primary/90 text-white rounded-full font-bold h-9 sm:h-11 text-[11px] sm:text-xs uppercase tracking-wider shadow-sm transition-all duration-300 active:scale-[0.98] cursor-pointer"
          >
            {t("langCode") === "en" ? "Apply" : "Áp dụng"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
