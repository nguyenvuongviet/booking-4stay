"use client";

import { getRooms } from "@/services/roomApi";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface SimpleRoom {
  id: number;
  name: string;
  price: number;
  rating: number;
  images?: { main?: string };
  location?: { province?: string };
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

  useEffect(() => {
    (async () => {
      try {
        const data = await getRooms({ provinceId, page: 1, pageSize: 4 });
        setRooms(data.rooms || []);
      } catch (err) {
        console.error("Error fetching related rooms:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [provinceId]);

  if (loading || rooms.length === 0) return null;

  return (
    <section className="bg-card border border-border/60 rounded-2xl p-6 md:p-8 shadow-xs">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2 text-foreground">
            <MapPin size={20} className="text-primary" />
            Homestay 4Stay tại {provinceName}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Đặt phòng ngay để trải nghiệm du lịch {provinceName} trọn vẹn
          </p>
        </div>
        <Link
          href={`/room?provinceId=${provinceId}`}
          className="hidden md:flex items-center gap-1 text-sm text-primary hover:underline"
        >
          Xem tất cả
          <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {rooms.slice(0, 4).map((room) => (
          <motion.div
            key={room.id}
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Link href={`/room/${room.id}`}>
              <div className="bg-muted/30 border border-muted/50 rounded-xl overflow-hidden group cursor-pointer hover:shadow-xs transition-all duration-300">
                <div className="relative h-36 overflow-hidden">
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
                </div>
                <div className="p-3">
                  <h4 className="text-sm font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                    {room.name}
                  </h4>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-bold text-primary">
                      {room.price?.toLocaleString()} VND
                      <span className="text-xs font-normal text-muted-foreground">
                        /đêm
                      </span>
                    </span>
                    {room.rating > 0 && (
                      <span className="flex items-center gap-0.5 text-xs">
                        <Star
                          size={12}
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
        href={`/room?provinceId=${provinceId}`}
        className="md:hidden flex items-center justify-center gap-1 mt-4 text-sm text-primary hover:underline"
      >
        Xem tất cả homestay tại {provinceName}
        <ArrowRight size={14} />
      </Link>
    </section>
  );
}
