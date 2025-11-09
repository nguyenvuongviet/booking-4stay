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
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";

export default function HotelsListPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const location = searchParams.get("location") || "";
  const adults = Number(searchParams.get("adults")) || 1;
  const children = Number(searchParams.get("children")) || 0;
  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";
  const [available, setAvailable] = useState<boolean | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);
  const [filters, setFilters] = useState<{
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    sortOrder?: "asc" | "desc";
  }>({});

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

  // loadRooms();
  // }, [page, location, adults, children, checkIn, checkOut]);
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
      if (scrollTop + clientHeight >= scrollHeight - 200) {
        setPage((prev) => prev + 1);
      }

      setScrolled(scrollTop > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore]);

  const handleSort = (order: "asc" | "desc") => {
    setSortOrder(order);
    setPage(1);
    setRooms([]);
    setHasMore(true);
  };

  // const handleSort = async (order: "asc" | "desc") => {
  //   try {
  //     setLoading(true);
  //     const res = await sort_price("price");
  //     const sortedRooms = res?.items || res?.data?.items || [];
  //     console.log("Sort API response:", res);

  //     const mappedRooms: Room[] = sortedRooms.map((room: any) => ({
  //       id: room.id,
  //       name: room.name,
  //       description: room.description,
  //       price: room.price,
  //       adultCapacity: room.adultCapacity,
  //       childCapacity: room.childCapacity,
  //       location: {
  //         id: room.location?.id,
  //         fullAddress: room.location?.fullAddress,
  //         province: room.location?.province,
  //       },
  //       rating: room.rating || 0,
  //       reviewCount: room.reviewCount || 0,
  //       image: room.images?.main,
  //       amenities: room.amenities?.map((a: any) => a.name) || [],
  //       status: "Available",
  //     }));

  //     const finalRooms =
  //       order === "asc" ? [...mappedRooms].reverse() : mappedRooms;

  //     setRooms(finalRooms);
  //     setHasMore(false); // Dừng load thêm khi sort xong
  //   } catch (err) {
  //     console.error("Error sorting rooms:", err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* <AnimatePresence>
        {!scrolled && (
          <motion.div
            key="header"
            initial={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed top-0 left-0 w-full z-40"
          >
            <Header />
          </motion.div>
        )}
      </AnimatePresence> */}

      {/* SearchBar: trượt lên khi scroll */}
      {/* <motion.div
        key="searchbar"
        initial={false}
        animate={{
          y: scrolled ? 0 : 80,
          boxShadow: scrolled
            ? "0px 4px 12px rgba(0,0,0,0.1)"
            : "0px 0px 0px rgba(0,0,0,0)",
        }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="fixed top-0 left-0 w-full z-30 bg-background"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SearchBar />
        </div>
      </motion.div> */}
      <main className="max-w-7xl container mx-auto py-12 space-y-12 pt-20 px-4 sm:px-6 lg:px-8">
        <SearchBar />
        <FilterBar onFilterChange={handleFilterChange} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ">
          {rooms.map((room, index) => (
            <RoomCard key={`${room.id}-${index}`} room={room} />
          ))}
        </div>
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3 text-muted">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-sm">Loading more hotels...</span>
            </div>
          </div>
        )}

        {!hasMore && !loading && (
          <div className="flex items-center justify-center py-1">
            <div className="text-center text-muted">
              <p className="text-sm ">
                You{"'"}ve reached the end of the results
              </p>
              <p className="text-xs mt-1">Total: {rooms.length} hotels found</p>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
