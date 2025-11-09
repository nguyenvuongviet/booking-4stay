"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

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

  const getGuestDisplayText = () => {
    const total = adults + children;
    return `${total} Guests`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className="w-full h-12 px-4 border border-border rounded-3xl focus:border-accent focus:ring-1 focus:ring-accent text-left flex items-center justify-between">
          <div className="flex items-center justify-between">
            <p className="ml-10 text-sm elegant-subheading">{getGuestDisplayText()}</p>
          </div>
          <svg
            className="w-5 h-5 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-[300px] p-0 rounded-2xl" align="start">
        <div className="p-6 space-y-6">
          {/* Adults */}
          <div className="flex items-center justify-between">
            <div>
              <p className="elegant-subheading text-foreground">Adults</p>
              <p className="text-sm text-muted-foreground">{`>`}13 ages</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setAdults(Math.max(1, adults - 1))}
                disabled={adults <= 1}
                className="w-8 h-8 rounded-full border-2 border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span className="text-lg">-</span>
              </button>
              <span className="w-8 text-center elegant-subheading text-foreground">{adults}</span>
              <button
                onClick={() => setAdults(adults + 1)}
                className="w-8 h-8 rounded-full border-2 border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary"
              >
                <span className="text-lg">+</span>
              </button>
            </div>
          </div>

          {/* Children */}
          <div className="flex items-center justify-between">
            <div>
              <p className="elegant-subheading text-foreground">Children</p>
              <p className="text-sm text-muted-foreground">2 – 12 ages</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setChildren(Math.max(0, children - 1))}
                disabled={children <= 0}
                className="w-8 h-8 rounded-full border-2 border-border flex items-center justify-center text-mu hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span className="text-lg">-</span>
              </button>
              <span className="w-8 text-center elegant-subheading text-foreground">{children}</span>
              <button
                onClick={() => setChildren(children + 1)}
                className="w-8 h-8 rounded-full border-2 border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary"
              >
                <span className="text-lg">+</span>
              </button>
            </div>
          </div>

          <Button
            onClick={() => setIsOpen(false)}
            className="w-full bg-white elegant-sans elegant-subheading hover:bg-background text-primary border border-border rounded-xl"
          >
            Close
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
