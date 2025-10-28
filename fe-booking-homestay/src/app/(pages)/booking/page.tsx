"use client";

import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Room } from "@/models/Room";
import { get_booking } from "@/services/bookingApi";
import { Loader2, MapPin, Star } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function HistoryBooking() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} VND`;
  };

  const fetchBookings = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const res = await get_booking({ page, pageSize: 6 });
      console.log("Booking API response:", res);

      const items = res?.data?.items;
      console.log("Items array:", items);

      const newRooms = items.map((booking: any) => ({
        id: booking.id,
        name: booking.room.name,
        price: booking.room.price,
        rating: booking.room.rating,
        images: {
          main:
            booking.room.images.find((img: any) => img.isMain)?.url ||
            "/placeholder.svg",
        },
        status: booking.status,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        adults: booking.adults,
        children: booking.children,
      }));
      console.log("Mapped newRooms:", newRooms);

      if (newRooms.length < 6) setHasMore(false);
      setRooms((prev) => [...prev, ...newRooms]);
      setPage((prev) => prev + 1);
    } catch (err) {
      console.error("Fetch booking history error:", err);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page]);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (loading || !hasMore) return;

      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;

      // Trigger load more when user is 200px from bottom
      if (scrollTop + clientHeight >= scrollHeight - 200) {
        fetchBookings();
      }
      setScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [fetchBookings, loading, hasMore]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container max-w-6xl mx-auto py-12 space-y-12 pt-20 px-4 sm:px-6 lg:px-8">
        <h2 className="elegant-heading text-3xl">History booking</h2>
        <div className="grid grid-cols-1 gap-8 ">
          {rooms.map((room, index) => (
            <Card
              key={`${room.id}-${index}`}
              onClick={() => router.push(`/booking/${room.id}`)}
              className="overflow-hidden hover:shadow-xl transition-all duration-500 hover:cursor-pointer"
            >
              <div className="flex">
                <div className="relative">
                  <Image
                    src={room.images?.main || "/placeholder.svg"}
                    alt={room.name}
                    width={400}
                    height={600}
                    className="w-70 h-full object-cover rounded-l-2xl"
                  />
                  <div className="absolute top-4  left-4 bg-border px-2 py-1 rounded-full flex items-center gap-1">
                    <Star className="text-chart-4 fill-current" size={16} />
                    <span className="text-sm font-medium">{room.rating}</span>
                  </div>
                </div>
                <div className="relative w-full">
                  <div className="absolute top-4 right-4 bg-succcess text-white px-2 py-1 rounded-full flex items-center gap-1">
                    <span className="text-sm ">Complete</span>
                  </div>
                  <CardContent className="p-8 w-full">
                    <h3 className="elegant-heading text-2xl text-foreground pb-6 truncate">
                      {room.name}
                    </h3>
                    <p className="elegant-subheading text-muted-foreground mb-2 flex items-center gap-1">
                      <MapPin size={16} />
                      {room.location.fullAddress}
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
                          {formatPrice(room.price)}
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
