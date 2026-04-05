import { CircleChevronLeft, CircleChevronRight } from "lucide-react";

// components/calendar/CalendarHeader.tsx
type Props = {
  currentDate: Date;
  setCurrentDate: (d: Date) => void;
};

export default function CalendarHeader({
  currentDate,
  setCurrentDate,
}: Props) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-semibold">
        Tháng {month + 1} năm {year}
      </h2>

      <div className="flex gap-2">
        <button 
            className="hover:color-accent cursor-pointer"
            onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>
            <CircleChevronLeft /> 
        </button>

        <button onClick={() => setCurrentDate(new Date())}>
          Hôm nay
        </button>

        <button 
            className="hover:color-accent cursor-pointer"
            onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>
          <CircleChevronRight />
        </button>
      </div>
    </div>
  );
}