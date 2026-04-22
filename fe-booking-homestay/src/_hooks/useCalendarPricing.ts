import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { roomCalendar, updateRoomCalendar } from "@/services/admin/roomsApi";
import { Booking } from "@/types/booking";
import { toDateKey } from "@/lib/utils/calendar";
import { formatDateAPI } from "@/lib/utils/date";

type CalendarItem = {
    date: string;
    price: number;
    status: "AVAILABLE" | "BOOKED" | "BLOCKED";
    bookingDetails: { guestName: string } | null;
};

export function useCalendarPricing({
    roomId,
    defaultPrice,
    months
}: {
    roomId: number | string;
    defaultPrice: number;
    months: { month: number; year: number }[];
}) {
    const [data, setData] = useState<CalendarItem[]>([]);
    const [loading, setLoading] = useState(false);
    const cache = useRef<Map<string, CalendarItem[]>>(new Map());

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            // chỉ fetch những tháng chưa có
            const needFetch = months.filter(({ month, year }) => {
                const key = `${roomId}-${month}-${year}`;
                return !cache.current.has(key);
            });

            // nếu tất cả đã cache → không fetch
            if (needFetch.length === 0) {
                const cached = months.flatMap(({ month, year }) => {
                    return cache.current.get(`${roomId}-${month}-${year}`) || [];
                });

                setData(cached);
                return;
            }

            setLoading(true);

            try {
                const results = await Promise.all(
                    needFetch.map(async ({ month, year }) => {
                        const key = `${roomId}-${month}-${year}`;
                        const res = await roomCalendar(roomId, month, year);

                        cache.current.set(key, res.calendar);
                        return res.calendar;
                    })
                );

                // merge tất cả data từ cache
                const merged = months.flatMap(({ month, year }) => {
                    return cache.current.get(`${roomId}-${month}-${year}`) || [];
                });

                if (isMounted) setData(merged);

            } catch (err) {
                console.error("Fetch calendar error:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [roomId, months]);

    const priceMap = useMemo(() => {
        const map = new Map<number, number>();

        data.forEach(({ date, price }) => {
            map.set(toDateKey(new Date(date)), price);
        });

        return map;
    }, [data]);

    const getPrice = useCallback(
        (date: Date) =>
            priceMap.get(toDateKey(date)) ?? defaultPrice,
        [priceMap, defaultPrice]
    );

    const statusMap = useMemo(() => {
        const map = new Map<number, CalendarItem["status"]>();

        data.forEach((d) => {
            map.set(
                toDateKey(new Date(d.date + "T00:00:00")),
                d.status
            );
        });

        return map;
    }, [data]);

    const bookingMap = useMemo(() => {
        const map = new Map<number,{ guestName: string}>();

        data.forEach((d) => {
            if (d.bookingDetails) {
                map.set(
                    toDateKey(new Date(d.date + "T00:00:00")),
                    d.bookingDetails
                );
            }
        });

        return map;
    }, [data]);

    const updateCalendar = async (
        dates: Date[],
        price: number,
        soldOut: boolean
    ) => {
        const payload = dates.map((d) => ({
            date: formatDateAPI(d),
            price,
            isAvailable: !soldOut,
        }));

        const prev = [...data];

        setData((curr) => 
            curr.map((item) => {
                const found = payload.find(
                    (p) => toDateKey(new Date(p.date)) === toDateKey(new Date(item.date))
                );

                if (!found) return item;

                const newStatus: CalendarItem["status"] =
                    found.isAvailable ? "AVAILABLE" : "BLOCKED";

                return {
                    ...item,
                    price: found.price,
                    status: newStatus,
                };
            })
        );

        payload.forEach((p) => {
            const d = new Date(p.date);
            const key = `${roomId}-${d.getMonth() + 1}-${d.getFullYear()}`;

            const monthData = cache.current.get(key);
            if (!monthData) return;

            const updatedMonth = monthData.map((item) => {
                if (toDateKey(new Date(item.date)) !== toDateKey(d))
                    return item;

                const newStatus: CalendarItem["status"] =
                    p.isAvailable ? "AVAILABLE" : "BLOCKED";

                return {
                    ...item,
                    price: p.price,
                    status: newStatus,
                };
            });

            cache.current.set(key, updatedMonth);
        });

        try {
            await updateRoomCalendar(roomId, payload);
        } catch (err) {
            console.error("rollback", err);
            setData(prev);
        }
    };

    return {
        loading,
        getPrice,
        statusMap,
        bookingMap,
        updateCalendar
    };
} 