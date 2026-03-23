"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { useLang } from "@/context/lang-context";

interface GuestPickerProps {
  adults: number;
  children: number;
  setAdults: (value: number) => void;
  setChildren: (value: number) => void;
}

export default function GuestPicker({
  adults,
  children,
  setAdults,
  setChildren,
}: GuestPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { lang, t } = useLang();

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
        <button className="w-full h-12 px-4 border border-border rounded-3xl hover:border-ring focus:border-ring focus:ring-2 focus:ring-accent text-left flex items-center justify-between">
          <span className="ml-8 text-sm elegant-subheading">
            {getGuestDisplayText()}
          </span>
          <svg
            className="w-4 h-4 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-[250px] p-0 rounded-2xl" align="start">
        <div className="p-6 space-y-4">
          {/* Adults */}
          <div className="flex items-center justify-between ">
            <div>
              <p className="elegant-subheading text-foreground ">
                {t("adults")}
              </p>
              <p className="text-xs text-muted-foreground">&gt;13 {t("year old")}</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setAdults(Math.max(1, adults - 1))}
                disabled={adults <= 1}
                className="w-6 h-6 rounded-full border-2 border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
              >
                -
              </button>
              <span className="w-8 text-center elegant-subheading text-foreground">
                {adults}
              </span>
              <button
                onClick={() => setAdults(adults + 1)}
                className="w-6 h-6 rounded-full border-2 border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary"
              >
                +
              </button>
            </div>
          </div>

          {/* Children */}
          <div className="flex items-center justify-between">
            <div>
              <p className="elegant-subheading text-foreground">{t("children")}</p>
              <p className="text-xs text-muted-foreground">2 – 12 {t("year old")}</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setChildren(Math.max(0, children - 1))}
                disabled={children <= 0}
                className="w-6 h-6 rounded-full border-2 border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
              >
                -
              </button>
              <span className="w-8 text-center elegant-subheading text-foreground">
                {children}
              </span>
              <button
                onClick={() => setChildren(children + 1)}
                className="w-6 h-6 rounded-full border-2 border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary"
              >
                +
              </button>
            </div>
          </div>

          <Button
            onClick={() => setIsOpen(false)}
            className="w-full bg-white elegant-sans elegant-subheading hover:bg-background text-primary border border-border rounded-xl"
          >
            {t("close")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
