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
      className="group rounded-2xl border shadow-sm overflow-hidden bg-card transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 hover:scale-[1.01] cursor-pointer flex flex-col"
    >
      <div className="relative w-full h-72 bg-muted/20">
        {room.images?.main ? (
          <Image
            src={room.images.main}
            alt={room.name}
            width={600}
            height={400}
            className="w-full h-full object-cover"
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
            className={`absolute top-4 left-4 backdrop-blur-xl px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm shadow-black/10 text-xs font-semibold ${
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

        <div className="absolute top-4 right-4 bg-background/70 backdrop-blur-xl px-2 py-1 rounded-full flex items-center gap-1 shadow-sm shadow-black/10">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span className="text-sm font-medium">{room.rating ?? 0}</span>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-foreground truncate mb-3">
          {room.name}
        </h3>

        <p className="text-muted-foreground flex items-center gap-1 text-sm mb-3 line-clamp-2">
          <MapPin size={16} className="text-primary" />
          {room.location.fullAddress}
        </p>

        <div className="mt-auto flex justify-between">
          <div>
            <span className="text-xl font-bold text-foreground">
              {room.price.toLocaleString()}₫
            </span>
            <span className="ml-1 text-muted-foreground text-sm">/đêm</span>
          </div>
          <button
            onClick={handleDeleteClick}
            className="bottom-3 right-3 p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-200 transition-all flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-sm font-medium">Xóa</span>
          </button>
        </div>
      </div>
    </div>
  );
}
