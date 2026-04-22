// components/calendar/CalendarGrid.tsx
import { useCalendarPricing } from "@/_hooks/useCalendarPricing";
import { getMonthDays, toDateKey } from "@/lib/utils/calendar";
import { useMemo, useState } from "react";
import { useCalendarRoom } from "../../_hooks/useCalendarRoom";
import CalendarCell from "./CalendarCell";
import CalendarHeader from "./CalendarHeader";
import EditPanel from "./EditPanel";

interface CalendarGridProps {
    roomId: number | string,
    defaultPrice: number;
}

export default function CalendarGrid(
    { roomId, defaultPrice }: CalendarGridProps
) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const current = currentDate;

    const months = useMemo(() => {
        const prev = new Date(current);
        prev.setMonth(prev.getMonth() - 1);

        const next = new Date(current);
        next.setMonth(next.getMonth() + 1);

        return [
            { month: prev.getMonth() + 1, year: prev.getFullYear() },
            { month: current.getMonth() + 1, year: current.getFullYear() },
            { month: next.getMonth() + 1, year: next.getFullYear() }
        ];
    }, [current]);

    const {
        loading,
        getPrice,
        statusMap,
        bookingMap,
        updateCalendar
    } = useCalendarPricing({ roomId, defaultPrice, months });

    const {
        selectedDates,
        isEditing,
        handleSelectDate,
        clearSelection
    } = useCalendarRoom();

    const days = useMemo(() => getMonthDays(currentDate.getFullYear(), currentDate.getMonth()), [currentDate]);
    const firstDate = selectedDates[0];
    const firstKey = toDateKey(firstDate);

    return (
        <div className="flex flex-row w-full items-start">
            <div className={`transition-all duration-300 flex-1  min-w-0 ${selectedDates.length > 0 ? "w-[calc(100%-380px)]" : "w-full "}`}>
                <div className="p-3 sm:p-4 sm:px-6 bg-card rounded-xl">
                    <CalendarHeader
                        currentDate={currentDate}
                        setCurrentDate={setCurrentDate}
                    />

                    <p className="text-sm text-muted-foreground mb-4">
                        Nhấn giữ Ctrl để chọn nhiều ngày, Shift để chọn khoảng ngày
                    </p>

                    {/* Week */}
                    <div className="grid grid-cols-7 mb-2 text-center elegant-sans text-primary text-[10px] sm:text-xs md:text-sm">
                        {["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"].map((d) => (
                            <div key={d}>{d}</div>
                        ))}
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-7 border border-primary">
                        {days.map((day, i) => (
                            <CalendarCell
                                key={i}
                                day={day}
                                getPrice={getPrice}
                                defaultPrice={defaultPrice}
                                status={statusMap.get(toDateKey(day.date)) ?? "AVAILABLE"}
                                bookingDetail={bookingMap.get(toDateKey(day.date)) ?? null}
                                isSelected={selectedDates.some(
                                    (d) => toDateKey(d) === toDateKey(day.date)
                                )}
                                onClick={(date, e) => handleSelectDate(date, e)}
                            />
                        ))}
                    </div>


                </div>
            </div>
            {/* Edit */}
            {isEditing && selectedDates.length > 0 && (
                <div className="shrink-0 bg-card sticky top-0 h-screen overflow-y-auto">
                    <EditPanel
                        dates={selectedDates}
                        currentPrice={getPrice(selectedDates[0])}
                        defaultPrice={defaultPrice}
                        isSoldOut={statusMap.get(firstKey) === "BOOKED" || statusMap.get(firstKey) === "BLOCKED"}
                        booking={bookingMap.get(firstKey)}
                        onSave={(price, soldOut) => {
                            updateCalendar(selectedDates, price, soldOut);
                            clearSelection();
                        }}
                        onClose={clearSelection}
                    />
                </div>
            )}
        </div>
    );
}