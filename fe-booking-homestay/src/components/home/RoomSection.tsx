"use client";

import { Card, CardContent } from "@/components/ui/card";
import HoverScale from "@/styles/animations/HoverScale";
import StaggerItem from "@/styles/animations/StaggerItem";
import ScrollFade from "@/styles/animations/ScrollFade";
import ScrollScale from "@/styles/animations/ScrollScale";
import { getAmenityIcon } from "@/constants/amenity-icons";
import { Room } from "@/models/Room";
import { Button } from "@/components/ui/button";
import { MapPin, Star } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { use } from "react";
import { useLang } from "@/context/lang-context";

export default function RoomSection({
  rooms,
}: {
  rooms: Room[];
}) {
  const router = useRouter();
  const {t} = useLang();

  const formatPrice = (price: number) =>
    `${price.toLocaleString()} VND`;

  return (
    <section className="py-26 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <ScrollScale className="elegant-heading text-5xl text-foreground mb-6">
            {t("Featured Hotels")}
          </ScrollScale>
          <ScrollFade className="elegant-subheading text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("Discover our handpicked selection of premium accommodations")}
          </ScrollFade>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rooms.map((room, index) => (
            <StaggerItem index={index} key={room.id}>
              <HoverScale>
                <Card className="overflow-hidden hover:shadow-xl">
                  <div className="relative">
                    <Image
                      src={room.images?.main || "/default.jpg"}
                      alt={room.name}
                      width={400}
                      height={600}
                      className="w-full h-64 object-cover rounded-t-2xl transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded-full flex items-center gap-1">
                      <Star className="text-yellow-400 fill-current" size={16} />
                      <span className="text-sm elegant-sans">
                        {room.rating}
                      </span>
                    </div>
                  </div>

                  <CardContent className="pb-8">
                    <h3 className="elegant-heading text-xl text-secondary-foreground mb-2">
                      {room.name}
                    </h3>

                    <p className="elegant-subheading text-sm text-muted-foreground mb-2 flex items-center gap-1">
                      <MapPin size={20} className="mr-2" />
                      <span className="line-clamp-1">
                        {room.location.fullAddress}
                      </span>
                    </p>

                    <div className="flex items-center gap-2 mb-4 h-4">
                      {(room.amenities || []).map((amenity) => (
                        <div
                          key={amenity.id}
                          className="elegant-subheading text-muted-foreground flex items-center gap-1"
                        >
                          <span>{getAmenityIcon(amenity.name)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-xl elegant-sans text-foreground">
                          {formatPrice(room.price)}
                        </span>
                        <span className="elegant-subheading text-sm text-muted-foreground">
                          /{t("night")}
                        </span>
                      </div>

                      <Button
                        onClick={() => router.push(`/room/${room.id}`)}
                        className="bg-primary hover:bg-primary/90 elegant-sans hover:cursor-pointer rounded-xl"
                      >
                        {t("Book Now")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </HoverScale>
            </StaggerItem>
          ))}
        </div>
      </div>
    </section>
  );
}
