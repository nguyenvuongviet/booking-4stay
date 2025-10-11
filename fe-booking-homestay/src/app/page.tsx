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
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");
  const router = useRouter();

  const featuredHotels: Hotel[] = [
    {
      id: 1,
      name: "4Stay Homestay",
      location: "1 District, Ho Chi Minh City",
      rating: 4.8,
      price: 1500000,
      image: "/images/home-hcm-1.jpg",
      amenities: ["wifi", "parking", "restaurant", "gym"],
    },
    {
      id: 2,
      name: "4Stay Hotel",
      location: "Hoan Kiem, Ha Noi",
      rating: 4.6,
      price: 1000000,
      image: "/images/home-hanoi-1.jpg",
      amenities: ["wifi", "restaurant", "gym"],
    },
    {
      id: 3,
      name: "4Stay Villa",
      location: "Son Tra, Da Nang",
      rating: 4.9,
      price: 900000,
      image: "/images/home-dn.jpg",
      amenities: ["wifi", "parking", "restaurant"],
    },
    {
      id: 4,
      name: "4Stay Homestay",
      location: "1 District, Ho Chi Minh City",
      rating: 4.8,
      price: 1500000,
      image: "/images/home-hcm-1.jpg",
      amenities: ["wifi", "parking", "restaurant", "gym"],
    },
    {
      id: 5,
      name: "4Stay Hotel",
      location: "Hoan Kiem, Ha Noi",
      rating: 4.6,
      price: 1000000,
      image: "/images/home-hanoi-1.jpg",
      amenities: ["wifi", "restaurant", "gym"],
    },
    {
      id: 6,
      name: "4Stay Villa",
      location: "Son Tra, Da Nang",
      rating: 4.9,
      price: 900000,
      image: "/images/home-dn.jpg",
      amenities: ["wifi", "parking", "restaurant"],
    },
  ];

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
  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} VND`;
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
                    placeholder="Where are you going?"
                    className="pl-10 h-12 border-border focus:border-accent elegant-subheading rounded-2xl"
                  />
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
                  <select className="w-full h-12 pl-12 pr-4 border border-border rounded-2xl focus:border-accent focus:ring-1 focus:ring-accent">
                    <option>2 Guests</option>
                    <option>1 Guest</option>
                    <option>3 Guests</option>
                    <option>4+ Guests</option>
                  </select>
                </div>
              </div>
            </div>
            <Button className="rounded-2xl w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 elegant-subheading text-md">
              <Search className="mr-2" size={20} />
              Search Hotels
            </Button>
          </div>
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
            {featuredHotels.map((hotel) => (
              <Card
                key={hotel.id}
                
                className="overflow-hidden hover:shadow-xl transition-all duration-500 "
              >
                <div className="relative">
                  <Image
                    src={hotel.image || "/placeholder.svg"}
                    alt={hotel.name}
                    width={400}
                    height={600}
                    className="w-full h-64 object-cover rounded-t-2xl"
                  />
                  <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded-full flex items-center gap-1">
                    <Star className="text-yellow-400 fill-current" size={16} />
                    <span className="text-sm font-medium">{hotel.rating}</span>
                  </div>
                </div>
                <CardContent className="pb-8">
                  <h3 className="elegant-heading text-2xl text-foreground mb-2">
                    {hotel.name}
                  </h3>
                  <p className="elegant-subheading text-muted-foreground mb-2 flex items-center gap-1">
                    <MapPin size={16} />
                    {hotel.location}
                  </p>
                  <div className="flex items-center gap-2 mb-4">
                    {hotel.amenities.map((amenity) => (
                      <div
                        key={amenity}
                        className="elegant-subheading text-muted-foreground"
                      >
                        {getAmenityIcon(amenity)}
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-2xl elegant-heading text-foreground">
                        {formatPrice(hotel.price)}
                      </span>
                      <span className="elegant-subheading text-muted-foreground">
                        /night
                      </span>
                    </div>
                    <Button 
                    onClick={() => router.push(`/room/${hotel.id}`)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground elegant-subheading hover:cursor-pointer rounded-xl">
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
