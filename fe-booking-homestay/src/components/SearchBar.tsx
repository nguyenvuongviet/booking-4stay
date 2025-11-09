"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Location } from "@/models/Location";
import { location, search_location } from "@/services/roomApi";
import { format } from "date-fns";
import { Calendar, MapPin, Search, Users } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import GuestPicker from "./GuestPicker";

export function SearchBar() {
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [isGuestPopoverOpen, setIsGuestPopoverOpen] = useState(false);
  const [locations, setLocations] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [locationInput, setLocationInput] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const locationInputRef = useRef<HTMLInputElement>(null);
  const [focusCheckIn, setFocusCheckIn] = useState(false);
  const [focusCheckOut, setFocusCheckOut] = useState(false);

  useEffect(() => {
    const loc = searchParams.get("location");
    const ad = searchParams.get("adults");
    const ch = searchParams.get("children");
    const ci = searchParams.get("checkIn");
    const co = searchParams.get("checkOut");

    if (loc) setLocationInput(decodeURIComponent(loc));
    if (ci) setCheckIn(new Date(ci));
    if (co) setCheckOut(new Date(co));
    if (ad) setAdults(Number(ad));
    if (ch) setChildren(Number(ch));
  }, [searchParams]);

  const getGuestDisplayText = () => {
    const total = adults + children;
    return `${total} Guests`;
  };
  //Hàm fetch gợi ý location
  const fetchLocationSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      //input rỗng
      const res = await location();
      const allData = res.data || [];
      setLocations(allData);
      setShowSuggestions(allData.length > 0);
    } else {
      // có text
      const res = await search_location(query);
      const data = res.data?.data || [];
      setLocations(data);
      setShowSuggestions(data.length > 0);
    }
  }, []);

  //tránh gọi API liên tục khi gõ
  useEffect(() => {
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
    try {
      if (!locationInput.trim()) {
        locationInputRef.current?.focus();
        setShowSuggestions(true);
        return;
      }

      const query = new URLSearchParams({
        location: locationInput,
        ...(checkIn ? { checkIn: format(checkIn, "yyyy-MM-dd") } : {}),
        ...(checkOut ? { checkOut: format(checkOut, "yyyy-MM-dd") } : {}),
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
    <div className="mx-auto max-w-7xl bg-card rounded-4xl shadow-lg p-3">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="col-span-2 relative ">
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
            className="pl-10 h-12 elegant-subheading rounded-4xl placeholder:text-muted border border-border"
          />

          {/* Danh sách gợi ý */}
          {showSuggestions && locations.length > 0 && (
            <ul className="absolute z-50 left-0 right-0 bg-white border border-gray-200 mt-2 rounded-xl shadow-lg max-h-60 overflow-auto">
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

        <div className="relative">
          <Calendar
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            size={20}
          />
          <DatePicker
            selected={checkIn}
            onChange={(dates: [Date | null, Date | null]) => {
              const [start, end] = dates;
              setCheckIn(start);
              setCheckOut(end);
            }}
            startDate={checkIn}
            endDate={checkOut}
            selectsRange
            dateFormat="dd/MM/yyyy"
            placeholderText="Select date"
            className="w-full pl-12 h-12 text-sm md:text-md elegant-subheading rounded-3xl border border-border"
            minDate={new Date()}
            inline={false}
          />
        </div>

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
        <Button
          onClick={handleSearch}
          className="rounded-3xl w-full bg-primary hover:bg-primary/80 h-12 elegant-subheading text-md"
        >
          <Search className="mr-1" size={20} />
          Search
        </Button>
      </div>
    </div>
  );
}
