"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Location } from "@/models/Location";
import { location, search_location } from "@/services/bookingApi";
import { format } from "date-fns";
import { Calendar, MapPin, Search, Users } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
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
            className="pl-10 h-12 elegant-subheading rounded-4xl"
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
              placeholderText="Check-in date"
              dateFormat="dd/MM/yyyy"
              className="p-6 h-12 text-md elegant-subheading rounded-4xl w-full border border-border focus:ring-2 focus:ring-primary pl-12"
              minDate={new Date()}
            />
          </div>
        </div>
        <div className="relative">
          <Calendar
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none"
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
            className={`p-6 h-12 text-md elegant-subheading rounded-4xl w-full border pl-12 ${
              !checkIn
                ? "bg-gray-100 cursor-not-allowed opacity-80"
                : "border-border"
            } focus:ring-2 focus:ring-primary`}
          />
        </div>
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
              <button className="w-full h-12 px-4 border border-border rounded-4xl focus:border-accent focus:ring-1 focus:ring-accent text-left flex items-center justify-between">
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
            <PopoverContent className="w-[300px] p-0 rounded-2xl" align="start">
              <div className="p-6 space-y-6">
                {/* Adults */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">Adults</p>
                    <p className="text-sm text-gray-600"> {`>`}13 ages </p>
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
                    <p className="font-semibold text-gray-900">Children</p>
                    <p className="text-sm text-gray-600">2 – 12 ages</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setChildren(Math.max(0, children - 1))}
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
        <Button
          onClick={handleSearch}
          className="rounded-4xl w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 elegant-subheading text-md"
        >
          <Search className="mr-1" size={20} />
          Search
        </Button>
      </div>
    </div>
  );
}
