"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Booking } from "@/models/Booking";
import { format } from "date-fns";
import { MapPin, Star } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BookingStatusBadge } from "./BookingStatusBadge";
import { useLang } from "@/context/lang-context";

type BookingCardProps = { booking: Booking };

export function BookingCard({ booking }: BookingCardProps) {
  const router = useRouter();
  const {t} = useLang();

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} VND`;
  };

  const formattedCheckIn = format(booking.checkIn, "dd/MM/yyyy");
  const formattedCheckOut = format(booking.checkOut, "dd/MM/yyyy");

  const nights = Math.ceil(
    (new Date(booking.checkOut).getTime() -
      new Date(booking.checkIn).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <Card
      onClick={() => router.push(`/booking/${booking.id}`)}
      className="overflow-hidden hover:shadow-xl transition-all duration-500 hover:cursor-pointer"
    >
      <div className="flex">
        <div className="relative w-56 h-56 shrink-0">
          <Image
            src={booking.room?.images?.main || "/placeholder.svg"}
            alt={booking.room.name}
            fill
            className="object-cover rounded-l-2xl line-clamp-1 truncate"
          />
          <div className="absolute top-2 left-2 bg-border px-2 py-1 rounded-full flex items-center gap-1">
            <Star className="text-yellow-400 fill-current" size={16} />
            <span className="text-sm elegant-sans">{booking.room.rating}</span>
          </div>
        </div>
        <div className="flex-1 relative">
          <div className="absolute top-6 right-6">
            <BookingStatusBadge status={booking.status} />
          </div>
          <CardContent className="p-6 w-full">
            <h3 className="elegant-heading text-2xl text-foreground pb-4 line-clamp-1 truncate">
              {booking.room.name}
            </h3>
            <p className="elegant-subheading text-muted-foreground mb-2 flex items-center gap-1">
              <MapPin size={16} />
              {booking.room?.location?.fullAddress}
            </p>
            <p className="elegant-subheading text-muted-foreground mb-2 flex items-center gap-1">
              {formattedCheckIn} - {formattedCheckOut}
            </p>

            {/* <p className="elegant-subheading text-muted-foreground mb-1 flex items-center gap-1">
              Booking date: {format(new Date(booking.createdAt), "dd/MM/yyyy")}
            </p> */}

            {/* <div className="flex items-center gap-2 mb-4">
                          {hotel.amenities.map((amenity) => (
                            <div
                              key={amenity}
                              className="elegant-subheading text-muted-foreground"
                            >
                              {getAmenityIcon(amenity)}
                            </div>
                          ))}
                        </div> */}
            <div className="flex flex-col">
              <div className="flex justify-between items-center">
              <p className="elegant-subheading text-sm text-muted-foreground flex items-center gap-1">
                {t("Booking code")}:
                <span className="text-green-700">#{booking.id}</span>
              </p>
              <div className="text-right">
                <span className="elegant-subheading text-foreground">
                  {formatPrice(booking.room.price)}
                </span>
                <span className="elegant-subheading text-muted-foreground">
                  /{t("night")}
                </span>
              </div>
              </div>
              <div className="text-right pt-1">
                <span className="text-2xl elegant-sans text-secondary-foreground">
                  {formatPrice(booking.room.price * nights)}
                </span>
              </div>
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
