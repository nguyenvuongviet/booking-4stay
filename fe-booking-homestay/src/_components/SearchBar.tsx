"use client";

import { Button } from "@/_components/ui/button";
import { Input } from "@/_components/ui/input";
import { useSearchBar } from "@/_hooks/useSearchBar";
import { useAuth } from "@/context/auth-context";
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
  const { user } = useAuth();
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
            onChange={(e) => handleChange(e.target.value)}
            onFocus={handleFocus}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
            placeholder={t("Where are you going?")}
            className="pl-10 h-12 bg-card elegant-subheading rounded-4xl placeholder:text-muted border border-border text-[15px]"
          />

          {/* Danh sách gợi ý location */}
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

        <div className={`relative ${compact ? "flex-1 " : "col-span-2"}`}>
          <DateRangePicker
            // key={`${checkIn}-${checkOut}`}
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
          onClick={() => handleSearch()}
          className={`h-12 rounded-3xl bg-primary hover:bg-primary/80 
            ${
              compact
                ? "w-12 p-0 flex justify-center items-center"
                : "elegant-subheading text-base"
            }`}
        >
          <Search size={20} />
          {!compact && <span>{t("search")}</span>}
        </Button>
      </div>
    </div>
  );
}
