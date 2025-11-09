"use client";

import { forwardRef } from "react";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * InputDatepicker — dùng làm custom input cho react-datepicker
 */
export const InputDatepicker = forwardRef<
  HTMLButtonElement,
  React.HTMLProps<HTMLInputElement>
>(({ value, onClick, placeholder, className, ...props }, ref) => {
  return (
    <button
      type="button"
      onClick={onClick}
      ref={ref as any}
      className={cn(
        "flex items-center justify-between w-full rounded-md border border-input bg-input text-sm text-foreground h-9 px-3 py-1 shadow-xs transition focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring outline-none",
        "placeholder:text-muted-foreground",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
    >
      <span className={cn(value ? "text-foreground" : "text-muted-foreground")}>
        {value || placeholder || "Select date"}
      </span>
      <Calendar size={20} className="h-4 w-4 text-muted-foreground ml-2" />
    </button>
  );
});

InputDatepicker.displayName = "InputDatepicker";
