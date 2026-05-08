"use client";

import Footer from "@/_components/Footer";
import Header from "@/_components/Header";
import HeroSection from "@/_components/home/HeroSection";
import PopularDestinations from "@/_components/home/PopularDestinations";
import RoomSection from "@/_components/home/RoomSection";
import { useAuth } from "@/context/auth-context";
import { Room } from "@/models/Room";
import { getLocation } from "@/services/locationApi";
import { room_all } from "@/services/roomApi";
import { Suspense, useCallback, useEffect, useState } from "react";

export default function HomePage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [page, setPage] = useState(1);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadRooms = useCallback(
    async (reset = false) => {
      if (loading) return;
      try {
        setLoading(true);
        const result = await room_all({
          page: reset ? 1 : page,
          pageSize: 6,
          sortBy: "rating",
          sortOrder: "desc", // explicit popular
        });

        const roomsData = result.rooms || [];

        if (reset) {
          setRooms(roomsData);
          setPage(2);
        } else {
          setRooms((prev) => [...prev, ...roomsData]);
          setPage((prev) => prev + 1);
        }

        setHasMore(roomsData.length > 0);
      } catch (err) {
        console.error("Error loading rooms:", err);
      } finally {
        setLoading(false);
      }
    },
    [page, loading],
  );

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const resp = await getLocation({ pageSize: 1000 });
        const items = resp.items || [];

        // Popular provinces in Vietnam
        const popularProvinces = [
          "Đà Nẵng",
          "Hà Nội",
          "Hồ Chí Minh",
          "Hội An",
          "Phú Quốc",
          "Đà Lạt",
          "Nha Trang",
        ];

        // Sort: popular first, then others
        const sortedLocations = items.sort((a, b) => {
          const aIndex = popularProvinces.indexOf(a.name);
          const bIndex = popularProvinces.indexOf(b.name);

          if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
          if (aIndex !== -1) return -1;
          if (bIndex !== -1) return 1;
          return 0;
        });

        setLocations(sortedLocations);
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    };
    fetchLocations();
    loadRooms(true);
  }, []);

  return (
    <div className="min-h-screen bg-background ">
      <Header />
      <Suspense
        fallback={<div className="h-screen bg-black/20 animate-pulse" />}
      >
        <HeroSection />
      </Suspense>
      <RoomSection rooms={rooms} />
      <PopularDestinations locations={locations} />
      {/* <FeaturesSection /> */}
      <Footer />
    </div>
  );
}
