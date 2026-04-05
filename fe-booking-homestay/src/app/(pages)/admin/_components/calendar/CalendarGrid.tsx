// components/calendar/CalendarGrid.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useCalendarPricing } from "../../_hooks/useCalendarPricing";
import { getMonthDays, toDateKey } from "../../_utils/calendar";
import CalendarCell from "./CalendarCell";
import CalendarHeader from "./CalendarHeader";
import EditPanel from "./EditPanel";
import { Booking } from "@/types/booking";

interface CalendarGridProps {
    soldOutDates?: Date[];
    defaultPrice: number;
    roomPriceDates?: { date: string; price: number }[];
    bookings?: Booking[]; // Thêm prop bookings nếu cần
}

export default function CalendarGrid(
    { soldOutDates, defaultPrice, roomPriceDates, bookings }: CalendarGridProps
) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const { getPrice, isSoldOut, save, isEditing, selectedDates, handleSelectDate, clearSelection } = useCalendarPricing({
        defaultPrice,
        roomPriceDates,
        soldOutDates,
    });

    const days = useMemo(() => getMonthDays(currentDate.getFullYear(), currentDate.getMonth()), [currentDate]);

    const bookingMap = useMemo(() => {
        const map = new Map<number, Booking>();

        if (!bookings) return map;

        bookings.forEach((b) => {
            const start = new Date(b.checkIn);
            const end = new Date(b.checkOut);
            const current = new Date(start);

            while (current < end) {
                map.set(toDateKey(current), b);
                current.setDate(current.getDate() + 1);
            }
        });

        return map;
    }, [bookings]);

    return (
        <div className="flex flex-row w-full items-start">
            <div className={`transition-all duration-300 flex-1  min-w-0 ${selectedDates.length > 0 ? "w-[calc(100%-380px)]" : "w-full "}`}>
                <div className="p-4 px-6 bg-card rounded-xl">
                    <CalendarHeader
                        currentDate={currentDate}
                        setCurrentDate={setCurrentDate}
                    />

                    <p className="text-sm text-muted-foreground mb-4">
                        Nhấn giữ Ctrl để chọn nhiều ngày, Shift để chọn khoảng ngày
                    </p>

                    {/* Week */}
                    <div className="grid grid-cols-7 mb-2 text-center elegant-sans text-primary">
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
                                isSoldOut={isSoldOut}
                                booking={bookingMap.get(toDateKey(day.date))}
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
                        isSoldOut={isSoldOut(selectedDates[0])}
                        booking={bookingMap.get(toDateKey(selectedDates[0]))}
                        onSave={(price, soldOut) => {
                            selectedDates.forEach((d) => save(d, price, soldOut));
                            clearSelection();
                        }}
                        onClose={clearSelection}
                    />
                </div>
            )}
        </div>
    );
}