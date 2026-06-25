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
import { PopularDestination } from "@/models/Destination";
import { getPopularDestinations } from "@/services/locationApi";
import { getPopularRooms, PopularRoom } from "@/services/recommendationApi";
import { Suspense, useEffect, useState } from "react";

export default function HomePage() {
  const [rooms, setRooms] = useState<PopularRoom[]>([]);
  const [popularLocations, setPopularLocations] = useState<
    PopularDestination[]
  >([]);
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
        const data = await getPopularDestinations(6);
        setPopularLocations(data);
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

      <SearchBar stickyType="home" />

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
      <PopularDestinations locations={popularLocations} />
      {/* <FeaturesSection /> */}
      <Footer />
    </div>
  );
}
