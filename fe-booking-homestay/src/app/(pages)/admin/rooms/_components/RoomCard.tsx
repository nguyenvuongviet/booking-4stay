"use client";

import { Image as ImageIcon, MapPin, Star, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export function RoomCard({ room, onDelete }: any) {
  const router = useRouter();

  const handleDeleteClick = (e: any) => {
    e.stopPropagation();
    onDelete(room.id);
  };

  return (
    <div
      onClick={() => router.push(`/admin/rooms/${room.id}`)}
      className="group rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs overflow-hidden bg-card transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer flex flex-col"
    >
      <div className="relative w-full h-48 sm:h-56 md:h-64 lg:h-72 bg-muted/20">
        {room.images?.main ? (
          <Image
            src={room.images.main}
            alt={room.name}
            width={600}
            height={400}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
          />
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground">
            <div className="bg-muted/40 p-3 rounded-full">
              <ImageIcon className="w-8 h-8" />
            </div>
            <p className="text-xs opacity-70 mt-2">Chưa có ảnh</p>
          </div>
        )}

        {room.status && (
          <div
            className={`absolute top-3 left-3 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-xs text-[10px] sm:text-xs font-semibold ${
              room.status === "MAINTENANCE"
                ? "bg-red-500/80 text-white"
                : room.status === "BOOKED"
                  ? "bg-amber-500/80 text-white"
                  : "bg-emerald-500/80 text-white"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                room.status === "MAINTENANCE"
                  ? "bg-red-200 animate-pulse"
                  : room.status === "BOOKED"
                    ? "bg-amber-200 animate-pulse"
                    : "bg-emerald-200 animate-pulse"
              }`}
            />
            {room.status === "MAINTENANCE" && "Đang khóa"}
            {room.status === "BOOKED" && "Đang đặt"}
            {room.status === "AVAILABLE" && "Sẵn sàng"}
          </div>
        )}

        <div className="absolute top-3 right-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-2 py-0.5 sm:py-1 rounded-full flex items-center gap-1 shadow-xs border border-slate-200/50 dark:border-slate-800/40">
          <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
          <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
            {room.rating ?? 0}
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-5 flex flex-col flex-1">
        <h3 className="text-sm sm:text-base md:text-lg font-bold text-slate-800 dark:text-slate-100 truncate mb-1.5 group-hover:text-primary transition-colors">
          {room.name}
        </h3>

        <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1 text-xs sm:text-sm mb-4 line-clamp-1">
          <MapPin size={14} className="text-primary shrink-0" />
          <span className="truncate">
            {room.location?.fullAddress || "Chưa cập nhật địa chỉ"}
          </span>
        </p>

        <div className="mt-auto flex justify-between items-center pt-2.5 border-t border-slate-100 dark:border-slate-800/40">
          <div>
            <span className="text-base sm:text-lg font-extrabold text-slate-850 dark:text-slate-200">
              {room.price?.toLocaleString()}₫
            </span>
            <span className="ml-0.5 text-slate-400 dark:text-slate-500 text-[10px] sm:text-xs">
              /đêm
            </span>
          </div>
          <button
            onClick={handleDeleteClick}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/40 border border-red-100/50 dark:border-red-900/30"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
