"use client";

import { FilterBar } from "@/_components/FilterBar";
import Footer from "@/_components/Footer";
import Header from "@/_components/Header";
import { MapMarker } from "@/_components/map/MapMarker";
import { SearchBar } from "@/_components/SearchBar";
import WeatherBadge from "@/_components/WeatherBadge";
import { RoomCard } from "@/app/(pages)/room/_component/RoomCard";
import { useLang } from "@/context/lang-context";
import { Room } from "@/models/Room";
import { searchProvince } from "@/services/locationApi";
import { getRooms, room_available } from "@/services/roomApi";
import HoverScale from "@/styles/animations/HoverScale";
import StaggerItem from "@/styles/animations/StaggerItem";
import { motion, useSpring } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function RoomsListPage() {
  const [rawRooms, setRawRooms] = useState<Room[]>([]);
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
  const [filters, setFilters] = useState<{
    priceRanges?: string[];
    minRating?: number;
    sortOrder?: "asc" | "desc";
  }>({});
  const y = useSpring(scrolled ? -20 : 0, { stiffness: 120, damping: 25 });
  const scale = useSpring(scrolled ? 0.9 : 1, { stiffness: 120, damping: 25 });

  const [fallbackCenter, setFallbackCenter] = useState<[number, number] | null>(
    null,
  );
  const buildParams = (pageParam: number) => {
    return {
      search: location || undefined,
      adults,
      children,
      page: pageParam,
      pageSize: 6,
    };
  };

  const latestRequestRef = useRef(0);
  const { t } = useLang();

  const isFetchingRef = useRef(false);

  const loadRooms = async (pageParam = 1) => {
    if (isFetchingRef.current) return;

    const requestId = Date.now();
    latestRequestRef.current = requestId;
    isFetchingRef.current = true;

    try {
      setLoading(true);

      let roomsData: any[] = [];
      let totalPages = 1;

      const result = await getRooms(buildParams(pageParam));
      roomsData = result?.rooms || [];
      totalPages = Math.ceil((result?.total || 0) / 6);

      if (latestRequestRef.current !== requestId) return;

      if (!roomsData.length) {
        if (pageParam === 1) setRooms([]);
        setHasMore(false);
        return;
      }

      //map data từ API về đúng format của Room, đồng thời check availability nếu có checkIn/checkOut
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
        image: room.images?.main || "/default.jpg",
        images: room.images,
        amenities: room.amenities?.map((a: any) => a.name) || [],
        status: "Available",
      }));

      let finalRooms = mappedRooms;

      // Kiểm tra availability nếu có ngày checkIn/checkOut
      if (checkIn && checkOut) {
        const availabilityResults = await Promise.all(
          mappedRooms.map((room) =>
            room_available(room.id, checkIn, checkOut)
              .then((res) => ({
                id: room.id,
                available: res.available ?? false,
              }))
              .catch(() => ({ id: room.id, available: false })),
          ),
        );

        finalRooms = mappedRooms.map((room) => {
          const found = availabilityResults.find((r) => r.id === room.id);
          return {
            ...room,
            status: found?.available ? "Available" : "Sold out",
          };
        });
      }

      setRawRooms((prev) => {
        const merged = pageParam === 1 ? finalRooms : [...prev, ...finalRooms];

        return merged.filter(
          (r, i, arr) => i === arr.findIndex((x) => x.id === r.id),
        );
      });

      setHasMore(pageParam < totalPages);
    } catch (err) {
      console.error("Error loading rooms:", err);
    } finally {
      if (latestRequestRef.current === requestId) {
        setLoading(false);
        isFetchingRef.current = false;
      }
    }
  };

  useEffect(() => {
    let result = [...rawRooms];

    if (filters.priceRanges?.length) {
      result = result.filter((room) =>
        filters.priceRanges!.some((range) => {
          if (range.includes("+")) {
            const min = Number(range.replace("+", ""));
            return room.price >= min;
          }

          const [min, max] = range.split("-").map(Number);
          return room.price >= min && room.price <= max;
        }),
      );
    }

    if (filters.minRating) {
      result = result.filter((r) => (r.rating ?? 0) >= filters.minRating!);
    }

    if (filters.sortOrder) {
      result = [...result].sort((a, b) =>
        filters.sortOrder === "asc" ? a.price - b.price : b.price - a.price,
      );
    }

    setRooms(result);
  }, [rawRooms, filters]);

  useEffect(() => {
    loadRooms(page);
  }, [page, location, adults, children]);

  useEffect(() => {
    setRooms([]);
    setPage(1);
    setHasMore(true);
    loadRooms(1);
  }, [location, adults, children, filters, checkIn ?? null, checkOut ?? null]);

  useEffect(() => {
    const handleScroll = () => {
      if (loading || !hasMore || isFetchingRef.current) return;

      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;

      if (scrollTop + clientHeight >= scrollHeight - 1500) {
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

  useEffect(() => {
    if (!location) return;

    searchProvince(location).then((res) => {
      if (res?.length) {
        setFallbackCenter([Number(res[0].latitude), Number(res[0].longitude)]);
      }
    });
  }, [location]);

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
        <FilterBar onFilterChange={setFilters} />
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Map */}
          <div className="w-full lg:w-1/4 sticky lg:top-18 self-start">
            <div className="space-y-4">
              {location && (
                <WeatherBadge
                  location={location}
                  lat={rooms[0]?.location?.latitude}
                  lon={rooms[0]?.location?.longitude}
                />
              )}
              <div className="h-[calc(100vh-200px)] overflow-hidden rounded-lg shadow-md">
                <MapMarker
                  rooms={rooms}
                  fallbackCenter={fallbackCenter || undefined}
                />
              </div>
            </div>
          </div>
          <div className="w-full lg:w-3/4 mt-4 lg:mt-0">
            {rooms.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 mb-6">
                {rooms.map((room, index) => (
                  <StaggerItem index={index} key={`${room.id}-${index}`}>
                    <HoverScale>
                      <RoomCard room={room} />
                    </HoverScale>
                  </StaggerItem>
                ))}
              </div>
            )}

            {!loading && rooms.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <img src="/empty.svg" className="w-48" />

                <h2 className="text-xl font-semibold mt-4">
                  Không tìm thấy phòng
                </h2>

                <p className="text-muted text-sm mt-2 max-w-md">
                  Hãy thử điều chỉnh bộ lọc hoặc chọn một vị trí khác.
                </p>
              </div>
            )}

            {loading && (
              <div className="flex items-center justify-center py-6">
                <div className="flex items-center gap-3 text-muted">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="text-sm">{t("loading more rooms...")}</span>
                </div>
              </div>
            )}

            {!hasMore && !loading && rooms.length > 0 && (
              <div className="flex items-center justify-center py-2">
                <div className="text-center text-muted">
                  <p className="text-sm ">
                    {t("You{'ve'} reached the end of the results")}
                  </p>
                  <p className="text-xs mt-1">
                    {rooms.length > 1
                      ? t("totalRooms").replace(
                          "{count}",
                          rooms.length.toString(),
                        )
                      : t("totalRoom").replace(
                          "{count}",
                          rooms.length.toString(),
                        )}
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
