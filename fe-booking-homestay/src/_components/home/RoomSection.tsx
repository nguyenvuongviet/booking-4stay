"use client";

import { Button } from "@/_components/ui/button";
import { useFavorites } from "@/_hooks/useFavorites";
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
import { useMemo } from "react";
import toast from "react-hot-toast";

export default function RoomSection({ rooms }: { rooms: Room[] }) {
  const router = useRouter();
  const { t } = useLang();
  const { user, openSignIn } = useAuth();

  const formatPrice = (price: number) => `${price.toLocaleString()} VND`;

  // Favorite logic
  const roomIds = useMemo(() => rooms.map((r) => r.id), [rooms]);
  const { isFavorited, toggle } = useFavorites(roomIds);

  const handleToggleFavorite = async (e: React.MouseEvent, roomId: number) => {
    e.stopPropagation();
    if (!user) {
      openSignIn();
      return;
    }
    const result = await toggle(roomId);
    toast.success(result ? "Đã thêm vào yêu thích" : "Đã bỏ yêu thích");
  };

  return (
    <section className="pt-8 sm:pt-14 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-6 sm:mb-12">
          <div>
            <ScrollScale className="elegant-heading text-2xl sm:text-3xl md:text-4xl text-foreground mb-1 md:mb-2">
              Các phòng phổ biến
            </ScrollScale>
            <ScrollFade className="elegant-subheading text-xs sm:text-sm md:text-lg text-muted-foreground">
              Được đặt nhiều và đánh giá cao bởi khách hàng
            </ScrollFade>
          </div>
          <Button
            variant="ghost"
            className="text-primary hover:text-primary/80 hidden md:flex items-center gap-2"
            onClick={() => router.push("/room")}
          >
            Xem tất cả
            <span className="text-xl">→</span>
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-1.5 sm:gap-3 md:gap-5 lg:gap-6">
          {rooms.map((room, index) => (
            <StaggerItem index={index} key={room.id}>
              <div
                className="group cursor-pointer bg-card border border-border/50 rounded-3xl p-3 shadow-2xs hover:shadow-md hover:border-primary/20 transition-all duration-300 flex flex-col justify-between h-full"
                onClick={() => router.push(`/room/${room.id}`)}
              >
                <div>
                  <div className="relative aspect-square overflow-hidden rounded-2xl mb-3">
                    <Image
                      src={room.images?.main || "/default.jpg"}
                      alt={room.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Heart Button */}
                    <button
                      className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-300 cursor-pointer z-10 ${
                        isFavorited(room.id)
                          ? "bg-white text-red-500 shadow-md"
                          : "bg-black/20 text-white hover:bg-white hover:text-red-500 shadow-sm"
                      }`}
                      onClick={(e) => handleToggleFavorite(e, room.id)}
                    >
                      <Heart
                        size={18}
                        className={
                          isFavorited(room.id)
                            ? "fill-red-500 text-red-500"
                            : ""
                        }
                      />
                    </button>

                    {/* Urgency Badges */}
                    {(room as any).badges?.length > 0 && (
                      <div className="absolute top-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full shadow-md z-10">
                        <span className="text-[10px] font-semibold text-white">
                          {(room as any).badges[0]}
                        </span>
                      </div>
                    )}
                    {!(room as any).badges?.length &&
                      room.rating &&
                      room.rating >= 4.8 && (
                        <div className="absolute top-3 left-3 px-3 py-1 bg-red-500/80 rounded-full shadow-md z-10">
                          <span className="text-[10px] font-semibold text-white uppercase tracking-wider">
                            {t("Trending")}
                          </span>
                        </div>
                      )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-start gap-1">
                      <h3 className="font-bold text-sm sm:text-base text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                        {room.name}
                      </h3>
                      <div className="flex items-center gap-1 shrink-0">
                        <Star
                          className="text-yellow-400 fill-current"
                          size={14}
                        />
                        <span className="text-xs sm:text-sm font-medium">
                          {room.rating}
                        </span>
                      </div>
                    </div>

                    <p className="text-muted-foreground text-xs sm:text-sm flex items-center gap-1">
                      <MapPin size={12} className="shrink-0" />
                      <span className="line-clamp-1">
                        {room.location.fullAddress || room.location.province}
                      </span>
                    </p>

                    <div className="flex items-center gap-1.5 mb-2 h-4 overflow-hidden">
                      {(room.amenities || []).slice(0, 3).map((amenity) => (
                        <div
                          key={amenity.id}
                          className="text-muted-foreground flex items-center"
                          title={amenity.name}
                        >
                          <span className="text-sm sm:text-base">
                            {getAmenityIcon(amenity.name)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/40 mt-auto flex items-baseline gap-1">
                  <span className="font-bold text-sm sm:text-base">
                    {formatPrice(room.price)}
                  </span>
                  <span className="text-muted-foreground text-xs font-normal">
                    /{t("night")}
                  </span>
                </div>
              </div>
            </StaggerItem>
          ))}
        </div>
      </div>
    </section>
  );
}
