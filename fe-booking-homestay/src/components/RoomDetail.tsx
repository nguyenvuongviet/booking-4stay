"use client";

import React, { useState } from "react";
import {
  Search,
  Star,
  MapPin,
  Users,
  X,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "./SearchBar";
import { Input } from "@/components/ui/input";
import Header from "./Header";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useRouter } from "next/navigation";

interface RoomDetailClientProps {
  roomId: string;
}

export function RoomDetailClient({ roomId }: RoomDetailClientProps) {
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [showFullOverview, setShowFullOverview] = useState(false);
  const [isReviewsPopoverOpen, setIsReviewsPopoverOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("most-relevant");
  const [reviewForm, setReviewForm] = useState({
    userName: "",
    rating: 0,
    comment: "",
  });
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("");
  const router = useRouter();

  // Mock hotel data - in real app, fetch based on hotelId
  const hotel = {
    id: roomId,
    name: "Binh Minh Hotel Binh Thanh Ho Chi Minh",
    address: "266 Nguyen Xi, Ward 13, Ho Chi Minh City, Vietnam",
    rating: 7.0,
    stars: 2,
    pricePerNight: 333236,
    totalPrice: 333236,
    checkIn: "14:00",
    checkOut: "12:00",
    images: [
      "/images/home-hanoi-1.jpg",
      "/images/home-hcm-1.jpg",
      "/images/home-dn.jpg",
      "/images/home-dn-2.jpg",
      "/images/ho-chi-minh.jpg",
      "/images/da-nang.jpg",
    ],
    amenities: [
      { name: "Transfer shower", icon: "🚿" },
      { name: "Roll-in shower", icon: "♿" },
      { name: "Pet-friendly [charges apply]", icon: "🐕" },
      { name: "Kettle", icon: "☕" },
      { name: "Mirror", icon: "🪞" },
      { name: "Air conditioning", icon: "❄️" },
      { name: "Free WiFi", icon: "📶" },
      { name: "24-hour front desk", icon: "🏨" },
    ],
    nearbyPlaces: [
      { name: "Satrafoods", distance: "230 m" },
      { name: "Đạt Jewelry & Watches", distance: "370 m" },
      { name: "Siêu Thị Mini Bình Minh", distance: "500 m" },
    ],
    overview:
      "Great care is taken to ensure guests experience comfort through top-notch services and amenities. Stay connected with your associates, as complimentary Wi-Fi is available during your entire visit. To facilitate your arrival and departure, you can pre-book airport transfer services prior to checking in. The hotel offers taxi, car hire and shuttle amenities for your ease in navigating around Ho Chi Minh...",
    reviews: {
      overall: 9.2,
      totalReviews: 1840,
      ratingLabel: "Wonderful",
      categories: [
        { name: "Staff", score: 9.3 },
        { name: "Facilities", score: 9.4 },
        { name: "Cleanliness", score: 9.6 },
        { name: "Comfort", score: 9.6 },
        { name: "Value for money", score: 9.2 },
        { name: "Location", score: 9.7 },
        { name: "Free Wifi", score: 9.5 },
      ],
      items: [
        {
          id: "1",
          userName: "Duncan",
          userCountry: "Czech Republic",
          userFlag: "🇨🇿",
          rating: 10,
          date: "October 5, 2025",
          title: "I hope to be back very soon, I love this hotel",
          roomType:
            "Sea Garden Deluxe Double Room - Daily Afternoon Tea Inclusive",
          stayDuration: "3 nights · October 2025",
          travelerType: "Solo traveler",
          positiveComment:
            "Location is great, rooms are amazing, food is outstanding, one of the nicest hotels I've ever stayed in",
          negativeComment:
            "You would struggle to find something here you disliked the hotel is incredible",
          photos: [
            "/expansive-ocean-vista.png",
            "/sunset-beach-tranquil.png",
            "/hotel-pool.png",
            "/hotel-food.jpg",
          ],
          helpful: 24,
        },
        {
          id: "2",
          userName: "Clare",
          userCountry: "United States",
          userFlag: "🇺🇸",
          rating: 10,
          date: "October 4, 2025",
          title: "We had a fantastic honeymoon retreat!",
          roomType:
            "Deluxe Double Room Oceanfront with Bathtub - Daily Afternoon Tea Inclusive",
          stayDuration: "4 nights · October 2025",
          travelerType: "Couple",
          positiveComment: "It had everything you wanted/needed and more!",
          helpful: 18,
        },
        {
          id: "3",
          userName: "Kathyrine",
          userCountry: "United Arab Emirates",
          userFlag: "🇦🇪",
          rating: 9.5,
          date: "September 28, 2025",
          title: "Perfect location right on the beach",
          roomType: "Superior Double Room",
          stayDuration: "2 nights · September 2025",
          travelerType: "Family",
          positiveComment:
            "In general the place is perfect right infront the beach, located where tours can pick you up and drop off. Able to walk nearby restos and bars. Tea time is a must try!",
          helpful: 12,
        },
      ],
    },
  };
  const amenitiesToDisplay = showAllAmenities
    ? hotel.amenities
    : hotel.amenities.slice(0, 5);

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

  const getProgressBarColor = (score: number) => {
    if (score >= 9.0) return "bg-green-600";
    if (score >= 8.0) return "bg-blue-600";
    return "bg-blue-500";
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Main Content */}
      <div className="container mx-auto py-12 space-y-12 pt-20 px-4 sm:px-6 lg:px-8">
        <SearchBar />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photo Gallery */}
            <div className="relative">
              <div className="grid grid-cols-4 gap-2 h-[400px]">
                <div className="col-span-2 row-span-2">
                  <img
                    src={hotel.images[0] || "/placeholder.svg"}
                    alt="Hotel main"
                    className="w-full h-full object-cover rounded-l-lg"
                  />
                </div>
                {hotel.images.slice(1, 5).map((img, idx) => (
                  <img
                    key={idx}
                    src={img || "/placeholder.svg"}
                    alt={`Hotel ${idx + 2}`}
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
                  <h1 className="text-3xl elegant-heading mb-2">
                    {hotel.name}
                  </h1>

                  <p className="text-sm elegant-subheading flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {hotel.address}
                  </p>
                </div>
                <div className="text-right ">
                  {/* <Badge className="bg-primary elegant-subheading text-muted text-lg px-3 py-1 mb-2">
                    {hotel.rating}
                  </Badge>
                   */}
                  <div className="flex flex-row-reverse mb-2">
                    {Array.from({ length: hotel.stars }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-chart-4 text-chart-4"
                      />
                    ))}
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
                {amenitiesToDisplay.map((amenity, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-sm text-gray-700"
                  >
                    <span>{amenity.icon}</span>
                    <span>{amenity.name}</span>
                  </div>
                ))}
                {!showAllAmenities && (
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
                {showFullOverview
                  ? hotel.overview
                  : hotel.overview.slice(0, 250) + "..."}
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
                    {hotel.pricePerNight.toLocaleString()} VND
                  </span>
                  <span className="text-md elegant-subheading text-muted-foreground">
                    /night
                  </span>
                </div>
                <p className="text-sm elegant-subheading text-muted-foreground">
                  Total: đ {hotel.totalPrice.toLocaleString()}
                </p>
                <p className="text-sm elegant-subheading text-muted-foreground">
                  (1 room x 1 nights incl. taxes & fees)
                </p>
              </div>
              {/* Info    */}
              <div className="grid md:grid-cols-2 gap-1">
                <div className="relative">
                  <Input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="p-6 h-12 text-md elegant-subheading rounded-2xl"
                  />
                </div>
                <div className="relative">
                  <Input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="p-6 h-12 text-md elegant-subheading rounded-2xl"
                  />
                </div>
                <div className="relative md:col-span-2">
                  <Users
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                    size={20}
                  />
                  <select className="w-full h-12 pl-12 pr-4 border border-border rounded-2xl focus:border-accent focus:ring-1 focus:ring-accent">
                    <option>1 Guests</option>
                    <option>2 Guest</option>
                    <option>3 Guests</option>
                    <option>4+ Guests</option>
                  </select>
                </div>
              </div>

              <Button
                onClick={() => router.push(`/checkout`)}
                className="w-full h-10 rounded-2xl mb-6"
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
                    <p className="text-lg elegant-sanserif">{hotel.checkIn}</p>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-xs text-muted-foreground mb-1">
                      Check-out
                    </p>
                    <p className="text-lg elegant-sanserif">{hotel.checkOut}</p>
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
