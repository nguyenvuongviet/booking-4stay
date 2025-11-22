"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { Room } from "@/models/Room";
import { room_available, room_detail } from "@/services/roomApi";
import { Loader2, MapPin, Star, Users } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import toast from "react-hot-toast";
import GuestPicker from "../GuestPicker";
import Header from "../Header";
import DateRangePicker from "../ui/date-range-picker";
import { getAmenityIcon } from "./getAmenityIcon";
import MapRooms from "./MapRoom";
import { PhotoGalleryModal } from "./PhotoGalleryModal";
import { ReviewList } from "./ReviewList";

interface RoomDetailClientProps {
  roomId: string;
}

export function RoomDetailClient({ roomId }: RoomDetailClientProps) {
  const { openSignIn, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // States
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [available, setAvailable] = useState<boolean | null>(true);
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showFullOverview, setShowFullOverview] = useState(false);

  // Refs
  const checkInRef = useRef<HTMLInputElement>(null);
  const checkOutRef = useRef<HTMLInputElement>(null);

  // fetch data
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await room_detail(roomId);
        setRoom(data);
      } catch (error) {
        console.error("Fetch room failed:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [roomId]);

  // Load params from URL
  useEffect(() => {
    const ad = searchParams.get("adults");
    const ch = searchParams.get("children");
    const ci = searchParams.get("checkIn");
    const co = searchParams.get("checkOut");
    const status = searchParams.get("status");

    if (ci) setCheckIn(new Date(ci));
    if (co) setCheckOut(new Date(co));
    if (ad) setAdults(Number(ad));
    if (ch) setChildren(Number(ch));
    setAvailable(status ? status === "Available" : true);
  }, [searchParams]);

  // Utils
  const getGuestDisplayText = () => `${adults + children} Guests`;

  const updateURL = (params: Record<string, string>) => {
    router.replace(
      `/room/${roomId}?${new URLSearchParams(params).toString()}`,
      {
        scroll: false,
      }
    );
  };

  const amenitiesToDisplay = showAllAmenities
    ? room?.amenities ?? []
    : room?.amenities?.slice(0, 5) ?? [];

  const checkRoomAvailable = async (inDate?: Date, outDate?: Date) => {
    const checkInDate = inDate || checkIn;
    const checkOutDate = outDate || checkOut;
    if (!checkInDate || !checkOutDate) return;

    try {
      setLoading(true);
      const data = await room_available(
        roomId,
        checkInDate.toISOString(),
        checkOutDate.toISOString()
      );
      const status = data.available ? "Available" : "SoldOut";
      setAvailable(data.available);

      if (!data.available) {
        toast.error("This room is not available for the selected dates");
      }

      updateURL({
        checkIn: checkInDate.toISOString(),
        checkOut: checkOutDate.toISOString(),
        adults: adults.toString(),
        children: children.toString(),
        status,
      });
    } catch (error) {
      console.error("Check availability failed:", error);
    } finally {
      setLoading(false);
    }
  };

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

    if (adults > (room!.adultCapacity || 0)) {
      toast.error(
        `This room only allows up to ${room!.adultCapacity} adult${
          room!.adultCapacity > 1 ? "s" : ""
        }.`
      );
      return;
    }

    if (children > (room?.childCapacity || 0)) {
      toast.error(
        `This room only allows up to ${room?.childCapacity} children .`
      );
      return;
    }

    updateURL({
      checkIn: checkIn.toISOString(),
      checkOut: checkOut.toISOString(),
      adults: adults.toString(),
      children: children.toString(),
      status,
    });

    try {
      setLoading(true);
      const data = await room_available(
        roomId,
        checkIn.toISOString(),
        checkOut.toISOString()
      );
      setAvailable(data.available);
      if (!data.available) {
        toast.error(
          "This room is not available for the selected dates or seleted guest."
        );
        return;
      }
      router.push(
        `/checkout?${new URLSearchParams({
          roomId: String(roomId),
          checkIn: checkIn?.toISOString() ?? "",
          checkOut: checkOut?.toISOString() ?? "",
          adults: String(adults),
          children: String(children),
        })}`
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin h-6 w-6 text-primary" />
      </div>
    );

  if (!room) return <p>Room not found</p>;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Main Content */}
      <div className="container max-w-7xl mx-auto py-12 space-y-12 pt-20 px-4 sm:px-6 lg:px-8">
        {/* <SearchBar /> */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-16">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photo Gallery */}
            <div className="relative">
              <div className="grid grid-cols-4 gap-2 h-[400px]">
                {" "}
                {/* cố định height */}
                <div className="col-span-2 row-span-2 overflow-hidden rounded-l-lg">
                  <img
                    src={room.images?.main || "/default.jpg"}
                    alt="room image"
                    className="w-full h-full object-cover" // scale vừa container
                  />
                </div>
                {room.images?.gallery
                  .filter((img) => !img.isMain)
                  .slice(0, 4)
                  .map((img) => (
                    <div key={img.id} className="overflow-hidden rounded">
                      <img
                        src={img.url || "/placeholder.svg"}
                        alt={`Room ${img.id}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
              </div>

              <Button
                onClick={() => setIsPhotoModalOpen(true)}
                variant="secondary"
                className="absolute bottom-4 right-4 bg-background hover:cursor-pointer rounded-xl"
              >
                More photos
              </Button>

              {room?.images?.gallery && (
                <PhotoGalleryModal
                  images={room.images.gallery}
                  initialIndex={currentPhotoIndex}
                  isOpen={isPhotoModalOpen}
                  onClose={() => setIsPhotoModalOpen(false)}
                />
              )}
            </div>

            {/* Room Info */}
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
                  <div className="flex flex-row-reverse items-center elegant-sans mb-2">
                    {room.rating}
                    <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                  </div>
                  <p className="text-sm elegant-subheading text-muted-foreground">
                    {/* Not Good */}
                  </p>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="p-4">
              <h2 className="text-xl elegant-sans mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {amenitiesToDisplay.map((amenity) => (
                  <div
                    key={amenity.id}
                    className="flex items-center gap-2 text-sm elegant-subheading text-muted-foreground"
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
              <h2 className="text-xl elegant-sans  mb-4">Overview</h2>
              <p className="text-sm elegant-subheading leading-relaxed text-muted-foreground">
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
            <ReviewList roomId={roomId} />
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1 sticky top-24">
            <Card className="p-6 sticky top-24">
              <div className="mb-4">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-4xl elegant-sans text-secondary-foreground">
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
                <div className="absolute top-4 right-4 flex items-center h-10 bg-gradient-to-r from-red-500 to-red-600 text-white elegant-sans rounded-2xl shadow-xl py-2 px-4 uppercase tracking-wider text-sm animate-pulse">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="relative md:col-span-1">
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
                <div className="relative md:col-span-1">
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

              {/* Select Room Button */}
              <Button
                onClick={() => {
                  if (available === false) {
                    toast.error(
                      "This room is sold out. Please choose other dates."
                    );
                    return;
                  }
                  if (!user) {
                    openSignIn();
                  } else {
                    handleRoomSelect(room.id);
                  }
                }}
                disabled={available === false}
                className={`w-full h-10 rounded-3xl mb-6 hover:bg-primary/80 ${
                  available === false
                    ? "bg-muted cursor-not-allowed hover:bg-muted"
                    : ""
                }`}
              >
                {available === false ? "Sold Out" : "Select room"}
              </Button>

              {/* Check-in/out */}
              <div className="border rounded-lg py-2">
                <div className="grid grid-cols-2 divide-x">
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-xs text-muted-foreground mb-1">
                      Check-in
                    </p>
                    <p className="text-lg elegant-sans">14:00</p>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-xs text-muted-foreground mb-1">
                      Check-out
                    </p>
                    <p className="text-lg elegant-sans">12:00</p>
                  </div>
                </div>
              </div>

              {/* Map */}
              <MapRooms rooms={[room]} height="h-[30vh]" />

              {/* Policy */}
              <div className="p-4">
                <div className="flex items-center gap-2 ">
                  {/* <Info className="w-4 h-4" /> */}
                  <h2 className="text-xl elegant-sans mb-2">
                    Cancellation Policy
                  </h2>
                </div>
                <ul className="list-disc pl-5 space-y-1 elegant-subheading text-sm text-muted-foreground">
                  <li>Cancel 7+ days before check-in → Full refund (100%).</li>
                  <li>Cancel 3–6 days before check-in → 50% refund.</li>
                  <li>Cancel within 2 days → No refund.</li>
                </ul>
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
