"use client"

import { useState } from "react"
import { Search, MapPin, Calendar, Users, Star, Wifi, Car, Coffee, Dumbbell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { AuthModals } from "@/components/auth-modals"

interface Hotel {
  id: number
  name: string
  location: string
  rating: number
  price: number
  image: string
  amenities: string[]
}

interface Destination {
  id: number
  name: string
  country: string
  hotels: number
  image: string
}

export default function HomePage() {
  const [showSignIn, setShowSignIn] = useState(false)
  const [showSignUp, setShowSignUp] = useState(false)
  const [showOTP, setShowOTP] = useState(false)

  const featuredHotels: Hotel[] = [
    {
      id: 1,
      name: "Grand Plaza Hotel",
      location: "New York, USA",
      rating: 4.8,
      price: 299,
      image: "/luxury-hotel-exterior.png",
      amenities: ["wifi", "parking", "restaurant", "gym"],
    },
    {
      id: 2,
      name: "Ocean View Resort",
      location: "Miami, USA",
      rating: 4.6,
      price: 199,
      image: "/beach-resort-ocean-view.png",
      amenities: ["wifi", "restaurant", "gym"],
    },
    {
      id: 3,
      name: "Mountain Lodge",
      location: "Aspen, USA",
      rating: 4.9,
      price: 399,
      image: "/placeholder-5z82i.png",
      amenities: ["wifi", "parking", "restaurant"],
    },
  ]

  const popularDestinations: Destination[] = [
    {
      id: 1,
      name: "Paris",
      country: "France",
      hotels: 1250,
      image: "/paris-eiffel-cityscape.png",
    },
    {
      id: 2,
      name: "Tokyo",
      country: "Japan",
      hotels: 980,
      image: "/placeholder-gyy6m.png",
    },
    {
      id: 3,
      name: "London",
      country: "United Kingdom",
      hotels: 1100,
      image: "/placeholder-b0n1p.png",
    },
  ]

  const getAmenityIcon = (amenity: string) => {
    switch (amenity) {
      case "wifi":
        return <Wifi size={16} />
      case "parking":
        return <Car size={16} />
      case "restaurant":
        return <Coffee size={16} />
      case "gym":
        return <Dumbbell size={16} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-[#3f9bda]">4Stay</span>
            </div>

            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-[#667085] hover:text-[#344054] font-medium">
                Home
              </a>
              <a href="#" className="text-[#667085] hover:text-[#344054] font-medium">
                Hotels
              </a>
              <a href="#" className="text-[#667085] hover:text-[#344054] font-medium">
                Rooms
              </a>
              <a href="#" className="text-[#667085] hover:text-[#344054] font-medium">
                About
              </a>
              <a href="#" className="text-[#667085] hover:text-[#344054] font-medium">
                Contact
              </a>
            </nav>

            <Button className="bg-[#3f9bda] hover:bg-[#2980b9] text-white px-6" onClick={() => setShowSignIn(true)}>
              Sign in
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#3f9bda] to-[#2980b9] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 text-balance">Find Your Perfect Stay</h1>
            <p className="text-xl opacity-90 text-pretty">
              Discover amazing hotels, resorts, and accommodations worldwide
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#667085]" size={20} />
                <Input
                  placeholder="Where are you going?"
                  className="pl-10 border-[#d0d5dd] focus:border-[#3f9bda] text-[#344054]"
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#667085]" size={20} />
                <Input type="date" className="pl-10 border-[#d0d5dd] focus:border-[#3f9bda] text-[#344054]" />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#667085]" size={20} />
                <Input type="date" className="pl-10 border-[#d0d5dd] focus:border-[#3f9bda] text-[#344054]" />
              </div>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#667085]" size={20} />
                <select className="w-full h-9 pl-10 pr-3 border border-[#d0d5dd] rounded-md focus:border-[#3f9bda] focus:ring-1 focus:ring-[#3f9bda] text-[#344054]">
                  <option>2 Guests</option>
                  <option>1 Guest</option>
                  <option>3 Guests</option>
                  <option>4+ Guests</option>
                </select>
              </div>
            </div>
            <div className="mt-6 text-center">
              <Button className="bg-[#3f9bda] hover:bg-[#2980b9] text-white px-12 py-3 text-lg">
                <Search className="mr-2" size={20} />
                Search Hotels
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Hotels */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#344054] mb-4">Featured Hotels</h2>
            <p className="text-[#667085] text-lg">Discover our handpicked selection of premium accommodations</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredHotels.map((hotel) => (
              <Card key={hotel.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img src={hotel.image || "/placeholder.svg"} alt={hotel.name} className="w-full h-48 object-cover" />
                  <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded-full flex items-center gap-1">
                    <Star className="text-yellow-400 fill-current" size={16} />
                    <span className="text-sm font-medium">{hotel.rating}</span>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-[#344054] mb-2">{hotel.name}</h3>
                  <p className="text-[#667085] mb-4 flex items-center gap-1">
                    <MapPin size={16} />
                    {hotel.location}
                  </p>
                  <div className="flex items-center gap-2 mb-4">
                    {hotel.amenities.map((amenity) => (
                      <div key={amenity} className="text-[#667085]">
                        {getAmenityIcon(amenity)}
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-2xl font-bold text-[#344054]">${hotel.price}</span>
                      <span className="text-[#667085]">/night</span>
                    </div>
                    <Button className="bg-[#3f9bda] hover:bg-[#2980b9] text-white">Book Now</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#344054] mb-4">Popular Destinations</h2>
            <p className="text-[#667085] text-lg">Explore the world's most sought-after travel destinations</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {popularDestinations.map((destination) => (
              <Card key={destination.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <div className="relative">
                  <img
                    src={destination.image || "/placeholder.svg"}
                    alt={destination.name}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-2xl font-bold mb-1">{destination.name}</h3>
                    <p className="text-sm opacity-90">{destination.country}</p>
                    <p className="text-sm opacity-90">{destination.hotels} hotels available</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#344054] mb-4">Why Choose 4Stay?</h2>
            <p className="text-[#667085] text-lg">Experience the difference with our premium booking platform</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-[#3f9bda] text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={24} />
              </div>
              <h3 className="text-xl font-semibold text-[#344054] mb-2">Easy Search</h3>
              <p className="text-[#667085]">
                Find the perfect accommodation with our intuitive search and filtering system
              </p>
            </div>
            <div className="text-center">
              <div className="bg-[#3f9bda] text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star size={24} />
              </div>
              <h3 className="text-xl font-semibold text-[#344054] mb-2">Best Prices</h3>
              <p className="text-[#667085]">Get the best deals and exclusive offers on premium hotels worldwide</p>
            </div>
            <div className="text-center">
              <div className="bg-[#3f9bda] text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users size={24} />
              </div>
              <h3 className="text-xl font-semibold text-[#344054] mb-2">24/7 Support</h3>
              <p className="text-[#667085]">Our dedicated support team is available around the clock to assist you</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#344054] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <span className="text-2xl font-bold text-[#3f9bda]">4Stay</span>
              <p className="mt-4 text-gray-300">
                Your trusted partner for finding the perfect accommodation worldwide.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <a href="#" className="hover:text-white">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Destinations</h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <a href="#" className="hover:text-white">
                    New York
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Paris
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Tokyo
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    London
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <a href="#" className="hover:text-white">
                    Customer Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Booking Help
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Cancellation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-600 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2024 4Stay. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Auth Modals */}
      <AuthModals
        showSignIn={showSignIn}
        showSignUp={showSignUp}
        showOTP={showOTP}
        setShowSignIn={setShowSignIn}
        setShowSignUp={setShowSignUp}
        setShowOTP={setShowOTP}
      />
    </div>
  )
}
