"use client";

import { useFavorites } from "@/_hooks/useFavorites";
import { useAuth } from "@/context/auth-context";
import { useLang } from "@/context/lang-context";
import {
  getAvailableSoonRooms,
  getForYouRooms,
} from "@/services/recommendationApi";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

export default function RoomListRecommendations({
  onRoomsLoaded,
}: {
  onRoomsLoaded?: (rooms: any[]) => void;
}) {
  const { user, openSignIn } = useAuth();
  const { t } = useLang();
  const router = useRouter();

  const [forYouRooms, setForYouRooms] = useState<any[]>([]);
  const [availableSoon, setAvailableSoon] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Refs and scroll states for "For You" section
  const forYouRef = useRef<HTMLDivElement>(null);
  const [forYouLeft, setForYouLeft] = useState(false);
  const [forYouRight, setForYouRight] = useState(true);

  // Refs and scroll states for "Available Soon" section
  const soonRef = useRef<HTMLDivElement>(null);
  const [soonLeft, setSoonLeft] = useState(false);
  const [soonRight, setSoonRight] = useState(true);

  const allRoomIds = useMemo(
    () => [...forYouRooms, ...availableSoon].map((r) => r.id),
    [forYouRooms, availableSoon],
  );
  const { isFavorited, toggle } = useFavorites(allRoomIds);

  const checkScroll = (
    el: HTMLDivElement | null,
    setLeft: (val: boolean) => void,
    setRight: (val: boolean) => void,
  ) => {
    if (el) {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      setLeft(scrollLeft > 10);
      setRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  const handleScroll = (
    ref: React.RefObject<HTMLDivElement | null>,
    direction: "left" | "right",
  ) => {
    if (ref.current) {
      const { clientWidth } = ref.current;
      const scrollAmount =
        direction === "left" ? -clientWidth * 0.75 : clientWidth * 0.75;
      ref.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Scroll listeners setup
  useEffect(() => {
    const fyEl = forYouRef.current;
    const checkFy = () => checkScroll(fyEl, setForYouLeft, setForYouRight);

    if (fyEl) {
      fyEl.addEventListener("scroll", checkFy, { passive: true });
      checkFy();
    }
    return () => fyEl?.removeEventListener("scroll", checkFy);
  }, [forYouRooms]);

  useEffect(() => {
    const soonEl = soonRef.current;
    const checkSoon = () => checkScroll(soonEl, setSoonLeft, setSoonRight);

    if (soonEl) {
      soonEl.addEventListener("scroll", checkSoon, { passive: true });
      checkSoon();
    }
    return () => soonEl?.removeEventListener("scroll", checkSoon);
  }, [availableSoon]);

  // Window resize scroll checks
  useEffect(() => {
    const handleResize = () => {
      checkScroll(forYouRef.current, setForYouLeft, setForYouRight);
      checkScroll(soonRef.current, setSoonLeft, setSoonRight);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [forYouRooms, availableSoon]);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        setLoading(true);
        const [forYou, soon] = await Promise.all([
          user ? getForYouRooms(4).catch(() => []) : Promise.resolve([]),
          getAvailableSoonRooms(4).catch(() => []),
        ]);
        if (isMounted) {
          setForYouRooms(forYou);
          setAvailableSoon(soon);
          if (onRoomsLoaded) {
            onRoomsLoaded([...forYou, ...soon]);
          }
        }
      } catch (err) {
        console.error("Error fetching recommendations:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleToggleFavorite = async (e: React.MouseEvent, roomId: number) => {
    e.stopPropagation();
    if (!user) {
      openSignIn();
      return;
    }
    const result = await toggle(roomId);
    toast.success(result ? "Đã thêm vào yêu thích" : "Đã bỏ yêu thích");
  };

  if (loading || (forYouRooms.length === 0 && availableSoon.length === 0))
    return null;

  const formatPrice = (price: number) => `${price.toLocaleString()} VND`;

  const RoomMiniCard = ({ room }: { room: any }) => (
    <div
      className="group cursor-pointer shrink-0 w-36 sm:w-44 lg:w-50 snap-start"
      onClick={() => router.push(`/room/${room.id}`)}
    >
      <div className="relative aspect-4/3 overflow-hidden rounded-xl mb-2 bg-primary/5">
        <Image
          src={room.images?.main || room.image || "/default.jpg"}
          alt={room.name}
          fill
          sizes="200px"
          priority
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {room.status === "MAINTENANCE" && (
          <div className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-red-600 rounded-full z-10 shadow-md flex items-center justify-center text-center">
            <span className="text-[9px] font-extrabold text-white uppercase tracking-wider">
              Bảo trì
            </span>
          </div>
        )}
        {room.status !== "MAINTENANCE" && room.matchScore && (
          <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-purple-500/90 backdrop-blur-sm rounded-full">
            <span className="text-[9px] font-bold text-white">
              ✨ {room.matchScore}% phù hợp
            </span>
          </div>
        )}
        {room.status !== "MAINTENANCE" && room.boostTags?.length > 0 && (
          <div className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-orange-500/90 backdrop-blur-sm rounded-full flex items-center justify-center text-center">
            <span className="text-[9px] font-semibold text-white">
              {room.boostTags[0]}
            </span>
          </div>
        )}
        <button
          className={`absolute top-1.5 right-1.5 p-1.5 rounded-full backdrop-blur-sm transition-all duration-300 cursor-pointer ${
            isFavorited(room.id)
              ? "bg-white text-red-500"
              : "bg-black/20 text-white hover:bg-white hover:text-red-500"
          }`}
          onClick={(e) => handleToggleFavorite(e, room.id)}
        >
          <Heart
            size={12}
            className={isFavorited(room.id) ? "fill-red-500 text-red-500" : ""}
          />
        </button>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between items-start gap-1">
          <h3 className="font-semibold text-xs text-foreground truncate flex-1 group-hover:text-primary transition-colors">
            {room.name}
          </h3>
          <div className="flex items-center gap-0.5 shrink-0">
            <Star className="text-yellow-400 fill-current" size={10} />
            <span className="text-[10px] font-medium">{room.rating}</span>
          </div>
        </div>
        <p className="text-foreground/60 text-[10px] flex items-center gap-0.5">
          <MapPin size={9} className="shrink-0" />
          <span className="truncate">
            {room.location?.fullAddress || room.location?.province}
          </span>
        </p>
        <p className="font-bold text-xs pt-0.5">
          {formatPrice(room.price)}
          <span className="text-foreground/50 text-[10px] font-normal ml-0.5">
            /{t("night")}
          </span>
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 mb-6">
      {/* For You Section */}
      {forYouRooms.length > 0 && (
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-purple-500 animate-pulse" />
              <h3 className="font-semibold text-sm text-foreground">
                Dành riêng cho bạn
              </h3>
              <span className="text-[10px] text-foreground/50 hidden sm:inline">
                — Gợi ý dựa trên lịch sử đặt phòng
              </span>
            </div>

            {/* Scroll Navigation Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleScroll(forYouRef, "left")}
                disabled={!forYouLeft}
                className="p-1.5 rounded-full border border-border/60 bg-card text-foreground hover:text-primary hover:border-primary/30 transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none active:scale-95 shadow-2xs hover:shadow-sm flex items-center justify-center"
                aria-label="Scroll left"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => handleScroll(forYouRef, "right")}
                disabled={!forYouRight}
                className="p-1.5 rounded-full border border-border/60 bg-card text-foreground hover:text-primary hover:border-primary/30 transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none active:scale-95 shadow-2xs hover:shadow-sm flex items-center justify-center"
                aria-label="Scroll right"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div
            ref={forYouRef}
            className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory scroll-smooth w-full"
          >
            {forYouRooms.map((room: any) => (
              <RoomMiniCard key={`fy-${room.id}`} room={room} />
            ))}
          </div>
        </div>
      )}

      {/* Available Soon Section */}
      {availableSoon.length > 0 && (
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-orange-500 animate-bounce" />
              <h3 className="font-semibold text-sm text-foreground">
                Còn trống tuần này
              </h3>
              <span className="text-[10px] text-foreground/50 hidden sm:inline">
                — Đặt ngay kẻo hết
              </span>
            </div>

            {/* Scroll Navigation Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleScroll(soonRef, "left")}
                disabled={!soonLeft}
                className="p-1.5 rounded-full border border-border/60 bg-card text-foreground hover:text-primary hover:border-primary/30 transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none active:scale-95 shadow-2xs hover:shadow-sm flex items-center justify-center"
                aria-label="Scroll left"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => handleScroll(soonRef, "right")}
                disabled={!soonRight}
                className="p-1.5 rounded-full border border-border/60 bg-card text-foreground hover:text-primary hover:border-primary/30 transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none active:scale-95 shadow-2xs hover:shadow-sm flex items-center justify-center"
                aria-label="Scroll right"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div
            ref={soonRef}
            className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory scroll-smooth w-full"
          >
            {availableSoon.map((room: any) => (
              <RoomMiniCard key={`as-${room.id}`} room={room} />
            ))}
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-border" />
    </div>
  );
}
