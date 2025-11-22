"use client";

import * as React from "react";
import { type DateRange } from "react-day-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format, addMonths } from "date-fns";

interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
}

export default function DateRangePicker({
  value,
  onChange,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedRange, setSelectedRange] = React.useState<
    DateRange | undefined
  >(value);

  const handleSelect = (range: DateRange | undefined) => {
    setSelectedRange(range);
    onChange?.(range);
  };

  const formatLabel = (date?: Date) =>
    date ? format(date, "MMM dd, yyyy") : "";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full h-12 px-4 bg-transparent border border-border rounded-3xl hover:border-ring hover:bg-transparent text-left flex items-center justify-between"
        >
          <CalendarIcon
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            size={20}
          />
          <div className="ml-6 elegant-subheading truncate">{selectedRange?.from
            ? formatLabel(selectedRange.from)
            : <span className="text-muted">Check-in</span>}<span className="text-muted"> - </span>{" "} 
          {selectedRange?.to ? formatLabel(selectedRange.to) : <span className="text-muted">Check-out</span>}</div>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {[0, 1].map((i) => (
            <Calendar
              key={i}
              mode="range"
              selected={selectedRange}
              onSelect={handleSelect}
              month={
                selectedRange?.from
                  ? addMonths(selectedRange.from, i)
                  : addMonths(new Date(), i)
              }
              disabled={{ before: new Date() }}
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
