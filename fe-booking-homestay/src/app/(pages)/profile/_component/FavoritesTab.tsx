"use client";

import { useLang } from "@/context/lang-context";
import { Room } from "@/models/Room";
import { getFavorites, toggleFavorite } from "@/services/favoriteApi";
import { Heart, Loader2, MapPin, Star } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

interface FavoriteRoom extends Room {
  favoriteId: number;
  favoritedAt: string;
}

export default function FavoritesTab() {
  const { t } = useLang();
  const router = useRouter();
  const [rooms, setRooms] = useState<FavoriteRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 6;

  const fetchFavorites = useCallback(async (pageNum: number) => {
    setLoading(true);
    try {
      const data = await getFavorites(pageNum, pageSize);
      setRooms(data.items as FavoriteRoom[]);
      setTotalPages(Math.ceil(data.total / pageSize) || 1);
    } catch (err) {
      console.error("Fetch favorites error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites(page);
  }, [page, fetchFavorites]);

  const handleRemoveFavorite = async (e: React.MouseEvent, roomId: number) => {
    e.stopPropagation();
    try {
      await toggleFavorite(roomId);
      setRooms((prev) => prev.filter((r) => r.id !== roomId));
      toast.success("Đã bỏ yêu thích");
    } catch (err) {
      console.error("Remove favorite error:", err);
      toast.error("Có lỗi xảy ra");
    }
  };

  const formatPrice = (price: number) => `${price.toLocaleString()} VND`;

  if (loading && rooms.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!loading && rooms.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-xs p-10 md:p-16 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center">
            <Heart className="w-8 h-8 md:w-10 md:h-10 text-red-500 fill-red-500/20 dark:text-red-400" />
          </div>
          <h3 className="text-lg md:text-xl font-bold text-foreground">
            Chưa có phòng yêu thích
          </h3>
          <p className="text-slate-500 text-xs md:text-sm max-w-sm">
            Bấm vào biểu tượng ❤️ trên các phòng bạn thích để lưu lại và xem lại
            ở đây.
          </p>
          <button
            onClick={() => router.push("/room")}
            className="mt-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-full font-medium hover:opacity-90 transition-opacity cursor-pointer text-sm shadow-xs"
          >
            Khám phá phòng
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-xs p-4 sm:p-5 md:p-6">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 fill-red-500" />
              Phòng yêu thích
            </h2>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">
              Danh sách các phòng bạn đã lưu
            </p>
          </div>
          <span className="text-[10px] sm:text-xs bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-full font-semibold text-slate-600 dark:text-slate-400 shrink-0">
            {rooms.length} phòng
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="group cursor-pointer bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-xs overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-1"
            onClick={() => router.push(`/room/${room.id}`)}
          >
            <div className="relative aspect-4/3 overflow-hidden">
              <Image
                src={room.images?.main || "/default.jpg"}
                alt={room.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {room.status === "MAINTENANCE" && (
                <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-red-600 text-white text-[10px] font-extrabold rounded-full shadow-md uppercase tracking-wider flex items-center justify-center text-center">
                  Bảo trì
                </div>
              )}
              <button
                onClick={(e) => handleRemoveFavorite(e, room.id)}
                className="absolute top-3 right-3 p-2 rounded-full bg-white/95 dark:bg-slate-950/95 text-red-500 shadow-md hover:scale-110 transition-transform cursor-pointer"
                title="Bỏ yêu thích"
              >
                <Heart size={14} className="fill-red-500" />
              </button>
            </div>

            <div className="p-3 sm:p-4 space-y-2">
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-bold text-foreground text-xs sm:text-sm line-clamp-1 group-hover:text-primary transition-colors">
                  {room.name}
                </h3>
                <div className="flex items-center gap-1 shrink-0 bg-amber-50 dark:bg-amber-950/30 px-1.5 py-0.5 rounded text-amber-700 dark:text-amber-400">
                  <Star className="fill-current" size={10} />
                  <span className="text-[10px] sm:text-[11px] font-bold">
                    {room.rating}
                  </span>
                </div>
              </div>

              <p className="text-slate-500 text-[10px] sm:text-xs flex items-center gap-1">
                <MapPin size={11} className="text-slate-400 shrink-0" />
                <span className="line-clamp-1">
                  {room.location?.fullAddress || room.location?.province}
                </span>
              </p>

              <div className="pt-2 border-t border-slate-50 dark:border-slate-800/60 flex items-baseline gap-1">
                <span className="font-bold text-xs sm:text-sm md:text-base text-primary">
                  {formatPrice(room.price)}
                </span>
                <span className="text-slate-500 text-[10px] sm:text-xs font-normal">
                  /{t("night")}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            ← Trước
          </button>
          <span className="text-[10px] sm:text-xs text-slate-500 px-2 sm:px-3">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            Tiếp →
          </button>
        </div>
      )}
    </div>
  );
}
