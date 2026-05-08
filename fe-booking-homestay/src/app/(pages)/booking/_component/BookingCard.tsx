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
      className="overflow-hidden group hover:shadow-2xl transition-all duration-500 cursor-pointer border border-gray-100 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-xl rounded-3xl"
    >
      <div className="flex flex-col md:flex-row h-full">
        <div className="relative w-full md:w-80 h-64 md:h-auto shrink-0 overflow-hidden">
          <Image
            src={booking.room?.images?.main || "/placeholder.svg"}
            alt={booking.room.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute top-4 left-4 bg-card/50 backdrop-blur-sm px-3 py-2 rounded-full flex items-center gap-1 shadow-lg">
            <Star className="text-yellow-400 fill-current" size={15} />
            <span className="text-sm elegant-sans">{booking.room.rating}</span>
          </div>
        </div>

        <div className="flex-1 p-4 md:p-6 md:px-8 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="elegant-sans text-2xl text-foreground tracking-tight group-hover:text-primary transition-colors duration-300">
                  {booking.room.name}
                </h3>
                <div className="absolute top-0 right-0">
                  <BookingStatusBadge status={booking.status} />
                </div>
                <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                  <MapPin size={16} className="text-primary" />
                  <span className="text-sm elegant-subheading line-clamp-1">
                    {booking.room?.location?.fullAddress}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-6 mt-6">
              <div className="flex items-center gap-3 px-4 py-2 rounded-2xl">
                <CalendarDays size={18} className="text-primary" />
                <div className="flex flex-col">
                  <span className="text-xs tracking-widest text-muted-foreground elegant-sans leading-none">
                    Thời gian lưu trú
                  </span>
                  <span className="text-sm elegant-sans text-foreground">
                    {formattedCheckIn} — {formattedCheckOut}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 px-4 py-2 rounded-2xl">
                <div className="w-6 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
                  ID
                </div>
                <div className="flex flex-col">
                  <span className="text-xs tracking-widest text-muted-foreground elegant-sans leading-none">
                    Mã đặt phòng
                  </span>
                  <span className="text-sm elegant-sans text-foreground">
                    #{booking.id.toString().slice(-8).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border dark:border-white/10 flex items-end justify-between relative z-10">
            <div className="space-y-1">
              <span className="text-xs elegant-sans text-muted-foreground uppercase tracking-widest">
                Tổng cộng
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl elegant-sans text-primary tracking-tighter">
                  {formatPrice(booking.totalAmount)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground text-sm group/link">
              <span>Chi tiết</span>
              <div className="w-8 h-8 rounded-full flex items-center justify-center transition-transform group-hover/link:translate-x-1">
                <ChevronRight size={20} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
