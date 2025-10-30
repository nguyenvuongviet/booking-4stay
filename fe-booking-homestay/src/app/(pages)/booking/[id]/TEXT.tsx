"use client";

import { BookingCancelSection } from "@/components/bookings/BookingCancelSection";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function BookingDetailPage() {
  const router = useRouter();

  // --- Mock booking data (data cứng) ---
  const booking = {
    id: 101,
    status: "CONFIRMED", // PENDING | CONFIRMED | CANCELLED | COMPLETED
    checkIn: "2025-11-10",
    checkOut: "2025-11-13",
    totalAmount: 4500000,
    totalNights: 3,
    adults: 2,
    children: 1,
    paymentMethod: "Momo",
    guestName: "Nguyen Van A",
    room: {
      name: "Deluxe Sea View Room",
      price: 1500000,
      images: [
        {
          url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=60",
          isMain: true,
        },
      ],
    },
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 text-green-700";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";
      case "CANCELLED":
        return "bg-red-100 text-red-700";
      case "COMPLETED":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => router.push("/history")}
            className="flex items-center gap-2 text-gray-900 hover:text-primary hover:cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Back to History</span>
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 space-y-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold">Booking Details</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - Booking Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Info */}
            <Card className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Room Information</h2>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
                    booking.status
                  )}`}
                >
                  {booking.status}
                </span>
              </div>

              <div className="flex gap-6">
                <img
                  src={booking.room.images[0].url}
                  alt={booking.room.name}
                  className="w-48 h-32 object-cover rounded-xl"
                />
                <div>
                  <h3 className="text-lg font-semibold">{booking.room.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Price per night:{" "}
                    <span className="font-medium text-gray-900">
                      đ {booking.room.price.toLocaleString()}
                    </span>
                  </p>
                </div>
              </div>
            </Card>

            {/* Booking Details */}
            <Card className="p-6 space-y-4">
              <h2 className="text-2xl font-semibold mb-2">
                Booking Information
              </h2>
              <div className="grid grid-cols-2 gap-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Check-in:</span>
                  <span className="font-medium text-gray-900">
                    {booking.checkIn}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Check-out:</span>
                  <span className="font-medium text-gray-900">
                    {booking.checkOut}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Total nights:</span>
                  <span className="font-medium text-gray-900">
                    {booking.totalNights}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Guests:</span>
                  <span className="font-medium text-gray-900">
                    {booking.adults} adults, {booking.children} children
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-semibold text-gray-900">
                    đ {booking.totalAmount.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium text-gray-900">
                    {booking.paymentMethod}
                  </span>
                </div>
              </div>
            </Card>

            {/* Guest Info */}
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-2">Guest Information</h2>
              <p className="text-gray-700 text-sm">
                Guest name:{" "}
                <span className="font-medium text-gray-900">
                  {booking.guestName}
                </span>
              </p>
            </Card>

            {/* Cancel Booking Button */}
            {booking.status === "CONFIRMED" && (
              <BookingCancelSection bookingId={booking.id} />
            )}
          </div>

          {/* Right Side - Summary */}
          <div className="lg:col-span-1 sticky top-20">
            <Card className="p-6 space-y-4">
              <h2 className="text-2xl font-semibold">Booking Summary</h2>
              <div className="w-full h-48 rounded-lg overflow-hidden">
                <img
                  src={booking.room.images[0].url}
                  alt="Room"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  Room:{" "}
                  <span className="font-medium text-gray-900">
                    {booking.room.name}
                  </span>
                </p>
                <p>
                  Check-in:{" "}
                  <span className="font-medium text-gray-900">
                    {booking.checkIn}
                  </span>
                </p>
                <p>
                  Check-out:{" "}
                  <span className="font-medium text-gray-900">
                    {booking.checkOut}
                  </span>
                </p>
                <p>
                  Nights:{" "}
                  <span className="font-medium text-gray-900">
                    {booking.totalNights}
                  </span>
                </p>
                <p>
                  Total:{" "}
                  <span className="font-semibold text-gray-900">
                    đ {booking.totalAmount.toLocaleString()}
                  </span>
                </p>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
