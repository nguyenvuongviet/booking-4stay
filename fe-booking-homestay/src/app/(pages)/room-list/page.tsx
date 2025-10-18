"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { FilterBar } from "@/components/FilterBar";
import { RoomCard } from "@/components/RoomCard";
import { SearchBar } from "@/components/SearchBar";
import { Hotel } from "@/models/Hotel";
import { Car, Coffee, Dumbbell, Loader2, Wifi } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";

const initialHotels: Hotel[] = [
  {
    id: 1,
    name: "Kim Dung Hotel Tran Quang Khai",
    location: "184 Tran Quang Khai Street, Ho Chi Minh City, ...",
    rating: 7.0,
    image: "/images/home-dn.jpg",
    price: 438330,
    amenities: ["wifi", "parking"],
  },
  {
    id: 2,
    name: "The One Premium Hotel",
    location: "29 Thu Khoa Huan, Ben Thanh Ward, District 1, ...",
    rating: 6.9,
    image: "/images/home-dn-2.jpg",
    price: 552496,
    amenities: ["wifi", "restaurant"],
  },
  {
    id: 3,
    name: "Lucky Star Hotel Nguyen Trai",
    location: "146 Nguyen Trai, Ben Thanh Ward, Ho Chi Minh...",
    rating: 7.4,
    image: "/images/home-dn.jpg",
    price: 555841,
    amenities: ["wifi", "gym"],
  },
  {
    id: 4,
    name: "Riverside Garden Hotel",
    location: "78 Nguyen Hue Boulevard, District 1, Ho Chi Minh...",
    rating: 8.2,
    image: "/images/home-dn.jpg",
    price: 650000,
    amenities: ["wifi", "parking", "restaurant"],
  },
  {
    id: 5,
    name: "Central Business Hotel",
    location: "45 Le Loi Street, Ben Nghe Ward, District 1...",
    rating: 7.8,
    image: "/images/home-dn.jpg",
    price: 420000,
    amenities: ["wifi"],
  },
  {
    id: 6,
    name: "Modern City Hotel",
    location: "123 Dong Khoi Street, Ben Nghe Ward, District 1...",
    rating: 6.5,
    image: "/images/home-dn.jpg",
    price: 350000,
    amenities: ["wifi", "gym"],
  },
];

const generateMoreHotels = (startId: number, count: number) => {
  const hotelNames = [
    "Grand Palace Hotel",
    "Saigon Star Hotel",
    "Golden Dragon Hotel",
    "Pearl River Hotel",
    "Lotus Garden Hotel",
    "Diamond Tower Hotel",
    "Royal Crown Hotel",
    "Emerald Bay Hotel",
    "Silver Moon Hotel",
    "Crystal Palace Hotel",
    "Jade Garden Hotel",
    "Ruby Tower Hotel",
  ];

  const location = [
    "District 1, Ho Chi Minh City",
    "District 3, Ho Chi Minh City",
    "District 5, Ho Chi Minh City",
    "District 7, Ho Chi Minh City",
    "Binh Thanh District, Ho Chi Minh City",
    "Tan Binh District, Ho Chi Minh City",
  ];

  const images = [
    "/images/home-dn.jpg",
    "/images/home-dn-2.jpg",
    "/images/home-hanoi-1.jpg",
    "/images/home-hcm-1.jpg",
    "/images/home-hanoi-1.jpg",
    "/images/home-dn-2.jpg",
  ];
  const amenitiesList = [
    ["wifi", "parking"],
    ["wifi", "restaurant"],
    ["wifi", "gym"],
    ["wifi"],
  ];

  return Array.from({ length: count }, (_, index) => ({
    id: startId + index,
    name: hotelNames[index % hotelNames.length],
    location: `${Math.floor(Math.random() * 500) + 1} ${
      location[index % location.length]
    }`,
    rating: Math.round((Math.random() * 3 + 5) * 10) / 10,
    price: Math.floor(Math.random() * 400000 + 250000),
    image: images[index % images.length],
    amenities: amenitiesList[index % amenitiesList.length], // ✅ thêm dòng này
  }));
};

export default function HotelsListPage() {
  // const getAmenityIcon = (amenity: string) => {
  //   switch (amenity) {
  //     case "wifi":
  //       return <Wifi size={16} />;
  //     case "parking":
  //       return <Car size={16} />;
  //     case "restaurant":
  //       return <Coffee size={16} />;
  //     case "gym":
  //       return <Dumbbell size={16} />;
  //     default:
  //       return null;
  //   }
  // };
  const [hotels, setHotels] = useState(initialHotels);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  const loadMoreHotels = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const newHotels = generateMoreHotels(hotels.length + 1, 6);
    setHotels((prev) => [...prev, ...newHotels]);
    setPage((prev) => prev + 1);

    // Stop loading more after 5 pages (30 hotels total)
    if (page >= 5) {
      setHasMore(false);
    }

    setLoading(false);
  }, [loading, hasMore, hotels.length, page]);

  useEffect(() => {
    const handleScroll = () => {
      if (loading || !hasMore) return;

      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;

      // Trigger load more when user is 200px from bottom
      if (scrollTop + clientHeight >= scrollHeight - 200) {
        loadMoreHotels();
      }
      setScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadMoreHotels, loading, hasMore]);

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
      <main className="container mx-auto py-12 space-y-12 pt-20 px-4 sm:px-6 lg:px-8">
        <SearchBar />
        <FilterBar />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ">
          {hotels.map((hotel, index) => (
            <RoomCard key={`${hotel.id}-${index}`} hotel={hotel} />
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
              <p className="text-xs mt-1">
                Total: {hotels.length} hotels found
              </p>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
