"use client";

import { useFavorites } from "@/_hooks/useFavorites";
import { useAuth } from "@/context/auth-context";
import { useLang } from "@/context/lang-context";
import {
  getAvailableSoonRooms,
  getForYouRooms,
} from "@/services/recommendationApi";
import { Heart, MapPin, Sparkles, Star, Zap } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

export default function RoomListRecommendations() {
  const { user, openSignIn } = useAuth();
  const { t } = useLang();
  const router = useRouter();
  const hasFetched = useRef(false);

  const [forYouRooms, setForYouRooms] = useState<any[]>([]);
  const [availableSoon, setAvailableSoon] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const allRoomIds = useMemo(
    () => [...forYouRooms, ...availableSoon].map((r) => r.id),
    [forYouRooms, availableSoon],
  );
  const { isFavorited, toggle } = useFavorites(allRoomIds);

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
      className="group cursor-pointer shrink-0 w-[220px] sm:w-[240px]"
      onClick={() => router.push(`/room/${room.id}`)}
    >
      <div className="relative aspect-4/3 overflow-hidden rounded-xl mb-2">
        <Image
          src={room.images?.main || room.image || "/default.jpg"}
          alt={room.name}
          fill
          sizes="240px"
          priority
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {room.matchScore && (
          <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-purple-500/90 backdrop-blur-sm rounded-full">
            <span className="text-[9px] font-bold text-white">
              ✨ {room.matchScore}% phù hợp
            </span>
          </div>
        )}
        {room.boostTags?.length > 0 && (
          <div className="absolute top-1.5 left-1.5">
            <span className="px-2 py-0.5 bg-orange-500/90 backdrop-blur-sm rounded-full text-[9px] font-semibold text-white">
              {room.boostTags[0]}
            </span>
          </div>
        )}
        <button
          className={`absolute top-1.5 right-1.5 p-1.5 rounded-full backdrop-blur-sm transition-all duration-300 ${
            isFavorited(room.id)
              ? "bg-white text-red-500"
              : "bg-black/20 text-white hover:bg-white hover:text-red-500"
          }`}
          onClick={(e) => handleToggleFavorite(e, room.id)}
        >
          <Heart
            size={12}
            className={
              isFavorited(room.id) ? "fill-red-500 text-red-500" : ""
            }
          />
        </button>
      </div>
      <div className="space-y-0.5">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-xs text-foreground line-clamp-1 flex-1">
            {room.name}
          </h3>
          <div className="flex items-center gap-0.5 shrink-0 ml-1">
            <Star className="text-yellow-400 fill-current" size={10} />
            <span className="text-[10px] font-medium">{room.rating}</span>
          </div>
        </div>
        <p className="text-muted-foreground text-[10px] flex items-center gap-0.5 line-clamp-1">
          <MapPin size={9} />
          {room.location?.fullAddress || room.location?.province}
        </p>
        <p className="font-bold text-xs">
          {formatPrice(room.price)}
          <span className="text-muted-foreground text-[10px] font-normal">
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
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-purple-500" />
            <h3 className="font-semibold text-sm text-foreground">
              Dành riêng cho bạn
            </h3>
            <span className="text-[10px] text-muted-foreground">
              — Gợi ý dựa trên lịch sử đặt phòng
            </span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {forYouRooms.map((room: any) => (
              <RoomMiniCard key={`fy-${room.id}`} room={room} />
            ))}
          </div>
        </div>
      )}

      {/* Available Soon Section */}
      {availableSoon.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap size={16} className="text-orange-500" />
            <h3 className="font-semibold text-sm text-foreground">
              Còn trống tuần này
            </h3>
            <span className="text-[10px] text-muted-foreground">
              — Đặt ngay kẻo hết
            </span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
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
