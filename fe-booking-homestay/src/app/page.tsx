"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Destination } from "@/models/Destination";
import { Hotel } from "@/models/Hotel";
import {
  Car,
  Coffee,
  Dumbbell,
  MapPin,
  Search,
  Star,
  Users,
  Wifi,
} from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Room } from "@/models/Room";
import {
  location,
  room_all,
  search_location,
  search_room,
} from "@/services/bookingApi";
import { Location } from "@/models/Location";

export default function HomePage() {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [isGuestPopoverOpen, setIsGuestPopoverOpen] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [page, setPage] = useState(1);
  const [locations, setLocations] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [locationInput, setLocationInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const locationInputRef = useRef<HTMLInputElement>(null);

  // 🔎 Từ khóa tìm kiếm (search)
  const [search, setSearch] = useState("");

  const getGuestDisplayText = () => {
    const total = adults + children;
    return `${total} Guests`;
  };

  const router = useRouter();

  const popularDestinations: Destination[] = [
    {
      id: 1,
      name: "Ha Noi",
      country: "Viet Nam",
      image: "/images/ha-noi.jpg",
    },
    {
      id: 2,
      name: "Da Nang",
      country: "Viet Nam",
      image: "/images/da-nang.jpg",
    },
    {
      id: 3,
      name: "Ho Chi Minh",
      country: "Viet Nam",
      image: "/images/ho-chi-minh.jpg",
    },
  ];

  const getAmenityIcon = (amenity: Amenity) => {
    switch (amenity.category) {
      case "BASIC":
        return "🛏️";
      case "COMMON":
        return "🚗";
      default:
        return "✔️";
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
        ...(checkIn ? { checkIn } : {}),
        ...(checkOut ? { checkOut } : {}),
        adults: adults.toString(),
        children: children.toString(),
      }).toString();

      router.push(`/room-list?${query}`);
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
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b form-background to-secondary/30 pt-20 sm:pt-10">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center">
          <div className="mb-12 max-w-3xl mx-auto">
            <h1 className="elegant-heading text-6xl md:text-8xl text-foreground mb-8 text-balance">
              Find
              <span className="text-primary"> Your Perfect </span>
              Stay
            </h1>
            <p className="elegant-subheading text-xl mb:text-2xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              Discover amazing hotels, resorts, and accommodations worldwide
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-card rounded-4xl p-8 shadow-xl ">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-8">
              <div>
                <label className="elegant-subheading text-sm text-muted-foreground mb-2 block">
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
                    className="pl-10 h-12 border-border focus:border-accent elegant-subheading rounded-2xl"
                  />
                  {error && (
                    <p className="text-sm text-red-500 mt-1 absolute">
                      {error}
                    </p>
                  )}

                  {/* Danh sách gợi ý */}
                  {showSuggestions && locations.length > 0 && (
                    <ul className="absolute z-50 left-0 right-0 bg-white border border-gray-200 mt-2 rounded-xl shadow-lg max-h-60 overflow-auto text-left">
                      {locations.map((loc: Location) => (
                        <li
                          key={loc.id}
                          onClick={() => handleSelectLocation(loc)}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700"
                        >
                          {/* {loc.province
                              ? `${loc.district}, ${loc.province}`
                              : loc.province || "Unknown"} */}
                          {loc.province || "Unknown"}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div>
                <label className="elegant-subheading text-sm text-muted-foreground mb-2 block">
                  Check in
                </label>
                <div className="relative">
                  {/* <Calendar
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                        size={20}
                      /> */}
                  <Input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className=" h-12 elegant-subheading  rounded-2xl"
                  />
                </div>
              </div>
              <div>
                <label className="elegant-subheading text-sm text-muted-foreground mb-2 block">
                  Check out
                </label>
                <div className="relative">
                  {/* <Calendar
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                        size={20}
                      /> */}
                  <Input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className=" h-12 elegant-subheading  rounded-2xl"
                  />
                </div>
              </div>
              <div>
                <label className="elegant-subheading text-sm text-muted-foreground mb-2 block">
                  Guests
                </label>
                <div className="relative">
                  <Users
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                    size={20}
                  />
                  <Popover
                    open={isGuestPopoverOpen}
                    onOpenChange={setIsGuestPopoverOpen}
                  >
                    <PopoverTrigger asChild>
                      <button className="w-full h-12 px-4 border border-border rounded-2xl focus:border-accent focus:ring-1 focus:ring-accent text-left flex items-center justify-between">
                        <div className="flex items-center justify-between ">
                          {/* <p className="text-sm text-muted-foreground elegant-subheading mr-4">
                      Guests:{" "}
                    </p> */}
                          <p className="ml-10 text-sm elegant-subheading">
                            {getGuestDisplayText()}
                          </p>
                        </div>
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[300px] p-0 rounded-2xl"
                      align="start"
                    >
                      <div className="p-6 space-y-6">
                        {/* Adults */}
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">
                              Adults
                            </p>
                            <p className="text-sm text-gray-600">
                              {" "}
                              {`>`}13 ages{" "}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setAdults(Math.max(1, adults - 1))}
                              disabled={adults <= 1}
                              className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-600 hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M20 12H4"
                                />
                              </svg>
                            </button>
                            <span className="w-8 text-center font-semibold text-gray-900">
                              {adults}
                            </span>
                            <button
                              onClick={() => setAdults(adults + 1)}
                              className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-600 hover:border-primary hover:text-primary"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 4v16m8-8H4"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Children */}
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">
                              Children
                            </p>
                            <p className="text-sm text-gray-600">2 – 12 ages</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() =>
                                setChildren(Math.max(0, children - 1))
                              }
                              disabled={children <= 0}
                              className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-600 hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M20 12H4"
                                />
                              </svg>
                            </button>
                            <span className="w-8 text-center font-semibold text-gray-900">
                              {children}
                            </span>
                            <button
                              onClick={() => setChildren(children + 1)}
                              className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-600 hover:border-primary hover:text-primary"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 4v16m8-8H4"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Info Note */}
                        {/* <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600">
                      Chỗ ở này cho phép tối đa 3 khách, không tính em bé. 
                    </p>
                  </div> */}

                        {/* Close Button */}
                        <Button
                          onClick={() => setIsGuestPopoverOpen(false)}
                          className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-border rounded-xl"
                        >
                          Close
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
            <Button
              onClick={handleSearch}
              className="rounded-2xl w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 elegant-subheading text-md"
            >
              <Search className="mr-2" size={20} />
              {loading ? "Searching..." : "Search Hotels"}
            </Button>
          </div>

          {/* --- Results --- */}
          {/* {loading ? (
              <p>Loading rooms...</p>
            ) : rooms.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    className="border rounded-xl p-4 shadow hover:shadow-lg transition"
                  >
                    <h3 className="font-semibold text-lg">{room.name}</h3>
                    <p className="text-sm text-gray-600">{room.description}</p>
                    <p className="text-primary font-medium mt-1">
                      ${room.price}/night
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No rooms found.</p>
            )} */}
        </div>
      </section>

      {/* Featured Hotels */}
      <section className="pt-24 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="elegant-heading text-5xl text-foreground mb-6">
              Featured Hotels
            </h2>
            <p className="elegant-subheading text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover our handpicked selection of premium accommodations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms.map((room) => (
              <Card
                key={room.id}
                className="overflow-hidden hover:shadow-xl transition-all duration-500 "
              >
                <div className="relative">
                  <Image
                    src={room.images?.main || "/images/da-nang.jpg"}
                    alt={room.name}
                    width={400}
                    height={600}
                    className="w-full h-64 object-cover rounded-t-2xl"
                  />
                  <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded-full flex items-center gap-1">
                    <Star className="text-yellow-400 fill-current" size={16} />
                    <span className="text-sm font-medium">{room.rating}</span>
                  </div>
                </div>
                <CardContent className="pb-8">
                  <h3 className="elegant-heading text-2xl text-foreground mb-2">
                    {room.name}
                  </h3>
                  <p className="elegant-subheading text-muted-foreground mb-2 flex items-center gap-1">
                    <MapPin size={16} />
                    {room.location.fullAddress}
                  </p>
                  <div className="flex items-center gap-2 mb-4">
                    {(room.amenities || []).map((amenity) => (
                      <div
                        key={amenity.id} // use id as key
                        className="elegant-subheading text-muted-foreground flex items-center gap-1"
                      >
                        <span>{getAmenityIcon(amenity)}</span>
                        <span>{amenity.name}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-2xl elegant-heading text-foreground">
                        {formatPrice(room.price)}
                      </span>
                      <span className="elegant-subheading text-muted-foreground">
                        /night
                      </span>
                    </div>
                    <Button
                      onClick={() => router.push(`/room/${room.id}`)}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground elegant-subheading hover:cursor-pointer rounded-xl"
                    >
                      Book Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="elegant-heading text-5xl text-foreground mb-6">
              Popular Destinations
            </h2>
            <p className="elegant-subheading text-xl text-muted-foreground max-w-2xl mx-auto">
              Explore the world{"'"}s most sought-after travel destinations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {popularDestinations.map((destination) => (
              <Card
                key={destination.id}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="relative">
                  <img
                    src={destination.image || "/placeholder.svg"}
                    alt={destination.name}
                    className="w-full h-72 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-2xl font-bold mb-1">
                      {destination.name}
                    </h3>
                    <p className="text-sm opacity-90">{destination.country}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="elegant-heading text-5xl text-foreground mb-6">
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
