import { useState } from "react";

export function useCalendarRoom(){
    const [selectedDates, setSelectedDates] = useState<Date[]>([]);
    const [lastSelectedDate, setLastSelectedDate] = useState<Date | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    const getDateRange = (start: Date, end: Date) => {
        const result: Date[] = [];
        const current = new Date(start);

        while (current <= end) {
            result.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }

        return result;
    };

    const handleSelectDate = (
        date: Date,
        e: React.MouseEvent
    ) => {
        const isCtrl = e.ctrlKey || e.metaKey;
        const isShift = e.shiftKey;

        if (isCtrl || isShift) {
            setTimeout(() => {
                if (selectedDates.length > 0) {
                    setIsEditing(true);
                }
            }, 100);
        }

        // nhấn Shift
        if (isShift && lastSelectedDate) {
            const range = getDateRange(
                lastSelectedDate < date ? lastSelectedDate : date,
                lastSelectedDate > date ? lastSelectedDate : date
            );

            setSelectedDates(range);
            setIsEditing(true);
            return;
        }

        // nhấn Ctrl
        if (isCtrl) {
            setSelectedDates((prev) => {
                const exists = prev.some(
                    (d) => d.toDateString() === date.toDateString()
                );

                if (exists) {
                    return prev.filter(
                        (d) => d.toDateString() !== date.toDateString()
                    );
                }

                return [...prev, date];
            });

            setIsEditing(true);
            setLastSelectedDate(date);
            return;
        }

        // chọn 1 ngày
        setSelectedDates([date]);
        setLastSelectedDate(date);
        setIsEditing(true);
    };


    const clearSelection = () => {
        setSelectedDates([]);
        setLastSelectedDate(null);
        setIsEditing(false);
    };

    return {
        isEditing,
        selectedDates,
        handleSelectDate,
        clearSelection,
    };
}