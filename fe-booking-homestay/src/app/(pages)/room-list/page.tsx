"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { useState, useEffect, useCallback } from "react";
import { Hotel } from "@/models/Hotel";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

import {
  Star,
  MapPin,
  Wifi,
  Car,
  Coffee,
  Dumbbell,
  Loader2,
  Filter,
} from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { FilterBar } from "@/components/FilterBar";
// import { motion, AnimatePresence } from "framer-motion";

const initialHotels = [
  {
    id: 1,
    name: "Kim Dung Hotel Tran Quang Khai",
    location: "184 Tran Quang Khai Street, Ho Chi Minh City, ...",
    rating: 7.0,
    originalPrice: 438330,
    discountedPrice: 438330,
    total: 438330,
    earnPoints: 4383,
    image: "/images/home-dn.jpg",
    bestOffer: true,
    flex: true,
  },
  {
    id: 2,
    name: "The One Premium Hotel",
    location: "29 Thu Khoa Huan, Ben Thanh Ward, District 1, ...",
    rating: 6.9,
    originalPrice: 552496,
    discountedPrice: 552496,
    total: 552496,
    earnPoints: 5524,
    image: "/images/home-dn-2.jpg",
    bestOffer: true,
    flex: false,
  },
  {
    id: 3,
    name: "Lucky Star Hotel Nguyen Trai",
    location: "146 Nguyen Trai, Ben Thanh Ward, Ho Chi Min...",
    rating: 7.4,
    originalPrice: 555841,
    discountedPrice: 555841,
    total: 555841,
    earnPoints: 5558,
    image: "/images/home-dn.jpg",
    bestOffer: true,
    flex: false,
  },
  {
    id: 4,
    name: "Riverside Garden Hotel",
    location: "78 Nguyen Hue Boulevard, District 1, Ho Chi Minh...",
    rating: 8.2,
    originalPrice: 720000,
    discountedPrice: 650000,
    total: 650000,
    earnPoints: 6500,
    image: "/images/home-dn.jpg",
    bestOffer: true,
    flex: true,
  },
  {
    id: 5,
    name: "Central Business Hotel",
    location: "45 Le Loi Street, Ben Nghe Ward, District 1...",
    rating: 7.8,
    originalPrice: 480000,
    discountedPrice: 420000,
    total: 420000,
    earnPoints: 4200,
    image: "/images/home-dn.jpg",
    bestOffer: false,
    flex: true,
  },
  {
    id: 6,
    name: "Modern City Hotel",
    location: "123 Dong Khoi Street, Ben Nghe Ward, District 1...",
    rating: 6.5,
    originalPrice: 380000,
    discountedPrice: 350000,
    total: 350000,
    earnPoints: 3500,
    image: "/images/home-dn.jpg",
    bestOffer: false,
    flex: false,
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

  return Array.from({ length: count }, (_, index) => ({
    id: length * count + index + 1,
    name: hotelNames[index % hotelNames.length],
    location: `${Math.floor(Math.random() * 500) + 1} ${
      location[index % location.length]
    }`,
    rating: Math.round((Math.random() * 3 + 5) * 10) / 10,
    originalPrice: Math.floor(Math.random() * 500000 + 300000),
    discountedPrice: Math.floor(Math.random() * 400000 + 250000),
    total: Math.floor(Math.random() * 400000 + 250000),
    earnPoints: Math.floor(Math.random() * 5000 + 2000),
    image: images[index % images.length],
    bestOffer: Math.random() > 0.5,
    flex: Math.random() > 0.6,
  }));
};

export default function HotelsListPage() {
  const getAmenityIcon = (amenity: string) => {
    switch (amenity) {
      case "wifi":
        return <Wifi size={16} />;
      case "parking":
        return <Car size={16} />;
      case "restaurant":
        return <Coffee size={16} />;
      case "gym":
        return <Dumbbell size={16} />;
      default:
        return null;
    }
  };
  const [hotels, setHotels] = useState(initialHotels);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} VND`;
  };

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
            <Card
              key={`${hotel.id}-${index}`}
              onClick={() => router.push(`/room/${hotel.id}`)}
              className="overflow-hidden hover:shadow-xl transition-all duration-500 hover:cursor-pointer"
            >
              <div className="relative">
                <Image
                  src={hotel.image || "/placeholder.svg"}
                  alt={hotel.name}
                  width={400}
                  height={600}
                  className="w-full h-72 object-cover rounded-t-2xl"
                />
                <div className="absolute top-4 right-4 bg-border px-2 py-1 rounded-full flex items-center gap-1">
                  <Star className="text-chart-4 fill-current" size={16} />
                  <span className="text-sm font-medium">{hotel.rating}</span>
                </div>
              </div>
              <CardContent className="pb-8 ">
                <h3 className="elegant-heading text-2xl text-foreground pb-6 truncate">
                  {hotel.name}
                </h3>
                <p className="elegant-subheading text-muted-foreground mb-2 flex items-center gap-1">
                  <MapPin size={16} />
                  {hotel.location}
                </p>
                
                {/* <div className="flex items-center gap-2 mb-4">
                  {hotel.amenities.map((amenity) => (
                    <div
                      key={amenity}
                      className="elegant-subheading text-muted-foreground"
                    >
                      {getAmenityIcon(amenity)}
                    </div>
                  ))}
                </div> */}
                <div className="flex flex-row-reverse">
                  <div>
                    <span className="text-2xl elegant-heading text-foreground">
                      {formatPrice(hotel.total)}
                    </span>
                    <span className="elegant-subheading text-muted-foreground">
                      /night
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
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
