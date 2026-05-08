"use client";

import { Button } from "@/_components/ui/button";
import { Input } from "@/_components/ui/input";
import { useSearchBar } from "@/_hooks/useSearchBar";
import { useLang } from "@/context/lang-context";
import { MapPin, Search, Users } from "lucide-react";
import { useEffect } from "react";
import "react-datepicker/dist/react-datepicker.css";
import GuestPicker from "./GuestPicker";
import LocationSuggestions from "./LocationSuggestions";
import DateRangePicker from "./ui/date-range-picker";

interface SearchBarProps {
  compact?: boolean; // nếu true: mini bar
}
export function SearchBar({ compact = false }: SearchBarProps) {
  const { t } = useLang();
  const {
    locationInput,
    locations,
    showSuggestions,
    activeIndex,
    checkIn,
    checkOut,
    adults,
    children,
    locationInputRef,
    listRef,
    error,
    setCheckIn,
    setCheckOut,
    setAdults,
    setChildren,
    setShowSuggestions,
    handleFocus,
    handleChange,
    handleSelect,
    handleKeyDown,
    handleSearch,
  } = useSearchBar({ autoSearchOnSelect: true });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        locationInputRef.current &&
        !locationInputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, [locationInputRef, setShowSuggestions]);

  return (
    <div
      className={`mx-auto bg-transparent backdrop-blur-2xl rounded-full p-8 md:p-3 shadow-2xl hover:-translate-y-1 hover:shadow-2xl hover:bg-white/20 transition-all duration-300 z-50 ${
        compact
          ? "max-w-2xl p-2 sm:scale-[70%] md:scale-[100%]"
          : "max-w-5xl p-2 sm:scale-[80%] md:scale-[90%]"
      }`}
    >
      <div
        className={`flex ${
          compact ? "items-center gap-1" : "gap-1 md:gap-2 items-center"
        }`}
      >
        <div
          className={`relative flex-2 rounded-full hover:border-ring focus:border-ring focus:ring-1 focus:ring-accent cursor-pointer`}
        >
          <MapPin
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary drop-shadow-sm shrink-0"
            size={20}
          />
          <Input
            ref={locationInputRef}
            value={locationInput}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={handleFocus}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
            placeholder={t("Where are you going?")}
            className={`pl-10 h-12 bg-transparent border-none elegant-subheading rounded-full placeholder:text-muted-foreground/60 truncate `}
          />

          {error && (
            <p className="text-xs text-red-500 absolute mt-1 ml-4">{error}</p>
          )}
          <LocationSuggestions
            locations={locations}
            showSuggestions={showSuggestions}
            onSelect={handleSelect}
            activeIndex={activeIndex}
            listRef={listRef}
          />
        </div>

        <div
          className={`relative border-none hover:border-ring focus:border-ring focus:ring-1 focus:ring-accent flex-2`}
        >
          <DateRangePicker
            value={
              checkIn && checkOut ? { from: checkIn, to: checkOut } : undefined
            }
            onChange={(range) => {
              setCheckIn(range?.from ?? null);
              setCheckOut(range?.to ?? null);
            }}
          />
        </div>

        {/* Guest Section */}
        <div
          className={`relative flex-2 bg-transparent border-none elegant-subheading rounded-full text-sm truncate hover:bg-transparent drop-shadow-sm transform hover:border-ring focus:border-ring focus:ring-1 focus:ring-accent ${compact ? "" : ""}`}
        >
          <Users
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary drop-shadow-xs shrink-0"
            size={18}
          />
          <GuestPicker
            adults={adults}
            children={children}
            setAdults={setAdults}
            setChildren={setChildren}
          />
        </div>

        <Button
          onClick={() => handleSearch()}
          className={`h-12 rounded-3xl bg-primary hover:bg-primary/80 
            ${
              compact
                ? "w-12 p-0 flex justify-center items-center"
                : "elegant-subheading text-base"
            }`}
        >
          {compact && <Search size={22} />}
          {!compact && (
            <span className="text-sm items-center">{t("search")}</span>
          )}
        </Button>
      </div>
    </div>
  );
}
