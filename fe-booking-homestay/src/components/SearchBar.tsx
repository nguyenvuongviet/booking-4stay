"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Location } from "@/models/Location";
import { location, search_location } from "@/services/roomApi";
import { format } from "date-fns";
import { useTransform, useViewportScroll } from "framer-motion";
import { MapPin, Search, Users } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import GuestPicker from "./GuestPicker";
import LocationSuggestions from "./LocationSuggestions";
import DateRangePicker from "./ui/date-range-picker";
import { useLang } from "@/context/lang-context";

interface SearchBarProps {
  compact?: boolean; // nếu true: mini bar
}
export function SearchBar({ compact = false }: SearchBarProps) {
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [locations, setLocations] = useState<Location[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [locationInput, setLocationInput] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const locationInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const ci = searchParams.get("checkIn");
  const co = searchParams.get("checkOut");
  const {t} = useLang();

  const [checkIn, setCheckIn] = useState<Date | null>(
    ci ? new Date(ci + "T00:00") : null
  );
  const [checkOut, setCheckOut] = useState<Date | null>(
    co ? new Date(co + "T00:00") : null
  );
  // scroll smooth animation
  const { scrollY } = useViewportScroll();

  useEffect(() => {
    const loc = searchParams.get("location");
    const ad = searchParams.get("adults");
    const ch = searchParams.get("children");
    const ci = searchParams.get("checkIn");
    const co = searchParams.get("checkOut");
    console.log("URL checkIn, checkOut:", ci, co);

    if (loc) setLocationInput(decodeURIComponent(loc));
    setCheckIn(ci ? new Date(ci) : null);
    setCheckOut(co ? new Date(co) : null);
    if (ad) setAdults(Number(ad));
    if (ch) setChildren(Number(ch));
  }, [searchParams]);

  //Hàm fetch gợi ý location
  const fetchLocationSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      //input rỗng
      const res = await location();
      const allData = res?.data?.data || [];
      setLocations(allData);
      setShowSuggestions(allData.length > 0);
    } else {
      //có text
      const res = await search_location(query);
      const data = res.data?.data || [];
      setLocations(data);
      setError("");
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
    setLocationInput(loc.name || "");
    setShowSuggestions(false);
  };

  // useEffect(() => {
  //   const handleClickOutside = (e: MouseEvent) => {
  //     const target = e.target as Node;
  //     // Chỉ ẩn suggestions nếu click ngoài input location
  //     if (!locationInputRef.current?.contains(target)) {
  //       setShowSuggestions(false);
  //     }
  //   };
  //   window.addEventListener("click", handleClickOutside);
  //   return () => window.removeEventListener("click", handleClickOutside);
  // }, []);

  const handleSearch = async () => {
    setLoading(true);
    try {
      if (!locationInput || locationInput.trim() === "") {
        // setError("Please enter a location.");
        setShowSuggestions(false);
        locationInputRef.current?.focus();

        return;
      }
      const query = new URLSearchParams({
        location: locationInput,
        ...(checkIn ? { checkIn: format(checkIn, "yyyy-MM-dd") } : {}),
        ...(checkOut ? { checkOut: format(checkOut, "yyyy-MM-dd") } : {}),
        adults: adults.toString(),
        children: children.toString(),
      }).toString();

      setTimeout(() => {
        router.push(`/room-list?${query}`);
      }, 300);
    } catch (error) {
      console.error("search room error: ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`mx-auto w-full bg-card rounded-4xl shadow-lg transition-all duration-300 ${
        compact
          ? "max-w-2xl p-2 sm:scale-[80%] md:scale-[100%]"
          : "max-w-5xl p-2 sm:scale-[80%] md:scale-[90%] md:p-3"
      }`}
    >
      <div
        className={`${
          compact ? "flex items-center gap-2" : "grid grid-cols-7 gap-4"
        }`}
      >
        <div className={`relative ${compact ? "flex-1" : "col-span-2"}`}>
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
            placeholder={t("Where are you going?")}
            className="pl-10 h-12 bg-card elegant-subheading rounded-4xl placeholder:text-muted border border-border text-[15px]"
          />

          {/* Danh sách gợi ý location */}
          <LocationSuggestions
            locations={locations}
            showSuggestions={showSuggestions}
            onSelect={handleSelectLocation}
          />
        </div>

        <div className={`relative ${compact ? "flex-1 " : "col-span-2"}`}>
          <DateRangePicker
            key={`${checkIn}-${checkOut}`}
            value={
              checkIn && checkOut ? { from: checkIn, to: checkOut } : undefined
            }
            onChange={(range) => {
              setCheckIn(range?.from ?? null);
              setCheckOut(range?.to ?? null);
            }}
          />
        </div>

        <div className={`relative ${compact ? "flex-1 " : "col-span-2"}`}>
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
          className={`h-12 rounded-3xl bg-primary hover:bg-primary/80 ${
            compact
              ? "w-12 p-0 flex justify-center items-center"
              : "elegant-subheading text-base"
          }`}
        >
          <Search size={20} />
          {!compact && <span className="ml-1">{t("search")}</span>}{" "}
        </Button>
      </div>
    </div>
  );
}
