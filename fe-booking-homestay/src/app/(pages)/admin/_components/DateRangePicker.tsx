"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

export function DateRangePicker({
  value,
  onChange,
}: {
  value: DateRange | undefined;
  onChange: (v: DateRange | undefined) => void;
}) {
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
          className="h-10 min-w-60 justify-start text-left font-normal"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatted}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        side="bottom"
        className="p-0! w-fit rounded-md border shadow-md z-9999"
      >
        <Calendar
          mode="range"
          selected={value}
          onSelect={onChange}
          defaultMonth={value?.from}
          numberOfMonths={2}
          pagedNavigation
          className="rounded-md"
        />
      </PopoverContent>
    </Popover>
  );
}
