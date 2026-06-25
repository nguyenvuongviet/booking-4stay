import { useAuth } from "@/context/auth-context";
import { useLang } from "@/context/lang-context";
import { Room } from "@/models/Room";
import { Heart, MapPin, Star } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

type RoomCardProps = {
  room: Room;
  isFavorited?: boolean;
  onToggleFavorite?: (roomId: number) => Promise<boolean> | void;
};

export function RoomCard({
  room,
  isFavorited = false,
  onToggleFavorite,
}: RoomCardProps) {
  const { t } = useLang();
  const { user, openSignIn } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const loc = searchParams.get("location");
  const ad = searchParams.get("adults");
  const ch = searchParams.get("children");
  const ci = searchParams.get("checkIn");
  const co = searchParams.get("checkOut");

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} VND`;
  };
  const query = new URLSearchParams({
    location: loc || "",
    ...(ci ? { checkIn: ci } : {}),
    ...(co ? { checkOut: co } : {}),
    adults: ad || "1",
    children: ch || "0",
  }).toString();

  const isGuestFavorite = room.rating ?? 0 >= 4.8;

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      openSignIn();
      return;
    }
    if (onToggleFavorite) {
      const result = await onToggleFavorite(room.id);
      toast.success(result ? "Đã thêm vào yêu thích" : "Đã bỏ yêu thích");
    }
  };

  return (
    <div
      onClick={() => {
        router.push(`/room/${room.id}?${query}&status=${room.status}`);
      }}
      className="group cursor-pointer space-y-3 bg-card border border-border/50 rounded-3xl p-3 shadow-2xs hover:shadow-md hover:border-primary/20 transition-all duration-300"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-secondary">
        <Image
          src={room.images?.main || "/default.jpg"}
          alt={room.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {room.status === "MAINTENANCE" && (
            <div className="bg-red-600 text-white text-[10px] font-extrabold px-3 py-1.5 rounded-full shadow-md uppercase tracking-wider flex items-center justify-center text-center">
              Bảo trì
            </div>
          )}
          {isGuestFavorite && (
            <div className="bg-white/90 backdrop-blur-md text-black text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm uppercase tracking-wider flex items-center justify-center text-center">
              Phổ biến
            </div>
          )}
          {room.status === "Sold out" && (
            <div className="bg-red-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm uppercase tracking-wider animate-pulse flex items-center justify-center text-center">
              {t("sold out")}
            </div>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-300 cursor-pointer ${
            isFavorited
              ? "bg-white text-red-500"
              : "bg-black/20 text-white hover:bg-white hover:text-red-500"
          }`}
        >
          <Heart
            size={18}
            className={isFavorited ? "fill-red-500 text-red-500" : ""}
          />
        </button>
      </div>

      {/* Info */}
      <div className="space-y-1">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-bold text-foreground text-base line-clamp-1 group-hover:text-primary transition-colors">
            {room.name}
          </h3>
          <div className="flex items-center gap-1 shrink-0">
            <Star className="text-yellow-400 fill-current" size={16} />
            <span className="text-sm font-medium">{room.rating}</span>
          </div>
        </div>

        <p className="text-foreground/60 text-sm flex items-center gap-1">
          <MapPin size={14} />
          <span className="line-clamp-1">
            {room.location.fullAddress || room.location.province}
          </span>
        </p>

        {/* <div className="flex items-center gap-2 mb-4 h-4">
          {(room.amenities || []).map((amenity) => (
            <div
              key={amenity.id}
              className="elegant-subheading text-foreground/60 flex items-center gap-1"
            >
              <span>{getAmenityIcon(amenity)}</span>
            </div>
          ))}
        </div> */}

        <div className="pt-2">
          <span className="font-bold text-base">{formatPrice(room.price)}</span>
          <span className="text-foreground/50 text-sm font-normal">
            /{t("night")}
          </span>
        </div>
      </div>
    </div>
  );
}
