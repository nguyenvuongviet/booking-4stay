import { cn } from "@/lib/utils";
import { getPriceStatus } from "@/lib/utils/priceStatus";
import { Booking } from "@/types/booking";
import { PRICE_STATUS_CONFIG } from "@/styles/priceStatus";
import { DayCell } from "@/types/calendar";
import { Mail, Phone } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";
interface CalendarCellProps {
    day: DayCell;
    getPrice: (date: Date) => number;
    defaultPrice: number;
    isSoldOut: (date: Date) => boolean;
    booking?: Booking;
    isSelected?: boolean;
    onClick?: (date: Date, e: React.MouseEvent<HTMLDivElement>) => void;
}

export default function CalendarCell({
    day,
    getPrice,
    defaultPrice,
    isSoldOut,
    booking,
    isSelected,
    onClick,
}: CalendarCellProps) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // reset giờ để so sánh chỉ ngày
    const isPast = day.date < today;

    const price = getPrice(day.date);
    const isOutMonth = !day.currentMonth ? "text-muted-foreground bg-muted/20" : "";
    const status = getPriceStatus(price, defaultPrice);
    const { color, Icon } = PRICE_STATUS_CONFIG[status];

    const availabilityStatus = isSoldOut(day.date) ? "Hết phòng" : "Còn phòng";

    return (
        <Tooltip.Provider>
            <Tooltip.Root delayDuration={100}>
                {/* Trigger: cả cell */}
                <Tooltip.Trigger asChild>
                    <div
                        onClick={(e) => !isPast && onClick?.(day.date, e)}
                        className={cn(
                            `aspect-square p-2 border border-primary cursor-pointer 
                            hover:bg-primary/20 transition text-md gap-2 flex flex-col 
                            text-center justify-between select-none relative`,
                            isOutMonth,
                            isSelected && "bg-primary/50",
                            isPast
                                ? "bg-muted/40 text-muted cursor-not-allowed pointer-events-none"
                                : "cursor-pointer hover:bg-primary/20"
                        )}
                    >
                        <div className="font-semibold text-end mb-2">{day.date.getDate()}</div>
                        <div
                            className={cn(
                                `${isOutMonth ? "opacity-90" : ""}`,
                                isSoldOut(day.date) ? "bg-red-400" : "bg-green-400",
                                "text-white text-sm rounded-full p-1 w-full",
                                isPast && "opacity-0"
                            )}
                        >
                            {availabilityStatus}
                        </div>
                        <div className={cn(`text-md mt-2,
                                ${isOutMonth ? "opacity-90" : ""}`,
                                isPast && "opacity-0", color)}>
                            <span className="flex justify-center gap-2">
                                {price.toLocaleString()}
                                {Icon && <Icon className="w-5 h-5" />}
                            </span>
                        </div>
                    </div>
                </Tooltip.Trigger>

                {booking && booking.status !== "CANCELLED" && (
                    <Tooltip.Portal>
                        <Tooltip.Content
                            side="top"
                            align="center"
                            sideOffset={6}
                            className="z-50 w-max py-4 px-6 rounded-2xl bg-primary/30 backdrop-blur-sm shadow-lg
                                        data-[state=delayed-open]:animate-fade-in data-[state=delayed-close]:animate-fade-out"
                        >
                            <p className="truncate elegant-sans text-secondary-foreground ">
                                {booking.guestInfo.fullName}
                            </p>
                            <div className="flex flex-col text-left gap-1 mt-1 text-sm">
                                <span>
                                    <Mail className="w-4 h-4 inline mr-1" />: {booking.guestInfo.email}
                                </span>
                                <span>
                                    <Phone className="w-4 h-4 inline mr-1" />: {booking.guestInfo.phoneNumber}
                                </span>
                            </div>
                            <Tooltip.Arrow className="fill-primary/30" />
                        </Tooltip.Content>
                    </Tooltip.Portal>
                )}
            </Tooltip.Root>
        </Tooltip.Provider>
    );
}