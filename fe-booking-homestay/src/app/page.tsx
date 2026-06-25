"use client";

import Footer from "@/_components/Footer";
import Header from "@/_components/Header";
import { SearchBar } from "@/_components/SearchBar";
import AvailableSoonSection from "@/_components/home/AvailableSoonSection";
import CheckinCountdown from "@/_components/home/CheckinCountdown";
import ForYouSection from "@/_components/home/ForYouSection";
import HeroSection from "@/_components/home/HeroSection";
import PopularDestinations from "@/_components/home/PopularDestinations";
import RecentlyViewedSection from "@/_components/home/RecentlyViewedSection";
import RoomSection from "@/_components/home/RoomSection";
import { getLocation } from "@/services/locationApi";
import { getPopularRooms, PopularRoom } from "@/services/recommendationApi";
import { Suspense, useEffect, useState } from "react";

export default function HomePage() {
  const [rooms, setRooms] = useState<PopularRoom[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch popular rooms từ recommendation API
    const fetchPopular = async () => {
      setLoading(true);
      try {
        const data = await getPopularRooms(6);
        setRooms(data);
      } catch (err) {
        console.error("Error loading popular rooms:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchLocations = async () => {
      try {
        const resp = await getLocation({ pageSize: 1000 });
        const items = resp.items || [];

        const popularProvinces = [
          "Đà Nẵng",
          "Hà Nội",
          "Hồ Chí Minh",
          "Hội An",
          "Phú Quốc",
          "Đà Lạt",
          "Nha Trang",
        ];

        const sortedLocations = items.sort((a: any, b: any) => {
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

    fetchPopular();
    fetchLocations();
  }, []);

  return (
    <div className="min-h-screen bg-background relative">
      <Header />

      <Suspense
        fallback={
          <div className="h-20 w-full animate-pulse bg-slate-100 dark:bg-slate-800" />
        }
      >
        <SearchBar stickyType="home" />
      </Suspense>

      <Suspense
        fallback={<div className="h-screen bg-black/20 animate-pulse" />}
      >
        <HeroSection />
      </Suspense>
      <CheckinCountdown />
      <RecentlyViewedSection />
      <RoomSection rooms={rooms as any} />
      <ForYouSection />
      <AvailableSoonSection />
      <PopularDestinations locations={locations} />
      {/* <FeaturesSection /> */}
      <Footer />
    </div>
  );
}
