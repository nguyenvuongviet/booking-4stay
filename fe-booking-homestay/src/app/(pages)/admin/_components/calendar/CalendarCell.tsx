import { cn } from "@/lib/utils";
import { getPriceStatus } from "@/lib/utils/priceStatus";
import { PRICE_STATUS_CONFIG } from "@/styles/priceStatus";
import { Booking } from "@/types/booking";
import { DayCell } from "@/types/calendar";
import * as Popover from "@radix-ui/react-popover";
import { X } from "lucide-react";
import Link from "next/link";

const BookingPopoverContent = ({ booking }: { booking: Booking }) => {
  return (
    <Popover.Content
      side="bottom"
      align="center"
      sideOffset={6}
      className="z-999 w-64 rounded-sm bg-white shadow-xl overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 font-sans"
    >
      {/* Header */}
      <div className="bg-[#1e58d6] text-white p-2 px-3 flex items-center justify-between">
        <h4 className="font-bold text-sm truncate pr-2 flex-1 min-w-0">
          {booking.guestInfo.fullName}
        </h4>
        <Popover.Close asChild>
          <button className="p-1 hover:bg-white/20 rounded-md transition cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </Popover.Close>
      </div>

      {/* Body */}
      <div className="p-3 space-y-3 text-xs text-gray-500">
        <div>
          <div className="mb-1">Mã số đặt phòng:</div>
          <div className="font-bold text-gray-700">{booking.id}</div>
        </div>

        <div className="flex justify-between">
          <div>
            <div className="mb-1">Ngày đến:</div>
            <div className="font-bold text-gray-700">
              {String(booking.checkIn).split("T")[0]}
            </div>
          </div>
          <div>
            <div className="mb-1">Ngày đi:</div>
            <div className="font-bold text-gray-700">
              {String(booking.checkOut).split("T")[0]}
            </div>
          </div>
        </div>

        <div>
          <div className="mb-1">Tổng số khách:</div>
          <div className="font-bold text-gray-700">
            {booking.adults} người lớn
            {booking.children ? `, ${booking.children} trẻ em` : ""}
          </div>
        </div>

        <div>
          <div className="mb-1">Khách thanh toán:</div>
          <div className="font-bold text-gray-700">
            VND{" "}
            {(
              (booking.totalAmount || 0) + (booking.paidAmount || 0)
            ).toLocaleString()}
          </div>
        </div>

        <div className="pt-1">
          <Link
            href={`/admin/bookings/${booking.id}`}
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            Thêm chi tiết
          </Link>
        </div>
      </div>

      <Popover.Arrow className="fill-[#1e58d6]" />
    </Popover.Content>
  );
};

interface CalendarCellProps {
  day: DayCell;
  getPrice: (date: Date) => number;
  defaultPrice: number;
  isSoldOut: (date: Date) => boolean;
  bookingsInfo?: {
    checkIn?: Booking;
    checkOut?: Booking;
    inBetween?: Booking;
  };
  isSelected?: boolean;
  onMouseDown?: (date: Date, e: React.MouseEvent) => void;
  onMouseEnter?: (date: Date) => void;
  onMouseUp?: () => void;
  hoveredBookingId?: number | null;
  setHoveredBookingId?: (id: number | null) => void;
  isPrevRedBar?: boolean;
  isNextRedBar?: boolean;
}

