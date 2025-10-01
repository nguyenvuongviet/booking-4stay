"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Search, Users, X } from "lucide-react";
import { useState } from "react";

export function SearchBar() {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");

  return (
    <div className="mx-auto max-w-7xl bg-card rounded-4xl shadow-lg p-3">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="col-span-2 relative flex">
          <MapPin
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            size={20}
          />
          <Input
            placeholder="Where are you going?"
            className="pl-10 h-12 elegant-subheading rounded-4xl"
          />
        </div>
        <div className="relative">
          <Input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="p-6 h-12 text-md elegant-subheading rounded-4xl"
          />
        </div>
        <div className="relative">
          <Input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="p-6 h-12 text-md elegant-subheading rounded-4xl"
          />
        </div>
        <div className="relative">
          <Users
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            size={20}
          />
          <select className="w-full h-12 pl-12 pr-4 border border-border rounded-4xl focus:border-accent focus:ring-1 focus:ring-accent">
            <option>1 Guests</option>
            <option>2 Guest</option>
            <option>3 Guests</option>
            <option>4+ Guests</option>
          </select>
        </div>
        <Button className="rounded-4xl w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 elegant-subheading text-md">
          <Search className="mr-1" size={20} />
          Search
        </Button>
      </div>
    </div>
  );
}
