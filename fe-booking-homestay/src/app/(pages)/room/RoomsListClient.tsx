"use client";

import { FilterBar } from "@/_components/FilterBar";
import Footer from "@/_components/Footer";
import Header from "@/_components/Header";
import { SearchBar } from "@/_components/SearchBar";
import { useFavorites } from "@/_hooks/useFavorites";
import { useWeather } from "@/_hooks/useWeather";
import { RoomCard } from "@/app/(pages)/room/_component/RoomCard";
import RoomListRecommendations from "@/app/(pages)/room/_component/RoomListRecommendations";
import { useLang } from "@/context/lang-context";
import { Room } from "@/models/Room";
import { searchProvince } from "@/services/locationApi";
import { getRooms, room_available } from "@/services/roomApi";
import HoverScale from "@/styles/animations/HoverScale";
import StaggerItem from "@/styles/animations/StaggerItem";
import { useSpring } from "framer-motion";
import { ChevronLeft, ChevronRight, Menu } from "lucide-react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

const RoomsMap = dynamic(() => import("./_component/RoomsMap"), { ssr: false });

export default function RoomsListPage() {
  const [rawRooms, setRawRooms] = useState<Room[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [recommendedRooms, setRecommendedRooms] = useState<Room[]>([]);
  const [mapRooms, setMapRooms] = useState<Room[]>([]);

  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [scrolled, setScrolled] = useState(false);
  const searchParams = useSearchParams();
  const location = searchParams.get("location") || "";
  const adults = Number(searchParams.get("adults")) || 1;
  const children = Number(searchParams.get("children")) || 0;
  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";
  const [filters, setFilters] = useState<{
    priceRanges?: string[];
    minRating?: number[];
    sortOrder?: "asc" | "desc";
  }>({});

  // Weather data for FilterBar popover
  const weatherLat = rooms[0]?.location?.latitude;
  const weatherLon = rooms[0]?.location?.longitude;
  const { data: weatherData } = useWeather(weatherLat, weatherLon);

  const displayRooms = useMemo(() => {
    if (location) {
      return mapRooms;
    }
    const combined = [...mapRooms];
    recommendedRooms.forEach((recRoom: any) => {
      if (!combined.some((r) => r.id === recRoom.id)) {
        const item: any = {
          id: recRoom.id,
          name: recRoom.name,
          description: recRoom.description,
          price: recRoom.price,
          adultCapacity: recRoom.adultCapacity,
          childCapacity: recRoom.childCapacity,
          location: {
            id: recRoom.location?.id,
            fullAddress: recRoom.location?.fullAddress,
            province: recRoom.location?.province,
            latitude: recRoom.location?.latitude,
            longitude: recRoom.location?.longitude,
          },
          rating: recRoom.rating || 0,
          reviewCount: recRoom.reviewCount || 0,
          image: recRoom.images?.main || recRoom.image || "/default.jpg",
          images: recRoom.images,
          amenities: recRoom.amenities || [],
          status: recRoom.status || "Available",
        };
        combined.push(item);
      }
    });
    return combined;
  }, [mapRooms, recommendedRooms, location]);

  const y = useSpring(scrolled ? -20 : 0, { stiffness: 120, damping: 25 });
  const scale = useSpring(scrolled ? 0.9 : 1, { stiffness: 120, damping: 25 });

  const [fallbackCenter, setFallbackCenter] = useState<[number, number] | null>(
    null,
  );
  const buildParams = (pageParam: number) => {
    let minPrice: number | undefined;
    let maxPrice: number | undefined;
    let minRating: number | undefined;

    if (filters.priceRanges?.length) {
      const prices = filters.priceRanges.map((range) => {
        if (range.includes("+")) {
          return { min: Number(range.replace("+", "")), max: undefined };
        }
        const [min, max] = range.split("-").map(Number);
        return { min, max };
      });

      minPrice = Math.min(...prices.map((p) => p.min));
      const maxes = prices
        .map((p) => p.max)
        .filter((m) => m !== undefined) as number[];
      if (maxes.length > 0 && maxes.length === prices.length) {
        maxPrice = Math.max(...maxes);
      }
    }

    if (filters.minRating?.length) {
      minRating = Math.min(...filters.minRating);
    }

    return {
      search: location || undefined,
      adults,
      children,
      page: pageParam,
      pageSize: 6,
      minPrice,
      maxPrice,
      minRating,
      sortBy: filters.sortOrder ? "price" : undefined,
      sortOrder: filters.sortOrder,
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
      let calculatedTotalPages = 1;

      const result = await getRooms(buildParams(pageParam));
      roomsData = result?.rooms || [];
      calculatedTotalPages = Math.ceil((result?.total || 0) / 6);
      setTotalPages(calculatedTotalPages);

      // Fetch all matching rooms for map (pageSize: 100)
      const mapParams = {
        ...buildParams(1),
        page: 1,
        pageSize: 100,
      };
      const mapResult = await getRooms(mapParams);
      const mapRoomsData = mapResult?.rooms || [];

      if (latestRequestRef.current !== requestId) return;

      if (!roomsData.length) {
        setRooms([]);
        setRawRooms([]);
        setMapRooms([]);
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

      const mappedMapRooms: Room[] = mapRoomsData.map((room: any) => ({
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
      let finalMapRooms = mappedMapRooms;

      // Kiểm tra availability nếu có ngày checkIn/checkOut
      if (checkIn && checkOut) {
        const [availabilityResults, mapAvailabilityResults] = await Promise.all(
          [
            Promise.all(
              mappedRooms.map((room) =>
                room_available(room.id, checkIn, checkOut)
                  .then((res) => ({
                    id: room.id,
                    available: res.available ?? false,
                  }))
                  .catch(() => ({ id: room.id, available: false })),
              ),
            ),
            Promise.all(
              mappedMapRooms.map((room) =>
                room_available(room.id, checkIn, checkOut)
                  .then((res) => ({
                    id: room.id,
                    available: res.available ?? false,
                  }))
                  .catch(() => ({ id: room.id, available: false })),
              ),
            ),
          ],
        );

        finalRooms = mappedRooms.map((room) => {
          const found = availabilityResults.find((r) => r.id === room.id);
          return {
            ...room,
            status: found?.available ? "Available" : "Sold out",
          };
        });

        finalMapRooms = mappedMapRooms.map((room) => {
          const found = mapAvailabilityResults.find((r) => r.id === room.id);
          return {
            ...room,
            status: found?.available ? "Available" : "Sold out",
          };
        });
      }

      // Pagination replaces the array rather than merging it
      setRawRooms(finalRooms);
      setMapRooms(finalMapRooms);
      setHasMore(pageParam < calculatedTotalPages);
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

    if (filters.minRating && filters.minRating.length > 0) {
      result = result.filter(
        (r) =>
          r.rating !== undefined &&
          r.rating !== null &&
          filters.minRating!.includes(Math.floor(r.rating)),
      );
    }

    if (filters.sortOrder) {
      result = [...result].sort((a, b) =>
        filters.sortOrder === "asc" ? a.price - b.price : b.price - a.price,
      );
    }

    setRooms(result);
  }, [rawRooms, filters]);

  // Load rooms when page changes
  useEffect(() => {
    loadRooms(page);
  }, [page]);

  // Reset page to 1 when search options or filters change
  const prevParamsRef = useRef({
    location,
    adults,
    children,
    filters,
    checkIn,
    checkOut,
  });
  useEffect(() => {
    const prev = prevParamsRef.current;
    const current = { location, adults, children, filters, checkIn, checkOut };

    const changed =
      prev.location !== current.location ||
      prev.adults !== current.adults ||
      prev.children !== current.children ||
      JSON.stringify(prev.filters) !== JSON.stringify(current.filters) ||
      prev.checkIn !== current.checkIn ||
      prev.checkOut !== current.checkOut;

    if (changed) {
      prevParamsRef.current = current;
      if (page !== 1) {
        setPage(1);
      } else {
        loadRooms(1);
      }
    }
  }, [location, adults, children, filters, checkIn, checkOut, page]);

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

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      if (start > 2) {
        pages.push("ellipsis-1");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push("ellipsis-2");
      }

      pages.push(totalPages);
    }

    return pages.map((p, idx) => {
      if (typeof p === "string") {
        return (
          <span
            key={`ellipsis-${idx}`}
            className="px-3 py-2 text text-sm select-none"
          >
            ...
          </span>
        );
      }

      const isActive = p === page;
      return (
        <button
          key={`page-${p}`}
          onClick={() => handlePageChange(p)}
          className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all cursor-pointer active:scale-90
            ${
              isActive
                ? "bg-primary text-background shadow-md"
                : "hover:bg-primary/20 border border-transparent hover:border-primary/20 text-foreground"
            }`}
        >
          {p}
        </button>
      );
    });
  };

  const RoomSkeleton = () => (
    <div className="border border-border/40 rounded-3xl overflow-hidden animate-pulse bg-card">
      <div className="bg-primary/10 aspect-4/3 w-full" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-primary/10 rounded-md w-3/4" />
        <div className="h-3 bg-primary/10 rounded-md w-1/2" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-4 bg-primary/10 rounded-md w-1/3" />
          <div className="h-4 bg-primary/10 rounded-md w-1/6" />
        </div>
      </div>
    </div>
  );

  // Favorites
  const roomIds = useMemo(() => rooms.map((r) => r.id), [rooms]);
  const { isFavorited, toggle } = useFavorites(roomIds);

  return (
    <div className="min-h-screen bg-background dark:bg-black">
      <Header />
      <main className="max-w-9xl container mx-auto pt-28 lg:pt-64 px-3 pb-10 sm:px-4 md:px-6 lg:px-8">
        {/* SearchBar placeholder to prevent layout shift on mobile/tablet */}
        <div
          className={`transition-all duration-500 ease-in-out lg:hidden ${scrolled ? "h-0 opacity-0 mb-0 pointer-events-none" : "h-14 mb-8"}`}
        />

        <SearchBar stickyType="rooms" scrolled={scrolled} />

        {/* Mobile FilterBar (Sticky under Header containing SearchBar) - No background or borders to prevent separated layer appearance */}
        <div
          className={`lg:hidden sticky z-30 py-2 -mx-3 px-3 transition-all duration-500 ${scrolled ? "top-20" : "top-34"}`}
        >
          <FilterBar
            filters={filters}
            onFilterChange={setFilters}
            weatherData={location ? weatherData : undefined}
            weatherLocation={location || undefined}
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 mt-6 lg:mt-0">
          {/* Left Column (Desktop Filters & Map/Weather) */}
          <div className="w-full lg:w-100 xl:w-120 shrink-0 sticky lg:top-28 self-start space-y-4">
            {/* Desktop FilterBar Card - No background card class or borders, directly floating */}
            <div className="hidden lg:block p-0">
              <h3 className="text-xs font-bold uppercase tracking-wider mb-3 text-foreground/50 flex items-center gap-2 px-1">
                <Menu className="w-4 h-4 text-primary" />
                {t("langCode") === "en"
                  ? "Filters & Sorting"
                  : "Bộ lọc & Sắp xếp"}
              </h3>
              <FilterBar
                filters={filters}
                onFilterChange={setFilters}
                weatherData={location ? weatherData : undefined}
                weatherLocation={location || undefined}
              />
            </div>

            <div className="h-80 sm:h-100 lg:h-120 xl:h-140 overflow-hidden rounded-2xl border border-border/60 shadow-md">
              <RoomsMap
                rooms={displayRooms}
                center={location ? fallbackCenter : null}
                zoom={location ? 12 : 5}
              />
            </div>
          </div>
          <div className="w-full lg:flex-1 min-w-0 mt-4 lg:mt-0">
            {/* Recommendation sections — chỉ hiện khi chưa search và đang ở trang 1 */}
            {!location && page === 1 && (
              <RoomListRecommendations onRoomsLoaded={setRecommendedRooms} />
            )}

            {loading ? (
              /* Beautiful premium card skeleton screens when loading */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 sm:gap-2 lg:gap-3 mb-6">
                {[...Array(6)].map((_, index) => (
                  <RoomSkeleton key={`sk-${index}`} />
                ))}
              </div>
            ) : rooms.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 sm:gap-2 lg:gap-3 mb-6">
                {rooms.map((room, index) => (
                  <StaggerItem index={index} key={`${room.id}-${index}`}>
                    <HoverScale>
                      <RoomCard
                        room={room}
                        isFavorited={isFavorited(room.id)}
                        onToggleFavorite={toggle}
                      />
                    </HoverScale>
                  </StaggerItem>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <img src="/empty.svg" className="w-48" />

                <h2 className="text-xl font-semibold mt-4">
                  Không tìm thấy phòng
                </h2>

                <p className="text-foreground/50 text-sm mt-2 max-w-md">
                  Hãy thử điều chỉnh bộ lọc hoặc chọn một vị trí khác.
                </p>
              </div>
            )}

            {/* Pagination UI */}
            {!loading && totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8 py-4 border-t border-border/40">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="p-2.5 rounded-full border border-border/60 bg-card text-foreground hover:text-primary hover:border-primary/30 transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none active:scale-95 shadow-2xs hover:shadow-md flex items-center justify-center"
                  aria-label="Previous Page"
                >
                  <ChevronLeft size={16} />
                </button>

                {/* Page Numbers */}
                {renderPageNumbers()}

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="p-2.5 rounded-full border border-border/60 bg-card text-foreground hover:text-primary hover:border-primary/30 transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none active:scale-95 shadow-2xs hover:shadow-md flex items-center justify-center"
                  aria-label="Next Page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
