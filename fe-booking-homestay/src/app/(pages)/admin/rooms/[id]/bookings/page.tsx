"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";

export default function RoomBookingsPage({
  params,
}: {
  params: { id: string };
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const bookings = [
    {
      id: "BK001",
      guest: "John Doe", 
      email: "john@example.com",
      checkIn: "2025-01-15",
      checkOut: "2025-01-18",
      nights: 3,
      totalPrice: 750,
      status: "Confirmed",
    },
    {
      id: "BK002",
      guest: "Jane Smith",
      email: "jane@example.com",
      checkIn: "2025-01-20",
      checkOut: "2025-01-23",
      nights: 3,
      totalPrice: 750,
      status: "Pending",
    },
    {
      id: "BK003",
      guest: "Mike Johnson",
      email: "mike@example.com",
      checkIn: "2025-02-01",
      checkOut: "2025-02-05",
      nights: 4,
      totalPrice: 1000,
      status: "Confirmed",
    },
  ];

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.guest.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Room Bookings</h1>
        <p className="text-muted-foreground mt-1">
          Manage all bookings for this room
        </p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by guest name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Checked-in">Checked-in</option>
              <option value="Checked-out">Checked-out</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Bookings Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold">
                  Booking ID
                </th>
                <th className="text-left py-3 px-4 font-semibold">Guest</th>
                <th className="text-left py-3 px-4 font-semibold">Check-in</th>
                <th className="text-left py-3 px-4 font-semibold">Check-out</th>
                <th className="text-left py-3 px-4 font-semibold">Nights</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Total Price
                </th>
                <th className="text-left py-3 px-4 font-semibold">Status</th>
                <th className="text-left py-3 px-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr
                  key={booking.id}
                  className="border-b border-border hover:bg-muted/50 transition-colors"
                >
                  <td className="py-3 px-4 font-medium">{booking.id}</td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium">{booking.guest}</p>
                      <p className="text-xs text-muted-foreground">
                        {booking.email}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4">{booking.checkIn}</td>
                  <td className="py-3 px-4">{booking.checkOut}</td>
                  <td className="py-3 px-4">{booking.nights}</td>
                  <td className="py-3 px-4 font-semibold">
                    ${booking.totalPrice}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        booking.status === "Confirmed"
                          ? "bg-green-100 text-green-800"
                          : booking.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Button className="text-xs bg-primary text-primary-foreground hover:bg-primary/90">
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
