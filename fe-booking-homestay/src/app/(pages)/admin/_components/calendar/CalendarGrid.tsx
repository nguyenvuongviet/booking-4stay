import { useToast } from "@/_components/ui/use-toast";
import { cn } from "@/lib/utils";
import {
  CalendarUpdateItem,
  getRoomCalendar,
  updateRoomCalendar,
} from "@/services/admin/roomsApi";
import { Booking } from "@/types/booking";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useCalendarPricing } from "../../_hooks/useCalendarPricing";
import { getMonthDays, toDateKey } from "../../_utils/calendar";
import CalendarCell from "./CalendarCell";
import CalendarHeader from "./CalendarHeader";
import EditPanel from "./EditPanel";

interface CalendarGridProps {
  roomId?: number;
  soldOutDates?: Date[];
  defaultPrice: number;
  roomPriceDates?: { date: string; price: number }[];
  bookings?: Booking[];
  mode?: "pricing" | "selection";
  onSelectionChange?: (dates: Date[]) => void;
}

function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function CalendarGrid({
  roomId,
  soldOutDates,
  defaultPrice,
  roomPriceDates,
  bookings,
  mode = "pricing",
  onSelectionChange,
}: CalendarGridProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredBookingId, setHoveredBookingId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [internalPriceDates, setInternalPriceDates] = useState<
    { date: string; price: number }[]
  >(roomPriceDates || []);
  const [internalSoldOutDates, setInternalSoldOutDates] = useState<Date[]>(
    soldOutDates || [],
  );
  const { toast } = useToast();

  useEffect(() => {
    if (!roomId) return;

    const fetchCalendar = async () => {
      try {
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();
        const data = await getRoomCalendar(roomId, month, year);

        const prices = data.calendar
          .filter((day) => day.price !== Number(defaultPrice))
          .map((day) => ({ date: day.date, price: day.price }));
        setInternalPriceDates(prices);

        const unavailable = data.calendar
          .filter((day) => day.status !== "AVAILABLE")
          .map((day) => {
            const [y, m, d] = day.date.split("-").map(Number);
            return new Date(y, m - 1, d);
          });
        setInternalSoldOutDates(unavailable);
      } catch (error) {
        console.error("Failed to fetch calendar data:", error);
      }
    };

    fetchCalendar();
  }, [roomId, currentDate.getMonth(), currentDate.getFullYear(), defaultPrice]);

  useEffect(() => {
    if (roomPriceDates) setInternalPriceDates(roomPriceDates);
  }, [JSON.stringify(roomPriceDates)]);

  useEffect(() => {
    if (soldOutDates) setInternalSoldOutDates(soldOutDates);
  }, [JSON.stringify(soldOutDates)]);

  const {
    getPrice,
    isSoldOut,
    save,
    isEditing,
    selectedDates,
    clearSelection,
    onMouseDown,
    onMouseEnter,
    onMouseUp,
    isDragging,
  } = useCalendarPricing({
    defaultPrice,
    roomPriceDates: internalPriceDates,
    soldOutDates: internalSoldOutDates,
  });

  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseUp = () => onMouseUp();
      window.addEventListener("mouseup", handleGlobalMouseUp);
      return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
    }
  }, [isDragging, onMouseUp]);

  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedDates);
    }
  }, [selectedDates, onSelectionChange]);

  const days = useMemo(
    () => getMonthDays(currentDate.getFullYear(), currentDate.getMonth()),
    [currentDate],
  );

  const bookingMap = useMemo(() => {
    const map = new Map<
      number,
      { checkIn?: Booking; checkOut?: Booking; inBetween?: Booking }
    >();

    if (!bookings) return map;

    bookings.forEach((b) => {
      if (b.status === "CANCELLED") return;
      const start = new Date(b.checkIn);
      const end = new Date(b.checkOut);
      const current = new Date(start);

      // Check-in day
      const startKey = toDateKey(start);
      const startEntry = map.get(startKey) || {};
      startEntry.checkIn = b;
      map.set(startKey, startEntry);

      // Check-out day
      const endKey = toDateKey(end);
      const endEntry = map.get(endKey) || {};
      endEntry.checkOut = b;
      map.set(endKey, endEntry);

      // In-between days
      current.setDate(current.getDate() + 1);
      while (current < end) {
        const key = toDateKey(current);
        const entry = map.get(key) || {};
        entry.inBetween = b;
        map.set(key, entry);
        current.setDate(current.getDate() + 1);
      }
    });

    return map;
  }, [bookings]);

  const handleSave = useCallback(
    async (price: number, soldOut: boolean) => {
      // Update local state immediately (optimistic)
      selectedDates.forEach((d) => save(d, price, soldOut));

      // Call API if roomId is provided
      if (!roomId) return;

      setIsSaving(true);
      try {
        const updates: CalendarUpdateItem[] = selectedDates.map((d) => ({
          date: formatDateISO(d),
          price,
          isAvailable: !soldOut,
        }));

        await updateRoomCalendar(roomId, updates);

        toast({
          variant: "success",
          title: "Cập nhật thành công",
          description: `Đã cập nhật ${updates.length} ngày`,
        });
      } catch (err: any) {
        toast({
          variant: "destructive",
          title: "Cập nhật thất bại",
          description: err?.response?.data?.message || err.message,
        });
      } finally {
        setIsSaving(false);
      }
    },
    [roomId, selectedDates, save, toast],
  );

  return (
    <div className="flex flex-col lg:flex-row w-full items-start lg:items-stretch gap-4">
      <div
        className={cn(
          "transition-all duration-300 w-full",
          mode === "pricing" ? "lg:w-[calc(100%-380px)]" : "lg:w-full",
        )}
      >
        <div className="p-4 px-2 sm:px-6 bg-card rounded-xl select-none">
          <CalendarHeader
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
          />

          <p className="text-sm text-muted-foreground mb-4">
            Nhấn giữ Ctrl để chọn nhiều ngày, hoặc kéo chuột để chọn khoảng ngày
          </p>

          <div className="overflow-x-auto pb-4">
            <div className="min-w-175">
              {/* Week */}
              <div className="grid grid-cols-7 mb-2 text-center elegant-sans text-primary">
                {[
                  "Thứ 2",
                  "Thứ 3",
                  "Thứ 4",
                  "Thứ 5",
                  "Thứ 6",
                  "Thứ 7",
                  "Chủ nhật",
                ].map((d) => (
                  <div key={d} className="text-xs sm:text-sm font-semibold">
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 border border-primary">
                {days.map((day, i) => {
                  const prevDate = new Date(day.date);
                  prevDate.setDate(prevDate.getDate() - 1);
                  const nextDate = new Date(day.date);
                  nextDate.setDate(nextDate.getDate() + 1);

                  const hasRedBar = (d: Date) => {
                    const info = bookingMap.get(toDateKey(d));
                    const hasBooking = !!info?.inBetween || !!info?.checkIn;
                    return isSoldOut(d) && !hasBooking;
                  };

                  return (
                    <CalendarCell
                      key={i}
                      day={day}
                      getPrice={getPrice}
                      defaultPrice={defaultPrice}
                      isSoldOut={isSoldOut}
                      bookingsInfo={bookingMap.get(toDateKey(day.date))}
                      isSelected={selectedDates.some(
                        (d) => toDateKey(d) === toDateKey(day.date),
                      )}
                      onMouseDown={(date, e) => onMouseDown(date, e)}
                      onMouseEnter={(date) => onMouseEnter(date)}
                      onMouseUp={onMouseUp}
                      hoveredBookingId={hoveredBookingId}
                      setHoveredBookingId={setHoveredBookingId}
                      isPrevRedBar={hasRedBar(prevDate)}
                      isNextRedBar={hasRedBar(nextDate)}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Edit Panel - Persistent */}
      {mode === "pricing" && (
        <div
          className={cn(
            "shrink-0 bg-card lg:sticky lg:top-0 h-auto lg:h-full min-h-125 overflow-y-auto rounded-xl lg:rounded-none shadow-sm lg:shadow-none border border-gray-100 lg:border-none transition-all duration-300",
            selectedDates.length > 0
              ? "w-full lg:w-95 opacity-100"
              : "w-0 lg:w-95 opacity-100",
          )}
        >
          <EditPanel
            roomId={roomId}
            dates={selectedDates}
            currentPrice={(() => {
              if (selectedDates.length === 0) return null;
              const firstPrice = getPrice(selectedDates[0]);
              const allSame = selectedDates.every(
                (d) => getPrice(d) === firstPrice,
              );
              return allSame ? firstPrice : null;
            })()}
            defaultPrice={defaultPrice}
            isSoldOut={(() => {
              if (selectedDates.length === 0) return null;
              const firstStatus = isSoldOut(selectedDates[0]);
              const allSame = selectedDates.every(
                (d) => isSoldOut(d) === firstStatus,
              );
              return allSame ? firstStatus : null;
            })()}
            booking={
              selectedDates.length === 1
                ? bookingMap.get(toDateKey(selectedDates[0]))?.inBetween ||
                  bookingMap.get(toDateKey(selectedDates[0]))?.checkIn
                : undefined
            }
            onSave={handleSave}
            isSaving={isSaving}
            onClose={clearSelection}
          />
        </div>
      )}
    </div>
  );
}
