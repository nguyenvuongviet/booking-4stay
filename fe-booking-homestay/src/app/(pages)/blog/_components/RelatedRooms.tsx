"use client";

import { getRooms } from "@/services/roomApi";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Star,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface SimpleRoom {
  id: number;
  name: string;
  price: number;
  rating: number;
  images?: { main?: string };
  location?: { province?: string };
  status?: string;
}

export function RelatedRooms({
  provinceId,
  provinceName,
}: {
  provinceId: number;
  provinceName: string;
}) {
  const [rooms, setRooms] = useState<SimpleRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const data = await getRooms({ provinceId, page: 1, pageSize: 30 });
        setRooms(data.rooms || []);
      } catch (err) {
        console.error("Error fetching related rooms:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [provinceId]);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll, { passive: true });
      checkScroll();
      window.addEventListener("resize", checkScroll);
    }
    return () => {
      if (el) {
        el.removeEventListener("scroll", checkScroll);
      }
      window.removeEventListener("resize", checkScroll);
    };
  }, [rooms]);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { clientWidth } = scrollContainerRef.current;
      const scrollAmount =
        direction === "left" ? -clientWidth * 0.75 : clientWidth * 0.75;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (loading || rooms.length === 0) return null;

  return (
    <section className="py-2">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-foreground">
            <MapPin size={22} className="text-primary animate-bounce" />
            Homestay 4Stay tại {provinceName}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Đặt phòng ngay để trải nghiệm du lịch {provinceName} trọn vẹn
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href={`/room?location=${encodeURIComponent(provinceName)}`}
            className="hidden md:flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary/80 transition-colors group"
          >
            <span>Xem tất cả</span>
            <ArrowRight
              size={14}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => handleScroll("left")}
              disabled={!canScrollLeft}
              className="p-2.5 rounded-full border border-border/60 bg-card text-foreground hover:text-primary hover:border-primary/30 transition-all duration-300 disabled:opacity-40 disabled:pointer-events-none cursor-pointer active:scale-95 shadow-2xs hover:shadow-md flex items-center justify-center"
              aria-label="Scroll left"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => handleScroll("right")}
              disabled={!canScrollRight}
              className="p-2.5 rounded-full border border-border/60 bg-card text-foreground hover:text-primary hover:border-primary/30 transition-all duration-300 disabled:opacity-40 disabled:pointer-events-none cursor-pointer active:scale-95 shadow-2xs hover:shadow-md flex items-center justify-center"
              aria-label="Scroll right"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide snap-x snap-mandatory scroll-smooth w-full"
      >
        {rooms.map((room) => (
          <motion.div
            key={room.id}
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="shrink-0 snap-start w-45 sm:w-55 md:w-[calc((100%-32px)/3)] lg:w-[calc((100%-48px)/4)]"
          >
            <Link href={`/room/${room.id}`} className="block h-full">
              <div className="bg-card border border-border/60 rounded-xl overflow-hidden group cursor-pointer hover:shadow-md hover:border-primary/20 transition-all duration-300 shadow-xs h-full flex flex-col justify-between">
                <div className="relative h-28 w-full overflow-hidden shrink-0">
                  {room.images?.main ? (
                    <Image
                      src={room.images.main}
                      alt={room.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-primary/10 to-accent/20" />
                  )}
                  {room.status === "MAINTENANCE" && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-red-600 rounded-full text-[9px] font-extrabold text-white uppercase tracking-wider shadow-md z-10 flex items-center justify-center text-center">
                      Bảo trì
                    </div>
                  )}
                </div>
                <div className="p-2.5 flex-1 flex flex-col justify-between min-h-17.5">
                  <h4 className="text-sm font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                    {room.name}
                  </h4>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/20">
                    <span className="text-xs font-bold text-primary truncate">
                      {room.price?.toLocaleString()} VND
                      <span className="text-[10px] font-normal text-muted-foreground ml-0.5">
                        /đêm
                      </span>
                    </span>
                    {room.rating > 0 && (
                      <span className="flex items-center gap-0.5 text-[10px] font-medium shrink-0 ml-1">
                        <Star
                          size={10}
                          className="fill-yellow-400 text-yellow-400"
                        />
                        {room.rating}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <Link
        href={`/room?location=${encodeURIComponent(provinceName)}`}
        className="md:hidden flex items-center justify-center gap-1.5 mt-5 py-2.5 rounded-xl border border-primary/20 text-sm font-bold text-primary hover:bg-primary/5 transition-all group"
      >
        <span>Xem tất cả homestay tại {provinceName}</span>
        <ArrowRight
          size={14}
          className="group-hover:translate-x-1 transition-transform"
        />
      </Link>
    </section>
  );
}
