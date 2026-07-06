"use client";

import { Calendar } from "@/_components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/_components/ui/popover";
import { toDateKey } from "@/app/(pages)/admin/_utils/calendar";
import { useLang } from "@/context/lang-context";
import { addMonths, format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import * as React from "react";
import { useEffect } from "react";
import { type DateRange } from "react-day-picker";
import toast from "react-hot-toast";

interface DateRangePickerProps {
  id?: number | string;
  value?: DateRange;
  statusMap?: Map<number, "AVAILABLE" | "BOOKED" | "BLOCKED">;
  defaultPrice?: number;
  getPrice?: (date: Date) => number;
  onChange?: (range: DateRange | undefined) => void;
  onMonthChange?: (date: Date) => void;
  autoClose?: boolean;
  className?: string;
  compact?: boolean;
  variant?: "default" | "transparent";
  minDate?: Date;
  lockedFrom?: Date;
}

export default function DateRangePicker({
  id,
  value,
  statusMap,
  defaultPrice,
  getPrice,
  onChange,
  onMonthChange,
  autoClose = true,
  className,
  compact = false,
  variant = "default",
  minDate,
  lockedFrom,
}: DateRangePickerProps) {
  const isTransparent = variant === "transparent";
  const [open, setOpen] = React.useState(false);
  const [selectedRange, setSelectedRange] = React.useState<
    DateRange | undefined
  >(value);
  const [currentMonth, setCurrentMonth] = React.useState<Date>(new Date());
  const { t } = useLang();

  useEffect(() => {
    setSelectedRange(value);
  }, [value]);

  const formatLabel = (date?: Date) => {
    if (!date) return "";
    return compact ? format(date, "dd/MM") : format(date, "MMM dd, yyyy");
  };

  const isSoldOut = (date: Date) => {
    if (!statusMap) return false;
    const status = statusMap.get(toDateKey(date));
    return status === "BOOKED" || status === "BLOCKED";
  };

  const isRangeValid = (from: Date, to: Date) => {
    let d = new Date(from);

    while (d < to) {
      if (isSoldOut(d)) return false;
      d.setDate(d.getDate() + 1);
    }

    return true;
  };

  const handlePick = React.useCallback(
    (day?: Date, range?: DateRange) => {
      if (!day) return;

      // Nếu check-in bị khóa (khách đã nhận phòng), chỉ cho chọn check-out
      if (lockedFrom) {
        const dayNorm = new Date(day);
        dayNorm.setHours(0, 0, 0, 0);
        const lockedNorm = new Date(lockedFrom);
        lockedNorm.setHours(0, 0, 0, 0);

        // Không cho chọn ngày <= ngày check-in đã khóa
        if (dayNorm.getTime() <= lockedNorm.getTime()) return;

        const newRange: DateRange = { from: lockedFrom, to: day };
        if (!isRangeValid(lockedFrom, day)) {
          toast.error(
            "Khoảng ngày chứa ngày hết phòng. Vui lòng chọn ngày khác.",
          );
          return;
        }
        setSelectedRange(newRange);
        onChange?.(newRange);
        if (autoClose) setOpen(false);
        return;
      }

      const hasCompleteRange = selectedRange?.from && selectedRange?.to;
      if (!selectedRange || hasCompleteRange) {
        const newRange: DateRange = { from: day, to: undefined };
        setSelectedRange(newRange);
        onChange?.(newRange);
        return;
      }

      const from = selectedRange.from!;
      const isSameDay = from.getTime() === day.getTime();
      //click cùng ngày -> reset to
      let newRange: DateRange = isSameDay
        ? { from, to: undefined }
        : day < from
          ? { from: day, to: from }
          : { from, to: day };

      if (newRange.from && newRange.to) {
        if (!isRangeValid(newRange.from, newRange.to)) {
          setSelectedRange({ from: day, to: undefined });
          toast.error("Ngày bạn chọn đã hết phòng. Vui lòng chọn ngày khác.");
          return;
        }
      }
      setSelectedRange(newRange);
      onChange?.(newRange);

      if (autoClose && newRange.from && newRange.to) setOpen(false);
    },
    [selectedRange, onChange, autoClose, statusMap, lockedFrom],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {className ? (
          <button
            type="button"
            className={`${className} w-full text-left bg-transparent border-none outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 p-0 cursor-pointer select-none`}
          >
            <div className="text-foreground elegant-subheading truncate text-xs sm:text-sm md:text-[11px] lg:text-sm">
              {selectedRange?.from ? (
                formatLabel(selectedRange.from)
              ) : (
                <span className="text-white/40">{t("checkIn")}</span>
              )}
              <span className="text-white/40"> - </span>{" "}
              {selectedRange?.to ? (
                formatLabel(selectedRange.to)
              ) : (
                <span className="text-white/40">{t("checkOut")}</span>
              )}
            </div>
          </button>
        ) : (
          <button
            type="button"
            className={`relative w-full rounded-full text-left flex items-center justify-between cursor-pointer transition-all duration-300 ${compact ? "h-10 px-2.5" : "h-14 px-5 md:h-12 md:px-3 lg:h-14 lg:px-5"} ${
              isTransparent
                ? "border border-white/20 bg-transparent hover:bg-white/10 shadow-none focus:outline-hidden"
                : "border border-border shadow-2xs bg-card hover:border-primary/40 focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20"
            }`}
          >
            <CalendarIcon
              className={`absolute top-1/2 transform -translate-y-1/2 shrink-0 drop-shadow-sm z-10 pointer-events-none ${compact ? "left-3" : "left-4 md:left-2.5 lg:left-4"} ${isTransparent ? "text-accent" : "text-primary"}`}
              size={compact ? 15 : 18}
            />
            <div
              className={`ml-8 md:ml-6 lg:ml-8 elegant-subheading truncate ${compact ? "text-xs md:text-[11px] lg:text-xs" : "text-sm md:text-[11px] lg:text-sm"} ${isTransparent ? "text-white" : "text-foreground"}`}
            >
              {selectedRange?.from ? (
                formatLabel(selectedRange.from)
              ) : (
                <span
                  className={isTransparent ? "text-white/50" : "text-muted"}
                >
                  {t("checkIn")}
                </span>
              )}
              <span className={isTransparent ? "text-white/50" : "text-muted"}>
                {" "}
                -{" "}
              </span>{" "}
              {selectedRange?.to ? (
                formatLabel(selectedRange.to)
              ) : (
                <span
                  className={isTransparent ? "text-white/50" : "text-muted"}
                >
                  {t("checkOut")}
                </span>
              )}
            </div>
          </button>
        )}
      </PopoverTrigger>

      <PopoverContent className="w-auto p-2 bg-white/90 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl z-1050">
        <div className="flex flex-col sm:flex-row gap-2">
          {[0, 1].map((i) => (
            <Calendar
              key={i}
              mode="range"
              selected={selectedRange}
              onDayClick={(day) => handlePick(day)}
              onSelect={(range) => handlePick(undefined, range)}
              month={i === 0 ? currentMonth : addMonths(currentMonth, 1)}
              onMonthChange={(date) => {
                if (i === 0) {
                  setCurrentMonth(date);
                  onMonthChange?.(date);
                } else {
                  const prevMonth = addMonths(date, -1);
                  setCurrentMonth(prevMonth);
                  onMonthChange?.(prevMonth);
                }
              }}
              disabled={
                minDate ? [{ before: minDate }] : [{ before: new Date() }]
              }
              modifiers={{
                soldOut: (date) => isSoldOut(date),
              }}
              modifiersClassNames={{
                soldOut: "sold-out-day",
              }}
              getPrice={getPrice}
              defaultPrice={defaultPrice}
              showOutsideDays={false}
              className={`
                [&_.rdp-day_selected]:bg-primary  
                [&_.rdp-day_selected:hover]:bg-primary/90
                [&_.rdp-day_range_middle]:bg-primary/20 
                [&_.rdp-day_range_middle:hover]:bg-primary/40
                [&_.rdp-day_start]:rounded-l-md [&_.rdp-day_end]:rounded-r-md
                [&_.rdp-day_outside]:hidden
                transition-colors duration-200
              `}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
