import { useLang } from "@/context/lang-context";
import { Room } from "@/models/Room";
import { Heart, MapPin, Star } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

type RoomCardProps = { room: Room };

export function RoomCard({ room }: RoomCardProps) {
  const { t } = useLang();
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

  return (
    <div
      onClick={() => {
        router.push(`/room/${room.id}?${query}&status=${room.status}`);
      }}
      className="group cursor-pointer space-y-3"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-secondary">
        <Image
          src={room.images?.main || "/default.jpg"}
          alt={room.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isGuestFavorite && (
            <div className="bg-white/90 backdrop-blur-md text-black text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm uppercase tracking-wider">
              Phổ biến
            </div>
          )}
          {room.status === "Sold out" && (
            <div className="bg-red-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm uppercase tracking-wider animate-pulse">
              {t("sold out")}
            </div>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            // Wishlist logic here
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-white hover:text-red-500 transition-all duration-300"
        >
          <Heart size={18} />
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

        <p className="text-muted-foreground text-sm flex items-center gap-1">
          <MapPin size={14} />
          <span className="line-clamp-1">
            {room.location.fullAddress || room.location.province}
          </span>
        </p>

        {/* <div className="flex items-center gap-2 mb-4 h-4">
          {(room.amenities || []).map((amenity) => (
            <div
              key={amenity.id}
              className="elegant-subheading text-muted-foreground flex items-center gap-1"
            >
              <span>{getAmenityIcon(amenity)}</span>
            </div>
          ))}
        </div> */}

        <div className="pt-2">
          <span className="font-bold text-base">{formatPrice(room.price)}</span>
          <span className="text-muted-foreground text-sm font-normal">
            /{t("night")}
          </span>
        </div>
      </div>
    </div>
  );
}
