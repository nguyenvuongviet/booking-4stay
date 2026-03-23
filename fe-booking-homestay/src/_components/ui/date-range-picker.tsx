"use client";

import * as React from "react";
import { type DateRange } from "react-day-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/_components/ui/popover";
import { Button } from "@/_components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/_components/ui/calendar";
import { format, addMonths } from "date-fns";
import { useLang } from "@/context/lang-context";

interface DateRangePickerProps {
  id?: number | string;
  value?: DateRange;
  soldOutDates?: Date[];
  onChange?: (range: DateRange | undefined) => void;
  autoClose?: boolean;
}

export default function DateRangePicker({
  id,
  value,
  soldOutDates,
  onChange,
  autoClose = true,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedRange, setSelectedRange] = React.useState<
    DateRange | undefined
  >(value);
  const [currentMonth, setCurrentMonth] = React.useState<Date>(new Date());
  const { t } = useLang();

  const formatLabel = (date?: Date) =>
    date ? format(date, "MMM dd, yyyy") : "";

  const handlePick = React.useCallback(
    (day?: Date, range?: DateRange) => {      
      if(!day) return;
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
        ? { from, to: undefined } : day < from
        ? { from: day, to: from }  : { from, to: day };
        setSelectedRange(newRange);
        onChange?.(newRange);
        
        if (autoClose && newRange.from && newRange.to) 
          setOpen(false);
    },
    [selectedRange, onChange, autoClose]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full h-12 px-4 bg-transparent border border-border rounded-3xl hover:border-ring focus:border-ring focus:ring-2 focus:ring-accent hover:bg-transparent text-left flex items-center justify-between"
        >
          <CalendarIcon
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            size={20}
          />
          <div className="ml-8 elegant-subheading truncate">
            {selectedRange?.from ? (
              formatLabel(selectedRange.from)
            ) : (
              <span className="text-muted">{t("checkIn")}</span>
            )}
            <span className="text-muted"> - </span>{" "}
            {selectedRange?.to ? (
              formatLabel(selectedRange.to)
            ) : (
              <span className="text-muted">{t("checkOut")}</span>
            )}
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-2">
        <div className="flex flex-col sm:flex-row gap-2">
          {[0, 1].map((i) => (
            <Calendar
              key={i}
              mode="range"
              selected={selectedRange}
              onDayClick={(day) => handlePick(day)}
              onSelect={(range) => handlePick(undefined, range)}
              month={i === 0 ? currentMonth : addMonths(currentMonth, 1)}
              onMonthChange={
                (date) =>
                  i === 0
                    ? setCurrentMonth(date) // prev bên trái
                    : setCurrentMonth(addMonths(date, -1)) // next bên phải
              }
              disabled={[...(soldOutDates || []), { before: new Date() }]}
              modifiers={{
                soldOut: (date) =>
                  (soldOutDates || []).some(
                    (d) => d.toDateString() === date.toDateString()
                  ),
              }}
              modifiersClassNames={{
                soldOut: "sold-out-day",
              }}
              showOutsideDays={false}
              className={`
                [&_.rdp-day_selected]:bg-primary 
                [&_.rdp-day_selected:hover]:bg-primary/90
                [&_.rdp-day_range_middle]:bg-primary/20 
                [&_.rdp-day_range_middle:hover]:bg-primary/40
                [&_.rdp-day_start]:rounded-l-full [&_.rdp-day_end]:rounded-r-full
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