export default function CalendarCell({
  day,
  getPrice,
  defaultPrice,
  isSoldOut,
  bookingsInfo = {},
  isSelected,
  onMouseDown,
  onMouseEnter,
  onMouseUp,
  hoveredBookingId,
  setHoveredBookingId,
  isPrevRedBar,
  isNextRedBar,
}: CalendarCellProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // reset giờ để so sánh chỉ ngày
  const isPast = day.date < today;

  const price = getPrice(day.date);
  const isOutMonth = !day.currentMonth
    ? "text-muted-foreground bg-muted/20"
    : "";
  const status = getPriceStatus(price, defaultPrice);
  const { color, Icon } = PRICE_STATUS_CONFIG[status];

  const availabilityStatus = isSoldOut(day.date) ? "Hết phòng" : "Còn phòng";

  const { checkIn, checkOut, inBetween } = bookingsInfo;

  // Nếu có checkIn hoặc inBetween thì đêm đó đã có người ở
  const isOccupied = !!checkIn || !!inBetween;

  // Lấy thông tin booking chính để hiển thị tooltip (ưu tiên inBetween > checkIn > checkOut)
  const mainBooking = inBetween || checkIn || checkOut;

  const isThisSoldOut = isSoldOut(day.date);

  return (
    <div
      onMouseDown={(e) => onMouseDown?.(day.date, e)}
      onMouseEnter={() => onMouseEnter?.(day.date)}
      onMouseUp={() => onMouseUp?.()}
      className={cn(
        `min-h-[100px] sm:min-h-[120px] border-r border-b border-gray-200 cursor-pointer 
                transition flex flex-col relative bg-white select-none`,
        isOutMonth && "bg-gray-50/50",
        isSelected &&
          !isPast &&
          "bg-blue-50/50 ring-2 ring-inset ring-blue-500",
        isPast &&
          "bg-gray-100/50 text-gray-400 cursor-not-allowed hover:bg-gray-100/50",
      )}
      style={{
        zIndex: 10 - (day.date.getDay() === 0 ? 7 : day.date.getDay()),
      }}
    >
      {/* Date Number - Top Left */}
      <div
        className={cn(
          "font-bold text-xs pl-2 pt-2 z-20 relative",
          isPast ? "text-gray-400" : "text-gray-800",
        )}
      >
        {day.date.getDate()}
      </div>

      {/* Booking Bars Container (Absolute at top: 24px) */}
      <div className="absolute top-8 left-0 right-0 h-6 z-30 pointer-events-none flex items-center">
        {(() => {
          const isThisRedBar = isThisSoldOut && !inBetween && !checkIn;
          const hasRedBarToRender = isThisRedBar || isPrevRedBar;

          if (!hasRedBarToRender) return null;

          return (
            <div
              className={cn(
                "absolute h-full bg-[#ef4444] flex items-center shadow-sm pointer-events-auto z-40 transition-all",
                isThisRedBar && !isPrevRedBar
                  ? "left-[30%] w-[calc(70%+1px)] rounded-l-full"
                  : "",
                isThisRedBar && isPrevRedBar ? "left-0 w-[calc(100%+1px)]" : "",
                !isThisRedBar && isPrevRedBar
                  ? "left-0 w-[20%] rounded-r-full"
                  : "",
              )}
            >
              {isThisRedBar && !isPrevRedBar && (
                <span className="text-white text-[10px] font-medium whitespace-nowrap pl-1 pointer-events-none drop-shadow-md">
                  Đóng
                </span>
              )}
            </div>
          );
        })()}

        {checkOut && (
          <Popover.Root>
            <Popover.Trigger asChild>
              <div
                onClick={(e) => e.stopPropagation()}
                onMouseEnter={() => setHoveredBookingId?.(checkOut.id)}
                onMouseLeave={() => setHoveredBookingId?.(null)}
                className={cn(
                  "absolute left-0 w-[20%] h-full rounded-r-full shadow-sm pointer-events-auto cursor-pointer transition z-40",
                  hoveredBookingId === checkOut.id
                    ? "bg-[#2a4073]"
                    : "bg-[#3b5998] hover:bg-[#2a4073]",
                )}
              />
            </Popover.Trigger>
            <Popover.Portal>
              <BookingPopoverContent booking={checkOut} />
            </Popover.Portal>
          </Popover.Root>
        )}

        {inBetween && (
          <Popover.Root>
            <Popover.Trigger asChild>
              <div
                onClick={(e) => e.stopPropagation()}
                onMouseEnter={() => setHoveredBookingId?.(inBetween.id)}
                onMouseLeave={() => setHoveredBookingId?.(null)}
                className={cn(
                  "absolute left-0 right-0 h-full shadow-sm pointer-events-auto cursor-pointer transition z-40",
                  hoveredBookingId === inBetween.id
                    ? "bg-[#2a4073]"
                    : "bg-[#3b5998] hover:bg-[#2a4073]",
                )}
              />
            </Popover.Trigger>
            <Popover.Portal>
              <BookingPopoverContent booking={inBetween} />
            </Popover.Portal>
          </Popover.Root>
        )}

        {inBetween && day.date.getDay() === 1 && (
          <div
            className="absolute left-0 h-full pointer-events-none z-50 flex items-center px-2"
            style={{
              width: (() => {
                const checkOutDate = new Date(inBetween.checkOut);
                const d1 = new Date(
                  day.date.getFullYear(),
                  day.date.getMonth(),
                  day.date.getDate(),
                );
                const d2 = new Date(
                  checkOutDate.getFullYear(),
                  checkOutDate.getMonth(),
                  checkOutDate.getDate(),
                );
                const diffDays = Math.round(
                  (d2.getTime() - d1.getTime()) / 86400000,
                );
                const daysToSunday =
                  7 - (day.date.getDay() === 0 ? 7 : day.date.getDay());
                const span = Math.min(diffDays, daysToSunday + 1);
                return `${span * 100}%`;
              })(),
            }}
          >
            <span className="text-white text-[10px] font-black truncate drop-shadow-md block w-full">
              {inBetween.guestInfo.fullName}
            </span>
          </div>
        )}

        {checkIn && (
          <Popover.Root>
            <Popover.Trigger asChild>
              <div
                onClick={(e) => e.stopPropagation()}
                onMouseEnter={() => setHoveredBookingId?.(checkIn.id)}
                onMouseLeave={() => setHoveredBookingId?.(null)}
                className={cn(
                  "absolute left-[30%] right-0 h-full rounded-l-full shadow-sm pointer-events-auto cursor-pointer transition z-40",
                  hoveredBookingId === checkIn.id
                    ? "bg-[#2a4073]"
                    : "bg-[#3b5998] hover:bg-[#2a4073]",
                )}
              />
            </Popover.Trigger>
            <Popover.Portal>
              <BookingPopoverContent booking={checkIn} />
            </Popover.Portal>
          </Popover.Root>
        )}

        {checkIn && (
          <div
            className="absolute left-[30%] h-full pointer-events-none z-50 flex items-center px-1"
            style={{
              width: (() => {
                const checkInDate = new Date(checkIn.checkIn);
                const checkOutDate = new Date(checkIn.checkOut);
                const d1 = new Date(
                  checkInDate.getFullYear(),
                  checkInDate.getMonth(),
                  checkInDate.getDate(),
                );
                const d2 = new Date(
                  checkOutDate.getFullYear(),
                  checkOutDate.getMonth(),
                  checkOutDate.getDate(),
                );
                const diffDays = Math.round(
                  (d2.getTime() - d1.getTime()) / 86400000,
                );
                const daysToSunday =
                  7 - (day.date.getDay() === 0 ? 7 : day.date.getDay());
                const span = Math.min(diffDays, daysToSunday + 1);
                return `calc(${(span - 0.3) * 100}%)`;
              })(),
            }}
          >
            <span className="text-white text-[10px] font-black truncate drop-shadow-md block w-full pl-1">
              {checkIn.guestInfo.fullName}
            </span>
          </div>
        )}
      </div>

      {/* Availability and Price - Bottom */}
      <div className="mt-auto flex flex-col items-center justify-end pb-3 h-full z-20 relative pointer-events-none">
        {!isOccupied && !isPast && !isThisSoldOut && (
          <>
            <div className="text-[10px] mb-1 font-medium text-gray-500">
              Mở bán
            </div>
            <div className={cn("text-[11px] font-semibold", color)}>
              VND {price.toLocaleString()}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
