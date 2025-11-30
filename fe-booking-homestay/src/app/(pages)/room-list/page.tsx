"use client";

import { FilterBar } from "@/components/FilterBar";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { RoomCard } from "@/components/rooms/RoomCard";
import { SearchBar } from "@/components/SearchBar";
import { Room } from "@/models/Room";
import {
  room_all,
  room_available,
  search_room,
  sort_price,
} from "@/services/roomApi";
import HoverScale from "@/styles/animations/HoverScale";
import StaggerItem from "@/styles/animations/StaggerItem";
import { motion, useSpring } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { mockRooms } from "@/constants/la-lo";

export default function HotelsListPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [scrolled, setScrolled] = useState(false);
  const searchParams = useSearchParams();
  const location = searchParams.get("location") || "";
  const adults = Number(searchParams.get("adults")) || 1;
  const children = Number(searchParams.get("children")) || 0;
  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);
  const [filters, setFilters] = useState<{
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    sortOrder?: "asc" | "desc";
  }>({});
  const y = useSpring(scrolled ? -20 : 0, { stiffness: 120, damping: 25 });
  const scale = useSpring(scrolled ? 0.9 : 1, { stiffness: 120, damping: 25 });
  const MapRooms = dynamic(() => import("@/components/rooms/MapRoom"), {
    ssr: false,
  });

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setPage(1);
    loadRooms(1, false, newFilters);
  };

  const getRoomImage = (url?: string) => url;

  //Reset lại rooms khi thay đổi search params
  // useEffect(() => {
  //   setRooms([]);
  //   setPage(1);
  //   setHasMore(true);
  // }, [location, adults, children]);

  // load data
  const loadRooms = async (
    page = 1,
    append = false,
    appliedFilters = filters
  ) => {
    try {
      setLoading(true);

      let result;
      let roomsData: any[] = [];
      let totalPages = 1;

      // Gọi API
      if (location) {
        result = await search_room(location, adults, children, page, 6);
        roomsData = result?.rooms || [];
        totalPages = Math.ceil(result?.total / 6);
      } else if (
        filters &&
        (filters.sortOrder || filters.minPrice || filters.minRating)
      ) {
        result = await sort_price({
          sortOrder: filters.sortOrder,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          minRating: filters.minRating,
          page,
          pageSize: 6,
        });
        roomsData = result?.data?.items || result?.items || [];
        totalPages = Math.ceil(result?.data?.total / 6 || result?.total / 6);
      } else {
        result = await room_all({ page, pageSize: 6 });
        roomsData = result?.rooms || [];
        totalPages = Math.ceil(result?.total / 6);
      }

      if (!roomsData.length || page > totalPages) {
        setHasMore(false);
        return;
      }

      // Map dữ liệu cơ bản
      const mappedRooms: Room[] = roomsData.map((room: any) => ({
        id: room.id,
        name: room.name,
        description: room.description,
        price: room.price,
        adultCapacity: room.adultCapacity,
        childCapacity: room.childCapacity,
        location: {
          id: room.location?.id,
          fullAddress: room.location?.fullAddress,
          province: room.location?.province,
          latitude: room.location?.latitude,
          longitude: room.location?.longitude,
        },
        rating: room.rating || 0,
        reviewCount: room.reviewCount || 0,
        image: getRoomImage(room.images?.main),
        images: room.images,
        amenities: room.amenities?.map((a: any) => a.name) || [],
        status: "Available",
      }));

      let finalRooms = mappedRooms;

      // Kiểm tra availability nếu có ngày checkIn/checkOut
      if (checkIn && checkOut) {
        try {
          const availabilityResults = await Promise.all(
            roomsData.map((room) =>
              room_available(room.id, checkIn, checkOut)
                .then((res) => ({
                  id: room.id,
                  available: res.available ?? false,
                }))
                .catch(() => ({ id: room.id, available: false }))
            )
          );

          finalRooms = mappedRooms.map((room) => {
            const found = availabilityResults.find((r) => r.id === room.id);
            return {
              ...room,
              status: found?.available ? "Available" : "Sold out",
            };
          });
        } catch (error) {
          console.error("Error checking availability:", error);
        }
      }

      setRooms((prev) => (page === 1 ? finalRooms : [...prev, ...finalRooms]));
      // if (page >= totalPages) setHasMore(false);
      setHasMore(page < totalPages);
    } catch (err) {
      console.error("Error loading rooms:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms(page, page > 1);
  }, [page, location, adults, children, filters]);

  useEffect(() => {
    const handleScroll = () => {
      if (loading || !hasMore) return;

      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;

      // Khi gần chạm đáy, gọi thêm trang mới
      if (scrollTop + clientHeight >= scrollHeight - 1000) {
        setPage((prev) => prev + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;

      if (scrollTop < 50) {
        setScrolled(false); // full
        y.set(0);
        scale.set(1);
      } else {
        setScrolled(true); // mini
        y.set(-20);
        scale.set(0.9);
      }
    };

    const onScroll = () => requestAnimationFrame(handleScroll);

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [y, scale]);

  const handleSort = (order: "asc" | "desc") => {
    setSortOrder(order);
    setPage(1);
    setRooms([]);
    setHasMore(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-9xl container mx-auto space-y-12 mb:pt-36 sm:pt-40 px-3 pb-10 sm:px-4 md:px-6 lg:px-8">
        <motion.div
          layoutId="search-bar"
          className={`
            fixed left-1/2 -translate-x-1/2 z-50 
            w-[95%] sm:w-full max-w-4xl 
            transition-all duration-300
            ${scrolled ? "top-0 scale-90" : "top-20 scale-100"}
          `}
          transition={{ layout: { duration: 0.35, ease: "easeInOut" } }}
        >
          <SearchBar compact={scrolled} />
        </motion.div>
        <FilterBar onFilterChange={handleFilterChange} />
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Map */}
          <div
            className="w-full lg:w-1/4 
            h-50 lg:h-120
            sticky lg:top-24 
            rounded-lg overflow-hidden shadow-md"
          >
            <MapRooms rooms={mockRooms} height="h-120" />
          </div>
          <div className="w-full lg:w-3/4 mt-4 lg:mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 mb-6">
              {rooms.map((room, index) => (
                <StaggerItem index={index} key={`${room.id}-${index}`}>
                  <HoverScale>
                    <RoomCard room={room} />
                  </HoverScale>
                </StaggerItem>
              ))}
            </div>
            {loading && (
              <div className="flex items-center justify-center py-6">
                <div className="flex items-center gap-3 text-muted">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="text-sm">Loading more hotels...</span>
                </div>
              </div>
            )}

            {!hasMore && !loading && (
              <div className="flex items-center justify-center py-2">
                <div className="text-center text-muted">
                  <p className="text-sm ">
                    You{"'"}ve reached the end of the results
                  </p>
                  <p className="text-xs mt-1">
                    Total: {rooms.length} hotels found
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
