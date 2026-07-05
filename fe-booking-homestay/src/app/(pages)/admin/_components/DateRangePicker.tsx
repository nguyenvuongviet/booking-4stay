"use client";

import { Button } from "@/_components/ui/button";
import { Calendar } from "@/_components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/_components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { useEffect, useState } from "react";

export function DateRangePicker({
  value,
  onChange,
}: {
  value: DateRange | undefined;
  onChange: (v: DateRange | undefined) => void;
}) {
  const [monthsCount, setMonthsCount] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      setMonthsCount(window.innerWidth >= 640 ? 2 : 1);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const formatted =
    value?.from && value?.to
      ? `${format(value.from, "dd/MM/yyyy")} → ${format(
          value.to,
          "dd/MM/yyyy"
        )}`
      : "Chọn ngày…";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-10 w-full sm:min-w-60 justify-start text-left font-normal"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatted}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="center"
        side="bottom"
        className="p-0! w-auto max-w-[95vw] rounded-md border shadow-md z-9999 overflow-x-auto"
      >
        <Calendar
          mode="range"
          selected={value}
          onSelect={onChange}
          defaultMonth={value?.from}
          numberOfMonths={monthsCount}
          pagedNavigation
          className="rounded-md"
        />
      </PopoverContent>
    </Popover>
  );
}
