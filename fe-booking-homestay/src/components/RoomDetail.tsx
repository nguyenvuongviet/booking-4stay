"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/context/auth-context";
import { Room } from "@/models/Room";
import { room_available, room_detail } from "@/services/bookingApi";
import { format } from "date-fns";
import {
  Bath,
  BedDouble,
  Building2,
  Calendar,
  Car,
  Check,
  Coffee,
  CookingPot,
  Dumbbell,
  Loader2,
  MapPin,
  Refrigerator,
  Snowflake,
  Sofa,
  Star,
  Sun,
  Tv,
  Users,
  Waves,
  Wifi,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast from "react-hot-toast";
import Header from "./Header";

interface RoomDetailClientProps {
  roomId: string;
}

export function RoomDetailClient({ roomId }: RoomDetailClientProps) {
  const { openSignIn, user } = useAuth();
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [showFullOverview, setShowFullOverview] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("most-relevant");
  const [reviewForm, setReviewForm] = useState({
    userName: "",
    rating: 0,
    comment: "",
  });
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const router = useRouter();
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [isGuestPopoverOpen, setIsGuestPopoverOpen] = useState(false);
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const [available, setAvailable] = useState<boolean | null>(null);
  const checkInRef = useRef<HTMLInputElement>(null);
  const checkOutRef = useRef<HTMLInputElement>(null);
  const [focusCheckIn, setFocusCheckIn] = useState(false);
  const [focusCheckOut, setFocusCheckOut] = useState(false);
  const getTotalGuests = () => adults + children;
  const roomStatus = searchParams.get("status");
  const getGuestDisplayText = () => {
    const total = adults + children;
    return `${total} Guests`;
  };

  const handleSubmitReview = () => {
    console.log("[v0] Submitting review:", reviewForm);
    setIsReviewDialogOpen(false);
    setReviewForm({ userName: "", rating: 0, comment: "" });
  };

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const amenitiesToDisplay = showAllAmenities
    ? room?.amenities ?? []
    : room?.amenities?.slice(0, 5) ?? [];

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
  // const getProgressBarColor = (score: number) => {
  //   if (score >= 9.0) return "bg-green-600";
  //   if (score >= 8.0) return "bg-blue-600";
  //   return "bg-blue-500";
  // };

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setLoading(true);
        const data = await room_detail(roomId);
        setRoom(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [roomId]);

  useEffect(() => {
    const ad = searchParams.get("adults");
    const ch = searchParams.get("children");
    const ci = searchParams.get("checkIn");
    const co = searchParams.get("checkOut");

    if (ci) setCheckIn(new Date(ci));
    if (co) setCheckOut(new Date(co));
    if (ad) setAdults(Number(ad));
    if (ch) setChildren(Number(ch));
  }, [searchParams]);

  if (loading)
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin h-6 w-6 text-primary" />
      </div>
    );

  if (!room) return <p>Room not found</p>;

  const handleRoomSelect = async (roomId: number | string) => {
    if (!checkIn || !checkOut) {
      if (!checkIn) {
        setTimeout(() => checkInRef.current?.focus(), 0);
        return;
      }
      if (!checkOut) {
        setTimeout(() => checkOutRef.current?.focus(), 0);
        return;
      }
    }
    const formattedCheckIn = format(checkIn, "yyyy-MM-dd");
    const formattedCheckOut = format(checkOut, "yyyy-MM-dd");

    const query = new URLSearchParams({
      checkIn: formattedCheckIn,
      checkOut: formattedCheckOut,
      adults: adults.toString(),
      children: children.toString(),
    }).toString();

    router.replace(`/room/${room.id}?${query}`, { scroll: false });

    try {
      setLoading(true);
      const data = await room_available(
        roomId,
        formattedCheckIn,
        formattedCheckOut
      );
      setAvailable(data.available);
      if (!data.available) {
        toast.error(
          "This room is not available for the selected dates or seleted guest."
        );
        return;
      }
      router.push(`/checkout?roomId=${room.id}&${query}`);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Main Content */}
      <div className="container mx-auto py-12 space-y-12 pt-20 px-4 sm:px-6 lg:px-8">
        {/* <SearchBar /> */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-16">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photo Gallery */}
            <div className="relative">
              <div className="grid grid-cols-4 gap-2 h-[400px]">
                <div className="col-span-2 row-span-2">
                  <img
                    src={room.images?.main || "/placeholder.svg"}
                    alt="Hotel main"
                    className="w-full h-full object-cover rounded-l-lg"
                  />
                </div>
                {room.images?.gallery
                  .filter((img) => !img.isMain) // loại bỏ ảnh chính
                  .slice(0, 4)
                  .map((img) => (
                    <img
                      key={img.id}
                      src={img.url || "/placeholder.svg"}
                      alt={`Room ${img.id}`}
                      className="w-full h-full object-cover"
                    />
                  ))}
              </div>
              <Button
                onClick={() => setShowAllPhotos(true)}
                variant="secondary"
                className="absolute bottom-4 right-4 bg-muted hover:cursor-pointer rounded-xl"
              >
                More photos
              </Button>
            </div>

            {/* Hotel Info */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl elegant-heading mb-2">{room.name}</h1>

                  <p className="text-sm elegant-subheading flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {room.location?.fullAddress ?? "Unknown"}
                  </p>
                </div>
                <div className="text-right ">
                  {/* <Badge className="bg-primary elegant-subheading text-muted text-lg px-3 py-1 mb-2">
                    {hotel.rating}
                  </Badge>
                   */}
                  <div className="flex flex-row-reverse mb-2">
                    {room.rating}
                    <Star className="h-4 w-4 fill-chart-4 text-chart-4" />
                  </div>
                  <p className="text-sm elegant-subheading text-muted-foreground">
                    Not Good
                  </p>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="p-4">
              <h2 className="text-2xl elegant-heading mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {amenitiesToDisplay.map((amenity) => (
                  <div
                    key={amenity.id}
                    className="flex items-center gap-2 text-sm text-gray-700"
                  >
                    <span>{getAmenityIcon(amenity)}</span>
                    <span>{amenity.name}</span>
                  </div>
                ))}
                {!showAllAmenities && room?.amenities?.length! > 5 && (
                  <button
                    onClick={() => setShowAllAmenities(true)}
                    className="text-sm elegant-subheading text-primary hover:text-accent hover:cursor-pointer flex items-center gap-1"
                  >
                    <span>...</span>
                    <span>More Amenities</span>
                  </button>
                )}
              </div>
            </div>

            {/* Overview */}
            <div className="p-4">
              <h2 className="text-2xl elegant-heading font-bold mb-4">
                Overview
              </h2>
              <p className="text-sm elegant-subheading leading-relaxed">
                {/* {showFullOverview
                  ? room.overview
                  : room.overview.slice(0, 250) + "..."} */}
                {room.description}
              </p>
              {!showFullOverview && (
                <button
                  onClick={() => setShowFullOverview(true)}
                  className="text-sm elegant-subheading text-primary hover:text-accent hover:cursor-pointer mt-3 font-medium"
                >
                  Show more
                </button>
              )}
            </div>

            {/* Review  */}
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1 sticky top-24">
            <Card className="p-6 sticky top-24">
              <div className="mb-4">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-4xl elegant-heading">
                    {" "}
                    {/* {hotel.pricePerNight.toLocaleString()} VND */}
                    {room.price?.toLocaleString()} VND
                  </span>
                  <span className="text-md elegant-subheading text-muted-foreground">
                    /night
                  </span>
                </div>
                <p className="text-sm elegant-subheading text-muted-foreground">
                  {/* Total: {hotel.totalPrice.toLocaleString()} VND */}
                  Total: {room.price?.toLocaleString()} VND
                </p>
                <p className="text-sm elegant-subheading text-muted-foreground">
                  (1 room x 1 nights incl. taxes & fees)
                </p>
              </div>
              {/* Sold Out Banner */}
              {available === false && (
                <div className="absolute top-4 right-4 flex items-center h-12 bg-gradient-to-r from-red-500 to-red-600 text-white font-extrabold rounded-2xl shadow-xl py-2 px-6 uppercase tracking-wider text-sm animate-pulse">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  SOLD OUT
                </div>
              )}
              {/* Info    */}
              <div className="grid md:grid-cols-2 gap-1">
                <div className="relative">
                  <Calendar
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                    size={20}
                  />
                  <DatePicker
                    selected={checkIn}
                    autoFocus={focusCheckIn}
                    onChange={(date) => {
                      setCheckIn(date);
                      // Reset checkOut nếu nhỏ hơn checkIn
                      if (checkOut && date && checkOut <= date) {
                        setCheckOut(null);
                      }
                    }}
                    selectsStart
                    startDate={checkIn}
                    endDate={checkOut}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Check-in date"
                    className="pl-12 p-6 h-12 text-md elegant-subheading rounded-2xl w-full border border-gray-300 focus:ring-2 focus:ring-primary"
                    minDate={new Date()}
                  />
                </div>
                <div className="relative">
                  <Calendar
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                    size={20}
                  />
                  <DatePicker
                    selected={checkOut}
                    autoFocus={focusCheckOut}
                    onChange={(date) => setCheckOut(date)}
                    selectsEnd
                    startDate={checkIn}
                    endDate={checkOut}
                    minDate={checkIn || new Date()}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Check-out date"
                    onFocus={(e) => {
                      if (!checkIn) {
                        e.target.blur();
                      }
                    }}
                    className={`p-6 h-12 text-md elegant-subheading rounded-2xl w-full border pl-12 ${
                      !checkIn
                        ? "bg-gray-100 cursor-not-allowed opacity-80"
                        : "border-border"
                    } focus:ring-2 focus:ring-primary`}
                  />
                </div>
                <div className="relative md:col-span-2">
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
              {/* Select Room Button */}
              <Button
                onClick={() => {
                  if (!user) {
                    openSignIn();
                  } else {
                    handleRoomSelect(room.id);
                  }
                }}
                className={`w-full h-10 rounded-2xl mb-6 `}
              >
                Select room
              </Button>

              {/* Check-in/out */}
              <div className="border rounded-lg py-2">
                <div className="grid grid-cols-2 divide-x">
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-xs text-muted-foreground mb-1">
                      Check-in
                    </p>
                    <p className="text-lg elegant-sanserif">14:00</p>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-xs text-muted-foreground mb-1">
                      Check-out
                    </p>
                    <p className="text-lg elegant-sanserif">12:00</p>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="mb-4">
                <div className="w-full h-48 bg-gray-200 rounded-lg relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-primary text-white p-2 rounded-full">
                      <MapPin className="h-6 w-6" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Nearby Places */}
              {/* <div>
                <h3 className="font-semibold mb-3 text-sm">Nearby</h3>
                <div className="space-y-2">
                  {hotel.nearbyPlaces.map((place, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-700">{place.name}</span>
                      </div>
                      <span className="text-gray-600">{place.distance}</span>
                    </div>
                  ))}
                </div>
                <button className="text-sm text-teal-600 hover:text-teal-700 mt-3">Show more</button>
              </div> */}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
