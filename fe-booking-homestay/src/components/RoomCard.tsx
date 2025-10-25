"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { Hotel } from "@/models/Hotel";
import { Star, MapPin } from "lucide-react";
import { Room } from "@/models/Room";

type RoomCardProps = { room: Room };

export function RoomCard({ room }: RoomCardProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const loc = searchParams.get("location");
  const ad = searchParams.get("adults");
  const ch = searchParams.get("children");
  const ci = searchParams.get("checkIn");
  const co = searchParams.get("checkOut");
  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} VND`;
  };
  const getRoomImage = (url?: string) => url || "/images/da-nang.jpg";
  const query = new URLSearchParams({
    location: loc || "",
    ...(ci ? { checkIn:ci } : {}),
    ...(co ? { checkOut:co } : {}),
    adults: ad || "1",
    children: ch || "0",
  }).toString();

  return (
    <Card
      onClick={() =>
        // router.push(`/room/${room.id}`)

        router.push(`/room/${room.id}?${query}`)
      }
      className="overflow-hidden hover:shadow-xl transition-all duration-500 hover:cursor-pointer"
    >
      <div className="relative">
        <Image
          src={getRoomImage(room.images?.main)}
          alt={room.name}
          width={400}
          height={600}
          priority
          className="w-full h-72 object-cover rounded-t-2xl"
        />
        <div className="absolute top-4 right-4 bg-border px-2 py-1 rounded-full flex items-center gap-1">
          <Star className="text-chart-4 fill-current" size={16} />
          <span className="text-sm font-medium">{room.rating}</span>
        </div>
      </div>
      <CardContent className="pb-8 ">
        <h3 className="elegant-heading text-2xl text-foreground pb-6 truncate">
          {room.name}
        </h3>
        <p className="elegant-subheading text-muted-foreground mb-2 flex items-center gap-1">
          <MapPin size={16} />
          {room.location.fullAddress}
        </p>

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
        <div className="flex flex-row-reverse">
          <div>
            <span className="text-2xl elegant-heading text-foreground">
              {formatPrice(room.price)}
            </span>
            <span className="elegant-subheading text-muted-foreground">
              /night
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
