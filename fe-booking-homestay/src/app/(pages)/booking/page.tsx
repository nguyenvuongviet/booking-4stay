"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { Hotel } from "@/models/Hotel";
import { useState, useCallback, useEffect } from "react";
import { Loader2, Star, MapPin } from "lucide-react";

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
];

const generateMoreHotels = (startId: number, count: number) => {
  const hotelNames = [
    "Grand Palace Hotel",
    "Saigon Star Hotel",
    "Golden Dragon Hotel",
    "Pearl River Hotel",
  ];

  const location = [
    "District 1, Ho Chi Minh City",
    "District 3, Ho Chi Minh City",
    "District 5, Ho Chi Minh City",
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

export default function HistoryBooking() {
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
      <div className="container max-w-6xl mx-auto py-12 space-y-12 pt-20 px-4 sm:px-6 lg:px-8">
        <h2 className="elegant-heading text-3xl">History booking</h2>
        <div className="grid grid-cols-1 gap-8 ">
          {hotels.map((hotel, index) => (
            <Card
              key={`${hotel.id}-${index}`}
              onClick={() => router.push(`/booking/${hotel.id}`)}
              className="overflow-hidden hover:shadow-xl transition-all duration-500 hover:cursor-pointer"
            >
              <div className="flex">
                <div className="relative">
                  <Image
                    src={hotel.image || "/placeholder.svg"}
                    alt={hotel.name}
                    width={400}
                    height={600}
                    className="w-70 h-full object-cover rounded-l-2xl"
                  />
                  <div className="absolute top-4  left-4 bg-border px-2 py-1 rounded-full flex items-center gap-1">
                    <Star className="text-chart-4 fill-current" size={16} />
                    <span className="text-sm font-medium">{hotel.rating}</span>
                  </div>
                </div>
                <div className="relative w-full">
                  <div className="absolute top-4 right-4 bg-succcess text-white px-2 py-1 rounded-full flex items-center gap-1">
                    <span className="text-sm ">Complete</span>
                  </div>
                  <CardContent className="p-8 w-full">
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
                    <div className="flex flex-row-reverse mt-14">
                      <div>
                        <span className="text-2xl elegant-heading text-foreground">
                          {formatPrice(hotel.price)}
                        </span>
                        <span className="elegant-subheading text-muted-foreground">
                          /night
                        </span>
                      </div>
                    </div>
                    {/* <Button
                    onClick={() => router.push(`/history/${hotel.id}`)}
                    className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground elegant-subheading hover:cursor-pointer rounded-xl"
                  >
                    See detail
                  </Button> */}
                  </CardContent>
                </div>
              </div>
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
      </div>
    </div>
  );
}
