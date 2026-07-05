import { Button } from "@/_components/ui/button";
import { CircleChevronLeft, CircleChevronRight } from "lucide-react";

// components/calendar/CalendarHeader.tsx
type Props = {
  currentDate: Date;
  setCurrentDate: (d: Date) => void;
};

export default function CalendarHeader({ currentDate, setCurrentDate }: Props) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  return (
    <div className="flex justify-between items-center mb-3 sm:mb-4">
      <h2 className="text-sm sm:text-lg font-bold text-slate-800 dark:text-slate-200">
        Tháng {month + 1} năm {year}
      </h2>

      <div className="flex items-center gap-1 sm:gap-2">
        <button
          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
          onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
        >
          <CircleChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600 dark:text-slate-400" />
        </button>

        <button
          onClick={() => setCurrentDate(new Date())}
          className="px-2.5 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-semibold bg-primary/10 text-primary rounded-lg hover:bg-primary/20 cursor-pointer transition-colors"
        >
          Hôm nay
        </button>

        <button
          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
          onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
        >
          <CircleChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600 dark:text-slate-400" />
        </button>
      </div>
    </div>
  );
}
