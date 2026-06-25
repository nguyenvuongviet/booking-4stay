import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toDateKey } from "../_utils/calendar";

function toISODateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

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

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Date | null>(null);

  const [soldOutSet, setSoldOutSet] = useState(
    new Set(soldOutDates.map(toDateKey)),
  );

  // Dùng ref để tránh việc useEffect ghi đè dữ liệu đang edit local
  const initialSyncDone = useRef(false);

  useEffect(() => {
    setSoldOutSet(new Set(soldOutDates.map(toDateKey)));
  }, [JSON.stringify(soldOutDates.map(toDateKey))]);

  useEffect(() => {
    // Chỉ đồng bộ nếu prop thực sự thay đổi từ phía server
    // Ở đây ta dùng JSON.stringify để so sánh giá trị
    setRoomPrices(roomPriceDates);
  }, [JSON.stringify(roomPriceDates)]);

  const priceMap = useMemo(() => {
    const map = new Map<number, number>();

    roomPrices.forEach(({ date, price }) => {
      // date có thể là ISO string từ server hoặc local
      const d = new Date(date.includes("T") ? date : date + "T00:00:00");
      if (!isNaN(d.getTime())) {
        map.set(toDateKey(d), price);
      }
    });

    return map;
  }, [roomPrices]);

  const getPrice = useCallback(
    (date: Date) => priceMap.get(toDateKey(date)) ?? defaultPrice,
    [priceMap, defaultPrice],
  );

  const isSoldOut = useCallback(
    (date: Date) => soldOutSet.has(toDateKey(date)),
    [soldOutSet],
  );

  // DRAG LOGIC
  const onMouseDown = (date: Date, e: React.MouseEvent) => {
    const isCtrl = e.ctrlKey || e.metaKey;

    if (isCtrl) {
      setSelectedDates((prev) => {
        const exists = prev.some((d) => toDateKey(d) === toDateKey(date));

        if (exists) {
          return prev.filter((d) => toDateKey(d) !== toDateKey(date));
        }

        return [...prev, date];
      });

      setLastSelectedDate(date);
      setIsEditing(true);
      return;
    }

    // Không giữ Ctrl -> Bắt đầu kéo
    setIsDragging(true);
    setDragStart(date);
    setSelectedDates([date]);
    setLastSelectedDate(date);
    setIsEditing(false);
  };

  const onMouseEnter = (date: Date) => {
    if (!isDragging || !dragStart) return;

    const start = new Date(Math.min(dragStart.getTime(), date.getTime()));
    const end = new Date(Math.max(dragStart.getTime(), date.getTime()));
    const range: Date[] = [];
    const curr = new Date(start);
    while (curr <= end) {
      range.push(new Date(curr));
      curr.setDate(curr.getDate() + 1);
    }
    setSelectedDates(range);
  };

  const onMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      setDragStart(null);
      if (selectedDates.length > 0) {
        setIsEditing(true);
      }
    }
  };

  const save = useCallback(
    (date: Date, price: number, soldOut: boolean) => {
      const dateStr = toISODateString(date);
      const key = toDateKey(date);

      setRoomPrices((prev) => {
        // Lọc bỏ ngày cũ nếu có
        const filtered = prev.filter((p) => p.date !== dateStr);

        // Nếu giá khác mặc định thì thêm mới, nếu bằng mặc định thì thôi (đã lọc rồi)
        if (price !== defaultPrice) {
          return [...filtered, { date: dateStr, price }];
        }
        return filtered;
      });

      // sold out
      setSoldOutSet((prev) => {
        const next = new Set(prev);
        if (soldOut) next.add(key);
        else next.delete(key);
        return next;
      });
    },
    [defaultPrice],
  );

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
    clearSelection,
    // Drag handlers
    onMouseDown,
    onMouseEnter,
    onMouseUp,
    isDragging,
  };
}
