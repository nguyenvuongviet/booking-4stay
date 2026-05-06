"use client";

import Footer from "@/_components/Footer";
import Header from "@/_components/Header";
import FeaturesSection from "@/_components/home/FeaturesSection";
import HeroSection from "@/_components/home/HeroSection";
import PopularDestinations from "@/_components/home/PopularDestinations";
import RoomSection from "@/_components/home/RoomSection";
import { useAuth } from "@/context/auth-context";
import { Room } from "@/models/Room";
import { getLocation } from "@/services/locationApi";
import { room_all } from "@/services/roomApi";
import { useCallback, useEffect, useState } from "react";

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

        setLocations(items);
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
      <HeroSection />
      <RoomSection rooms={rooms} />
      <PopularDestinations locations={locations} />
      <FeaturesSection />
      <Footer />
    </div>
  );
}
