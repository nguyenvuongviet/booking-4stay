"use client";

import { useFavorites } from "@/_hooks/useFavorites";
import { useAuth } from "@/context/auth-context";
import { useLang } from "@/context/lang-context";
import { getAvailableSoonRooms } from "@/services/recommendationApi";
import ScrollFade from "@/styles/animations/ScrollFade";
import { CalendarCheck, Heart, MapPin, Star } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

interface AvailableRoom {
  id: number;
  name: string;
  price: number;
  rating: number;
  images?: { main: string };
  location?: { fullAddress?: string; province?: string };
}

export default function AvailableSoonSection() {
  const [rooms, setRooms] = useState<AvailableRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { t } = useLang();
  const { user, openSignIn } = useAuth();
  const hasFetched = useRef(false);

  // Favorites
  const roomIds = useMemo(() => rooms.map((r) => r.id), [rooms]);
  const { isFavorited, toggle } = useFavorites(roomIds);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    (async () => {
      try {
        const data = await getAvailableSoonRooms(7, 8);
        setRooms(data);
      } catch (err) {
        console.error("Error fetching available soon rooms:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleToggleFavorite = async (e: React.MouseEvent, roomId: number) => {
    e.stopPropagation();
    if (!user) {
      openSignIn();
      return;
    }
    const result = await toggle(roomId);
    toast.success(result ? "Đã thêm vào yêu thích" : "Đã bỏ yêu thích");
  };

  if (loading || rooms.length === 0) return null;

  const formatPrice = (price: number) => `${price.toLocaleString()} VND`;

  return (
    <section className="py-16 bg-linear-to-b from-background to-accent/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollFade>
          <div className="flex items-center gap-3 mb-2">
            <CalendarCheck size={22} className="text-emerald-500" />
            <h2 className="elegant-heading text-2xl text-foreground">
              Đặt ngay — Phòng trống tuần này
            </h2>
          </div>
          <p className="elegant-subheading text-sm text-muted-foreground mb-8">
            Các phòng đang trống trong 7 ngày tới, sẵn sàng phục vụ bạn
          </p>
        </ScrollFade>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="group cursor-pointer"
              onClick={() => router.push(`/room/${room.id}`)}
            >
              <div className="relative aspect-4/3 overflow-hidden rounded-xl mb-3">
                <Image
                  src={room.images?.main || "/default.jpg"}
                  alt={room.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Available badge */}
                <div className="absolute bottom-2 left-2 px-2.5 py-1 bg-emerald-500/90 backdrop-blur-sm rounded-full">
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                    Còn trống
                  </span>
                </div>
                {/* Heart */}
                <button
                  className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-sm transition-all duration-300 ${
                    isFavorited(room.id)
                      ? "bg-white text-red-500"
                      : "bg-black/20 text-white hover:bg-white hover:text-red-500"
                  }`}
                  onClick={(e) => handleToggleFavorite(e, room.id)}
                >
                  <Heart
                    size={14}
                    className={
                      isFavorited(room.id) ? "fill-red-500 text-red-500" : ""
                    }
                  />
                </button>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-sm text-foreground line-clamp-1">
                    {room.name}
                  </h3>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <Star className="text-yellow-400 fill-current" size={12} />
                    <span className="text-xs font-medium">{room.rating}</span>
                  </div>
                </div>
                <p className="text-muted-foreground text-xs flex items-center gap-1">
                  <MapPin size={11} />
                  <span className="line-clamp-1">
                    {room.location?.fullAddress || room.location?.province}
                  </span>
                </p>
                <p className="font-bold text-sm">
                  {formatPrice(room.price)}
                  <span className="text-muted-foreground text-xs font-normal">
                    /{t("night")}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
