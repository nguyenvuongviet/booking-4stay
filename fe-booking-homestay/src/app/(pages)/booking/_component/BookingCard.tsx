import { Card } from "@/_components/ui/card";
import { useLang } from "@/context/lang-context";
import { parseAbsoluteDate } from "@/lib/utils";
import { Booking } from "@/models/Booking";
import { format } from "date-fns";
import { CalendarDays, ChevronRight, MapPin, Star } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BookingStatusBadge } from "./BookingStatusBadge";

type BookingCardProps = { booking: Booking };

export function BookingCard({ booking }: BookingCardProps) {
  const router = useRouter();
  const { t } = useLang();

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} VND`;
  };

  const formattedCheckIn = format(
    parseAbsoluteDate(booking.checkIn),
    "dd/MM/yyyy",
  );
  const formattedCheckOut = format(
    parseAbsoluteDate(booking.checkOut),
    "dd/MM/yyyy",
  );

  return (
    <Card
      onClick={() => router.push(`/booking/${booking.id}`)}
      className="overflow-hidden group hover:shadow-xl transition-all duration-500 cursor-pointer border border-gray-100 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-xl rounded-2xl"
    >
      <div className="flex flex-col lg:flex-row h-full">
        {/* Responsive Image Container */}
        <div className="relative w-full lg:w-64 h-48 sm:h-56 lg:h-auto shrink-0 overflow-hidden">
          <Image
            src={booking.room?.images?.main || "/placeholder.svg"}
            alt={booking.room.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute top-3 left-3 bg-card/60 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
            <Star className="text-yellow-400 fill-current" size={13} />
            <span className="text-xs font-semibold elegant-sans text-foreground">
              {booking.room.rating}
            </span>
          </div>
        </div>

        {/* Details Container with Compact Spacings */}
        <div className="flex-1 p-4 sm:p-5 lg:p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            {/* Header Title and Status Badge */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="elegant-sans text-lg sm:text-xl font-bold text-foreground tracking-tight group-hover:text-primary transition-colors duration-300 line-clamp-1 sm:line-clamp-2">
                  {booking.room.name}
                </h3>
                <div className="flex items-center gap-1.5 mt-1.5 text-muted-foreground">
                  <MapPin size={14} className="text-primary shrink-0" />
                  <span className="text-xs sm:text-sm elegant-subheading line-clamp-1">
                    {booking.room?.location?.fullAddress}
                  </span>
                </div>
              </div>
              <div className="shrink-0 self-start">
                <BookingStatusBadge status={booking.status} size="sm" />
              </div>
            </div>

            {/* Compact Accommodation Metadata Pills */}
            <div className="flex flex-wrap gap-x-6 gap-y-3 mt-4">
              <div className="flex items-center gap-2.5 py-1">
                <CalendarDays size={16} className="text-primary shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[10px] tracking-wider text-slate-400 dark:text-slate-500 elegant-sans leading-none mb-0.5 uppercase">
                    Thời gian lưu trú
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-foreground elegant-sans">
                    {formattedCheckIn} — {formattedCheckOut}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 py-1">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[9px] uppercase shrink-0">
                  ID
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] tracking-wider text-slate-400 dark:text-slate-500 elegant-sans leading-none mb-0.5 uppercase">
                    Mã đặt phòng
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-foreground elegant-sans">
                    #{booking.id.toString().slice(-8).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Compact Price and Action Link Footer */}
          <div className="mt-4 pt-3 border-t border-border dark:border-white/10 flex items-end justify-between relative z-10">
            <div className="space-y-0.5">
              <span className="text-[10px] elegant-sans text-muted-foreground uppercase tracking-widest">
                Tổng cộng
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-bold elegant-sans text-primary tracking-tight">
                  {formatPrice(booking.totalAmount)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-muted-foreground text-xs sm:text-sm group/link hover:text-primary transition-colors cursor-pointer">
              <span>Chi tiết</span>
              <div className="w-6 h-6 rounded-full flex items-center justify-center transition-transform group-hover/link:translate-x-0.5">
                <ChevronRight size={16} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
