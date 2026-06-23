"use client";

import { useFavorites } from "@/_hooks/useFavorites";
import { useRecentlyViewed } from "@/_hooks/useRecentlyViewed";
import { useAuth } from "@/context/auth-context";
import { useLang } from "@/context/lang-context";
import { Room } from "@/models/Room";
import { room_detail } from "@/services/roomApi";
import ScrollFade from "@/styles/animations/ScrollFade";
import { Clock, Heart, MapPin, Star, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

export default function RecentlyViewedSection() {
  const { recentRoomIds, idsKey, hasRecent, clearHistory } =
    useRecentlyViewed();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t } = useLang();
  const { user, openSignIn } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);
  const fetchedKeyRef = useRef<string>("");

  // Favorites — chỉ tạo khi rooms đã load xong
  const favoriteRoomIds = useMemo(() => rooms.map((r) => r.id), [rooms]);
  const { isFavorited, toggle } = useFavorites(favoriteRoomIds);

  // Fetch room details — dùng idsKey (string) làm dependency thay vì array
  useEffect(() => {
    if (!idsKey) {
      if (rooms.length > 0) setRooms([]);
      return;
    }

    // Tránh fetch lại nếu cùng key
    if (idsKey === fetchedKeyRef.current) return;
    fetchedKeyRef.current = idsKey;

    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const ids = idsKey
          .split(",")
          .map(Number)
          .filter((id) => id > 0)
          .slice(0, 6);

        if (!ids.length) {
          setRooms([]);
          setLoading(false);
          return;
        }

        const results = await Promise.all(
          ids.map((id) => room_detail(id).catch(() => null)),
        );
        if (!cancelled) {
          setRooms(results.filter(Boolean) as Room[]);
        }
      } catch (err) {
        console.error("Error fetching recently viewed rooms:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey]);

  if (!hasRecent || loading || rooms.length === 0) return null;

  const formatPrice = (price: number) => `${price.toLocaleString()} VND`;

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
    <section className="pt-6 pb-2 sm:pt-10 sm:pb-2 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-4 sm:mb-8">
          <ScrollFade>
            <div className="flex items-center gap-2 sm:gap-3">
              <Clock size={20} className="text-primary shrink-0" />
              <div>
                <h2 className="elegant-heading text-xl sm:text-2xl text-foreground">
                  Phòng bạn đã xem gần đây
                </h2>
                <p className="elegant-subheading text-xs sm:text-sm text-muted-foreground mt-1">
                  Tiếp tục từ nơi bạn đã dừng lại
                </p>
              </div>
            </div>
          </ScrollFade>
          <button
            onClick={clearHistory}
            className="text-xs sm:text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors cursor-pointer"
          >
            <X size={14} />
            Xoá lịch sử
          </button>
        </div>

        {/* Horizontal scroll */}
        <div
          ref={scrollRef}
          className="flex gap-2 sm:gap-3 md:gap-4 lg:gap-5 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {rooms.map((room) => (
            <div
              key={room.id}
              className="group cursor-pointer shrink-0 w-60 sm:w-65 snap-start bg-card border border-border/50 rounded-2xl p-2.5 shadow-2xs hover:shadow-md hover:border-primary/20 transition-all duration-300 flex flex-col justify-between"
              onClick={() => router.push(`/room/${room.id}`)}
            >
              <div>
                <div className="relative aspect-4/3 overflow-hidden rounded-xl mb-3">
                  <Image
                    src={room.images?.main || "/default.jpg"}
                    alt={room.name}
                    fill
                    sizes="260px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <button
                    className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-sm transition-all duration-300 cursor-pointer z-10 ${
                      isFavorited(room.id)
                        ? "bg-white text-red-500 shadow-md"
                        : "bg-black/20 text-white hover:bg-white hover:text-red-500 shadow-sm"
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
                  <div className="flex justify-between items-start gap-1">
                    <h3 className="font-semibold text-sm text-foreground line-clamp-1">
                      {room.name}
                    </h3>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <Star
                        className="text-yellow-400 fill-current"
                        size={12}
                      />
                      <span className="text-xs font-medium">{room.rating}</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-[11px] flex items-center gap-1">
                    <MapPin size={10} className="shrink-0" />
                    <span className="line-clamp-1">
                      {room.location?.fullAddress || room.location?.province}
                    </span>
                  </p>
                </div>
              </div>
              <div className="pt-2 mt-auto">
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
