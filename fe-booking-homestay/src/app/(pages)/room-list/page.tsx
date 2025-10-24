"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { FilterBar } from "@/components/FilterBar";
import { RoomCard } from "@/components/RoomCard";
import { SearchBar } from "@/components/SearchBar";
import { Room } from "@/models/Room";
import { Car, Coffee, Dumbbell, Loader2, Wifi } from "lucide-react";
import { room_all } from "@/services/bookingApi";
import { useSearchParams } from "next/navigation";
import { search_room } from "@/services/bookingApi";
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

  const getRoomImage = (url?: string) => url || "/images/da-nang.jpg";

  //Reset lại rooms khi thay đổi search params
  useEffect(() => {
    setRooms([]);
    setPage(1);
    setHasMore(true);
  }, [location, adults, children]);
  
  // load data
  useEffect(() => {
    const loadRooms = async () => {
      try {
        setLoading(true);
        let result;
        let roomsData: any[] = [];
        let totalPages = 1;

        if (location) {
          // 🔍 Có location → tìm kiếm theo địa điểm
          result = await search_room(location, adults, children);
          roomsData = result?.data?.data || result?.data || [];
          totalPages = 1; // tìm kiếm 1 lần duy nhất, không phân trang
        } else {
          // 🏨 Không có location → lấy tất cả (có phân trang)
          result = await room_all({ page, pageSize: 6 });
          roomsData = result?.rooms  || [];
          totalPages = result?.totalPages || 1;
        }

        if (!roomsData.length || page > totalPages) {
          setHasMore(false);
          return;
        }

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
          image: getRoomImage(room.images?.main),
          images: room.images,
          amenities: room.amenities?.map((a: any) => a.name) || [],
        }));

        // ⛓️ Nếu là page=1 (tìm kiếm mới) thì thay hoàn toàn danh sách
        setRooms((prev) => (page === 1 ? mappedRooms : [...prev, ...mappedRooms]));

        if (page >= totalPages) setHasMore(false);
      } catch (err) {
        console.error("Error loading rooms:", err);
      } finally {
        setLoading(false);
      }
    };

    loadRooms();
  }, [page, location, adults, children]);

  // Infinite scroll
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
        <FilterBar />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ">
          {rooms.map((room, index) => (
            <RoomCard key={`${room.id}-${index}`} room={room} />
          ))}
        </div>
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-sm">Loading more hotels...</span>
            </div>
          </div>
        )}

        {!hasMore && !loading && (
          <div className="flex items-center justify-center py-1">
            <div className="text-center text-muted-foreground ">
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
