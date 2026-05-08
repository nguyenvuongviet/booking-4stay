"use client";

import { Button } from "@/_components/ui/button";
import { getAmenityIcon } from "@/constants/amenity-icons";
import { useAuth } from "@/context/auth-context";
import { useLang } from "@/context/lang-context";
import { Room } from "@/models/Room";
import ScrollFade from "@/styles/animations/ScrollFade";
import ScrollScale from "@/styles/animations/ScrollScale";
import StaggerItem from "@/styles/animations/StaggerItem";
import { Heart, MapPin, Star } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function RoomSection({ rooms }: { rooms: Room[] }) {
  const router = useRouter();
  const { t } = useLang();

  const formatPrice = (price: number) => `${price.toLocaleString()} VND`;

  const { user } = useAuth();

  return (
    <section className="pt-28 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <ScrollScale className="elegant-heading text-4xl text-foreground mb-2">
              {user ? `Gợi ý cho ${user.firstName}` : "Gợi ý cho bạn  "}
            </ScrollScale>
            <ScrollFade className="elegant-subheading text-lg text-muted-foreground">
              {user
                ? "Dựa trên lịch sử và sở thích du lịch của bạn"
                : "Dựa trên sở thích và lựa chọn phổ biến"}
            </ScrollFade>
          </div>
          <Button
            variant="ghost"
            className="text-primary hover:text-primary/80 hidden md:flex items-center gap-2"
          >
            Xem tất cả
            <span className="text-xl">→</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
          {rooms.map((room, index) => (
            <StaggerItem index={index} key={room.id}>
              <div
                className="group cursor-pointer"
                onClick={() => router.push(`/room/${room.id}`)}
              >
                <div className="relative aspect-square overflow-hidden rounded-2xl mb-4">
                  <Image
                    src={room.images?.main || "/default.jpg"}
                    alt={room.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Heart Button */}
                  <button
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/70 backdrop-blur-sm hover:bg-white transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      // logic here
                    }}
                  >
                    <Heart size={18} />
                  </button>

                  {/* Badges */}
                  {room.rating && room.rating >= 4.8 && (
                    <div className="absolute top-3 left-3 px-3 py-1 bg-red-500/80 rounded-full shadow-md">
                      <span className="text-xs font-semibold  text-white uppercase tracking-wider">
                        {t("Trending")}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-base text-foreground line-clamp-1">
                      {room.name}
                    </h3>
                    <div className="flex items-center gap-1 shrink-0">
                      <Star
                        className="text-yellow-400 fill-current"
                        size={16}
                      />
                      <span className="text-sm font-medium">{room.rating}</span>
                    </div>
                  </div>

                  <p className="text-muted-foreground text-sm flex items-center gap-1">
                    <MapPin size={14} />
                    <span className="line-clamp-1">
                      {room.location.fullAddress || room.location.province}
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

                  <div className="pt-2">
                    <span className="font-bold text-base">
                      {formatPrice(room.price)}
                    </span>
                    <span className="text-muted-foreground text-sm font-normal">
                      /{t("night")}
                    </span>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </div>
      </div>
    </section>
  );
}
