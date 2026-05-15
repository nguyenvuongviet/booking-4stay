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
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-border dark:border-slate-800 shadow-xl p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
            <Heart className="w-10 h-10 text-red-300 dark:text-red-700" />
          </div>
          <h3 className="text-xl font-bold text-foreground">
            Chưa có phòng yêu thích
          </h3>
          <p className="text-muted-foreground text-sm max-w-md">
            Bấm vào biểu tượng ❤️ trên các phòng bạn thích để lưu lại và xem lại
            ở đây.
          </p>
          <button
            onClick={() => router.push("/room")}
            className="mt-4 px-6 py-2.5 bg-primary text-primary-foreground rounded-full font-medium hover:opacity-90 transition-opacity"
          >
            Khám phá phòng
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-border dark:border-slate-800 shadow-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500 fill-red-500" />
              Phòng yêu thích
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Danh sách các phòng bạn đã lưu
            </p>
          </div>
          <span className="text-sm text-muted-foreground">
            {rooms.length} phòng
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="group cursor-pointer bg-white dark:bg-slate-900 rounded-2xl border border-border dark:border-slate-800 shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            onClick={() => router.push(`/room/${room.id}`)}
          >
            <div className="relative aspect-4/3 overflow-hidden">
              <Image
                src={room.images?.main || "/default.jpg"}
                alt={room.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <button
                onClick={(e) => handleRemoveFavorite(e, room.id)}
                className="absolute top-3 right-3 p-2 rounded-full bg-white text-red-500 shadow-md hover:scale-110 transition-transform"
                title="Bỏ yêu thích"
              >
                <Heart size={16} className="fill-red-500" />
              </button>
            </div>

            <div className="p-4 space-y-2">
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-bold text-foreground text-sm line-clamp-1 group-hover:text-primary transition-colors">
                  {room.name}
                </h3>
                <div className="flex items-center gap-1 shrink-0">
                  <Star className="text-yellow-400 fill-current" size={14} />
                  <span className="text-xs font-medium">{room.rating}</span>
                </div>
              </div>

              <p className="text-muted-foreground text-xs flex items-center gap-1">
                <MapPin size={12} />
                <span className="line-clamp-1">
                  {room.location?.fullAddress || room.location?.province}
                </span>
              </p>

              <div className="pt-1 border-t border-border/50">
                <span className="font-bold text-sm">
                  {formatPrice(room.price)}
                </span>
                <span className="text-muted-foreground text-xs font-normal">
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
            className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ← Trước
          </button>
          <span className="text-sm text-muted-foreground px-3">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Tiếp →
          </button>
        </div>
      )}
    </div>
  );
}
