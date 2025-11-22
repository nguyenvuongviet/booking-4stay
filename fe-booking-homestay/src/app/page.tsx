"use client";

import Footer from "@/components/Footer";
import GuestPicker from "@/components/GuestPicker";
import Header from "@/components/Header";
import LocationSuggestions from "@/components/LocationSuggestions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import DateRangePicker from "@/components/ui/date-range-picker";
import { Input } from "@/components/ui/input";
import { Amenity } from "@/models/Amenity";
import { Location } from "@/models/Location";
import { Room } from "@/models/Room";
import { location, room_all, search_location } from "@/services/roomApi";
import BlurInScroll from "@/styles/animations/BlurInScroll";
import HoverScale from "@/styles/animations/HoverScale";
import ScrollFade from "@/styles/animations/ScrollFade";
import ScrollScale from "@/styles/animations/ScrollScale";
import StaggerItem from "@/styles/animations/StaggerItem";
import Typing from "@/styles/animations/Typing";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  Bath,
  BedDouble,
  Building2,
  Car,
  Check,
  Coffee,
  CookingPot,
  Dumbbell,
  MapPin,
  Refrigerator,
  Search,
  Snowflake,
  Sofa,
  Star,
  Sun,
  Tv,
  Users,
  Waves,
  Wifi,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export default function HomePage() {
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [page, setPage] = useState(1);
  const [locations, setLocations] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [locationInput, setLocationInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const data = await location();
        setLocations(data.data || []);
      } catch (error) {
        console.error("Error fetching checkout data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLocations();
  }, []);

  const getAmenityIcon = (amenity: Amenity) => {
    switch (amenity.name.toLowerCase()) {
      case "wifi":
        return <Wifi className="h-4 w-4" />;
      case "air conditioner":
        return <Snowflake className="h-4 w-4" />;
      case "television":
        return <Tv className="h-4 w-4" />;
      case "refrigerator":
        return <Refrigerator className="h-4 w-4" />;
      case "kitchen":
        return <CookingPot className="h-4 w-4" />;
      case "bath tub":
        return <Bath className="h-4 w-4" />;
      case "parking":
        return <Car className="h-4 w-4" />;
      case "elevator":
        return <Building2 className="h-4 w-4" />;
      case "swimming pool":
        return <Waves className="h-4 w-4" />;
      case "gym":
        return <Dumbbell className="h-4 w-4" />;
      case "bed":
      case "double bed":
      case "single bed":
        return <BedDouble className="h-4 w-4" />;
      case "sofa":
        return <Sofa className="h-4 w-4" />;
      case "balcony":
        return <Sun className="h-4 w-4" />;
      case "coffee maker":
        return <Coffee className="h-4 w-4" />;
      default:
        return <Check className="h-4 w-4" />;
    }
  };

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} VND`;
  };

  const loadRooms = useCallback(
    async (reset = false) => {
      if (loading) return;
      try {
        setLoading(true);
        const result = await room_all({
          page: reset ? 1 : page,
          pageSize: 6,
          search: search.trim(),
          adults,
          children,
        });

        const roomsData = result.rooms || [];

        if (reset) {
          setRooms(roomsData);
          setPage(2);
        } else {
          setRooms((prev) => [...prev, ...roomsData]);
          setPage((prev) => prev + 1);
        }

        setHasMore(roomsData.length > 0);
      } catch (err) {
        console.error("Error loading rooms:", err);
      } finally {
        setLoading(false);
      }
    },
    [page, search, adults, children, loading]
  );

  //Hàm fetch gợi ý location
  const fetchLocationSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      //input rỗng
      const res = await location();
      const allData = res.data || [];
      setLocations(allData);
      setShowSuggestions(allData.length > 0);
    } else {
      //có text
      const res = await search_location(query);
      const data = res.data?.data || [];
      setLocations(data);
      setError("");
      setShowSuggestions(data.length > 0);
    }
  }, []);

  //tránh gọi API liên tục khi gõ
  useEffect(() => {
    loadRooms(true);
    if (!showSuggestions) return; // Chỉ chạy nếu đang focus
    const timeout = setTimeout(() => {
      fetchLocationSuggestions(locationInput);
    }, 200);
    return () => clearTimeout(timeout);
  }, [locationInput, fetchLocationSuggestions, showSuggestions]);

  const handleFocusLocation = () => {
    setShowSuggestions(true);
    fetchLocationSuggestions(locationInput);
  };

  const handleSelectLocation = (loc: Location) => {
    setLocationInput(loc.province || "");
    setShowSuggestions(false);
  };

  useEffect(() => {
    const handleClickOutside = () => setShowSuggestions(false);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    try {
      if (!locationInput || locationInput.trim() === "") {
        setError("Please enter a location.");
        setShowSuggestions(false);
        locationInputRef.current?.focus();

        return;
      }
      const query = new URLSearchParams({
        location: locationInput,
        ...(checkIn ? { checkIn: format(checkIn, "yyyy-MM-dd") } : {}),
        ...(checkOut ? { checkOut: format(checkOut, "yyyy-MM-dd") } : {}),
        adults: adults.toString(),
        children: children.toString(),
      }).toString();

      setTimeout(() => {
        router.push(`/room-list?${query}`);
      }, 300);
    } catch (error) {
      console.error("search room error: ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background ">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-linear-to-b form-background to-secondary/30 pt-20 sm:pt-10">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center ">
          <div className="mb-12 max-w-2xl mx-auto">
            <Typing
              texts={["Find Your Perfect Stay", "Enjoy Your Trip"]}
              speed={80}
              deleteSpeed={60}
              pause={1000}
              loop={true}
              className="elegant-heading md:text-8xl text-gradient mb-4 min-h-54"
            />
            <ScrollFade
              delay={500}
              className="elegant-subheading text-lg mb:text-xl text-muted-foreground mx-auto text-pretty"
            >
              Discover amazing hotels, resorts, and accommodations worldwide
            </ScrollFade>
          </div>

          {/* Search Form */}
          <motion.div
            layoutId="search-bar"
            initial={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-card rounded-4xl p-8 shadow-xl transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-8">
                <div>
                  <label className="elegant-subheading text-sm text-secondary-foreground mb-2 block">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                      size={20}
                    />
                    <Input
                      ref={locationInputRef}
                      value={locationInput}
                      onChange={(e) => setLocationInput(e.target.value)}
                      onFocus={handleFocusLocation}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Where are you going?"
                      className="pl-10 h-12 border-border focus:border-accent elegant-subheading rounded-3xl placeholder:text-muted"
                    />
                    {error && (
                      <p className="text-sm text-red-500 mt-1 absolute">
                        {error}
                      </p>
                    )}

                    {/* Danh sách gợi ý location */}
                    <LocationSuggestions
                      locations={locations}
                      showSuggestions={showSuggestions}
                      onSelect={handleSelectLocation}
                    />
                  </div>
                </div>

                <div>
                  <label className="elegant-subheading text-sm text-secondary-foreground mb-2 block">
                    Check in & Check out
                  </label>
                  <div className="relative">
                    <DateRangePicker
                      value={
                        checkIn && checkOut
                          ? { from: checkIn, to: checkOut }
                          : undefined
                      }
                      onChange={(range) => {
                        setCheckIn(range?.from ?? null);
                        setCheckOut(range?.to ?? null);
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="elegant-subheading text-sm text-secondary-foreground mb-2 block">
                    Guests
                  </label>
                  <div className="relative">
                    <Users
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                      size={20}
                    />
                    <GuestPicker
                      adults={adults}
                      children={children}
                      setAdults={setAdults}
                      setChildren={setChildren}
                    />
                  </div>
                </div>
              </div>
              <Button
                onClick={handleSearch}
                className="rounded-3xl w-full bg-primary hover:bg-primary/90 h-12 elegant-subheading text-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
              >
                <Search className="mr-2" size={20} />
                {loading ? "Searching..." : "Search Hotels"}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Hotels */}
      <section className="py-26 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <ScrollScale className="elegant-heading text-5xl text-foreground mb-6">
              Featured Hotels
            </ScrollScale>
            <ScrollFade className="elegant-subheading text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover our handpicked selection of premium accommodations
            </ScrollFade>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms.map((room, index) => (
              <StaggerItem index={index} key={room.id}>
                <HoverScale>
                  <Card
                    // key={room.id}
                    className="overflow-hidden hover:shadow-xl"
                  >
                    <div className="relative">
                      <Image
                        src={room.images?.main || "/default.jpg"}
                        alt={room.name}
                        width={400}
                        height={600}
                        className="w-full h-64 object-cover rounded-t-2xl transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded-full flex items-center gap-1">
                        <Star
                          className="text-yellow-400 fill-current"
                          size={16}
                        />
                        <span className="text-sm elegant-sans">
                          {room.rating}
                        </span>
                      </div>
                    </div>
                    <CardContent className="pb-8">
                      <h3 className="elegant-heading text-xl text-secondary-foreground mb-2">
                        {room.name}
                      </h3>
                      <p className="elegant-subheading text-sm text-muted-foreground mb-2 flex items-center gap-1">
                        <MapPin size={20} className="mr-2" />
                        <span className="line-clamp-1">
                          {room.location.fullAddress}
                        </span>
                      </p>
                      <div className="flex items-center gap-2 mb-4 h-4">
                        {(room.amenities || []).map((amenity) => (
                          <div
                            key={amenity.id} 
                            className="elegant-subheading text-muted-foreground flex items-center gap-1"
                          >
                            <span>{getAmenityIcon(amenity)}</span>
                            {/* <span>{amenity.name}</span> */}
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-xl elegant-sans text-foreground">
                            {formatPrice(room.price)}
                          </span>
                          <span className="elegant-subheading text-sm text-muted-foreground">
                            /night
                          </span>
                        </div>
                        <Button
                          onClick={() => router.push(`/room/${room.id}`)}
                          className="bg-primary hover:bg-primary/90 elegant-sans hover:cursor-pointer rounded-xl"
                        >
                          Book Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </HoverScale>
              </StaggerItem>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          <div className="text-center mb-20">
            <ScrollScale className="elegant-heading text-5xl text-foreground mb-6">
              Popular Destinations
            </ScrollScale>
            <ScrollFade className="elegant-subheading text-xl text-muted-foreground max-w-2xl mx-auto">
              Explore the world{"'"}s most sought-after travel destinations
            </ScrollFade>
          </div>

          {locations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {locations.map((loc: Location, index) => (
                <BlurInScroll key={loc.id} delay={index * 120}>
                  <HoverScale>
                    <Card
                      onClick={() =>
                        router.push(
                          `/room-list?location=${encodeURIComponent(
                            loc.province
                          )}`
                        )
                      }
                      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    >
                      <div className="relative">
                        <img
                          src={loc.provinceImageUrl || "/default.jpg"}
                          alt={loc.province}
                          className="w-full h-72 object-cover"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />

                        <div className="absolute bottom-4 left-6 text-accent">
                          <h3 className="text-2xl elegant-sans mb-1">
                            {loc.province || "Unknown"}
                          </h3>
                        </div>
                      </div>
                    </Card>
                  </HoverScale>
                </BlurInScroll>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              No destinations available.
            </p>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="elegant-heading text-4xl text-foreground mb-6">
              Why Choose 4Stay?
            </h2>
            <p className="elegant-subheading text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the difference with our premium booking platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={24} />
              </div>
              <h3 className="text-2xl elegant-heading text-foreground mb-2">
                Easy Search
              </h3>
              <p className="text-muted-foreground elegant-subheading text-sm">
                Find the perfect accommodation with our intuitive search and
                filtering system
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star size={24} />
              </div>
              <h3 className="text-2xl elegant-heading text-foreground mb-2">
                Best Prices
              </h3>
              <p className="text-muted-foreground elegant-subheading text-sm">
                Get the best deals and exclusive offers on premium hotels
                worldwide
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users size={24} />
              </div>
              <h3 className="text-2xl elegant-heading text-foreground mb-2">
                24/7 Support
              </h3>
              <p className="text-muted-foreground elegant-subheading text-sm">
                Our dedicated support team is available around the clock to
                assist you
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
