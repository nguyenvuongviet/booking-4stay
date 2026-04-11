import { formatDate } from "@/lib/utils/date";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toDateKey } from "../_utils/calendar";
import { room_preview } from "@/services/roomApi";

export function useCalendarPricing({
    defaultPrice,
    roomPriceDates = [],
    soldOutDates = [],
}: {
    defaultPrice: number;
    roomPriceDates?: { date: string; price: number }[];
    soldOutDates?: Date[];
}) {
    const [roomPrices, setRoomPrices] = useState(roomPriceDates);
    const [selectedDates, setSelectedDates] = useState<Date[]>([]);
    const [lastSelectedDate, setLastSelectedDate] = useState<Date | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    const [soldOutSet, setSoldOutSet] = useState(
        new Set(soldOutDates.map(toDateKey))
    );

    const priceMap = useMemo(() => {
        const map = new Map<number, number>();

        roomPrices.forEach(({ date, price }) => {
            map.set(toDateKey(new Date(date)), price);
        });

        return map;
    }, [roomPrices]);

    const getPrice = useCallback(
        (date: Date) =>
            priceMap.get(toDateKey(date)) ?? defaultPrice,
        [priceMap, defaultPrice]
    );

    const isSoldOut = useCallback(
        (date: Date) => soldOutSet.has(toDateKey(date)),
        [soldOutSet]
    );

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

            setLastSelectedDate(date);
            return;
        }

        // chọn 1 ngày
        setSelectedDates([date]);
        setLastSelectedDate(date);
        setIsEditing(true);
    };

    const save = useCallback(
        (date: Date, price: number, soldOut: boolean) => {
            const dateStr = formatDate(date);
            const key = toDateKey(date);

            // price
            setRoomPrices((prev) => {
                const filtered = prev.filter((p) => p.date !== dateStr);

                return price !== defaultPrice
                    ? [...filtered, { date: dateStr, price }]
                    : filtered;
            });

            // sold out
            setSoldOutSet((prev) => {
                const next = new Set(prev);

                if (soldOut) next.add(key);
                else next.delete(key);

                return next;
            });
            console.log("save", date, price, soldOut)
        },

        [defaultPrice]
    );

    useEffect(() => {
        const handleKeyUp = (e: KeyboardEvent) => {
            const isCtrl = e.key === "Control";
            const isShift = e.key === "Shift";

            if ((isCtrl || isShift) && selectedDates.length > 0) {
                setIsEditing(true);
            }
        };

        window.addEventListener("keyup", handleKeyUp);

        return () => {
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, [selectedDates]);

    const clearSelection = () => {
        setSelectedDates([]);
        setLastSelectedDate(null);
        setIsEditing(false);
    };

    return {
        getPrice,
        isSoldOut,
        save,
        isEditing,
        selectedDates,
        handleSelectDate,
        clearSelection
    };
}