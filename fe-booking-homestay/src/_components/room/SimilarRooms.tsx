"use client";

import { useFavorites } from "@/_hooks/useFavorites";
import { useAuth } from "@/context/auth-context";
import { useLang } from "@/context/lang-context";
import { getSimilarRooms } from "@/services/recommendationApi";
import { Heart, MapPin, Sparkles, Star } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

interface Props {
  roomId: number;
}

export default function SimilarRooms({ roomId }: Props) {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { t } = useLang();
  const { user, openSignIn } = useAuth();
  const hasFetched = useRef(0);

  const roomIds = useMemo(() => rooms.map((r: any) => r.id), [rooms]);
  const { isFavorited, toggle } = useFavorites(roomIds);

  useEffect(() => {
    if (hasFetched.current === roomId) return;
    hasFetched.current = roomId;

    (async () => {
      setLoading(true);
      try {
        const data = await getSimilarRooms(roomId, 4);
        setRooms(data);
      } catch (err) {
        console.error("Error fetching similar rooms:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [roomId]);

  const handleToggleFavorite = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!user) {
      openSignIn();
      return;
    }
    const result = await toggle(id);
    toast.success(result ? "Đã thêm vào yêu thích" : "Đã bỏ yêu thích");
  };

  if (loading || rooms.length === 0) return null;

  const formatPrice = (price: number) => `${price.toLocaleString()} VND`;

  return (
    <div className="mt-12">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles size={20} className="text-primary" />
        <h2 className="text-xl elegant-heading">Phòng tương tự</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {rooms.map((room: any) => (
          <div
            key={room.id}
            className="group cursor-pointer bg-card border border-border/50 rounded-2xl p-2.5 shadow-2xs hover:shadow-md hover:border-primary/20 transition-all duration-300 flex flex-col justify-between"
            onClick={() => router.push(`/room/${room.id}`)}
          >
            <div>
              <div className="relative aspect-4/3 overflow-hidden rounded-xl mb-3">
                <Image
                  src={room.images?.main || "/default.jpg"}
                  alt={room.name}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
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
                <div className="flex justify-between items-start gap-1">
                  <h3 className="font-semibold text-sm text-foreground line-clamp-1">
                    {room.name}
                  </h3>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <Star className="text-yellow-400 fill-current" size={12} />
                    <span className="text-xs font-medium">{room.rating}</span>
                  </div>
                </div>
                <p className="text-muted-foreground text-[11px] flex items-center gap-1">
                  <MapPin size={10} />
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
  );
}
