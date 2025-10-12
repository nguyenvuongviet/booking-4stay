"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Hotel } from "@/models/Hotel";
import {
  Star,
  MapPin,
} from "lucide-react";

type RoomCardProps = { hotel: Hotel };

export function RoomCard({ hotel }: RoomCardProps) {
  const router = useRouter();
  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} VND`;
  };

  return (
    <Card
      onClick={() => router.push(`/room/${hotel.id}`)}
      className="overflow-hidden hover:shadow-xl transition-all duration-500 hover:cursor-pointer"
    >
      <div className="relative">
        <Image
          src={hotel.image || "/placeholder.svg"}
          alt={hotel.name}
          width={400}
          height={600}
          className="w-full h-72 object-cover rounded-t-2xl"
        />
        <div className="absolute top-4 right-4 bg-border px-2 py-1 rounded-full flex items-center gap-1">
          <Star className="text-chart-4 fill-current" size={16} />
          <span className="text-sm font-medium">{hotel.rating}</span>
        </div>
      </div>
      <CardContent className="pb-8 ">
        <h3 className="elegant-heading text-2xl text-foreground pb-6 truncate">
          {hotel.name}
        </h3>
        <p className="elegant-subheading text-muted-foreground mb-2 flex items-center gap-1">
          <MapPin size={16} />
          {hotel.location}
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
              {formatPrice(hotel.price)}
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
