"use client";

import { Button } from "@/_components/ui/button";
import { Input } from "@/_components/ui/input";
import { useSearchBar } from "@/_hooks/useSearchBar";
import { useLang } from "@/context/lang-context";
import { format } from "date-fns";
import { Calendar, MapPin, Menu, Search, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { createPortal } from "react-dom";
import GuestPicker from "./GuestPicker";
import LocationSuggestions from "./LocationSuggestions";
import DateRangePicker from "./ui/date-range-picker";

interface SearchBarProps {
  compact?: boolean; // nếu true: mini bar
}
export function SearchBar({ compact = false }: SearchBarProps) {
  const { t } = useLang();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
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

  // Format dates for display
  const getDatesDisplay = () => {
    if (checkIn && checkOut) {
      return `${format(checkIn, "dd/MM")} - ${format(checkOut, "dd/MM")}`;
    }
    return t("selectDate");
  };

  const getGuestsDisplay = () => {
    const total = adults + children;
    return `${total} ${t("guests")}`;
  };

  return (
    <>
      {/* Mobile search bar trigger button */}
      <div className="md:hidden w-full">
        <div
          onClick={() => setIsMobileSearchOpen(true)}
          className={`flex items-center bg-card transition-all duration-300 w-full cursor-pointer rounded-full ${
            compact
              ? "border border-border shadow-md py-1.5 px-3 justify-center gap-2 hover:shadow-lg"
              : "border border-primary/15 dark:border-white/10 shadow-xl shadow-primary/5 dark:shadow-white/5 py-3 px-5 justify-between hover:shadow-2xl hover:scale-[1.01]"
          }`}
        >
          <div
            className={`flex items-center truncate ${compact ? "gap-2" : "gap-3"}`}
          >
            <div
              className={`${compact ? "p-1.5" : "p-2"} bg-primary/10 rounded-full text-primary shrink-0`}
            >
              <Search size={compact ? 14 : 16} />
            </div>
            <div className="text-left truncate">
              <div
                className={`${compact ? "text-xs" : "text-sm"} font-semibold text-foreground truncate`}
              >
                {locationInput || t("Where are you going?")}
              </div>
              {!compact && (
                <div className="text-[11px] text-foreground/50 flex gap-1 items-center">
                  <span>{getDatesDisplay()}</span>
                  <span>•</span>
                  <span>{getGuestsDisplay()}</span>
                </div>
              )}
            </div>
          </div>
          {!compact && (
            <div className="p-2 border border-border rounded-full text-foreground/50 shrink-0">
              <Menu className="w-4.5 h-4.5" />
            </div>
          )}
        </div>
      </div>

      <div
        className={`hidden md:block mx-auto bg-white/95 dark:bg-black/90 backdrop-blur-2xl rounded-3xl md:rounded-full transition-all duration-300 z-50 w-full ${
          compact
            ? "max-w-2xl p-4 md:p-1.5 border border-border shadow-2xl hover:shadow-2xl"
            : "max-w-none p-5 md:p-2 lg:p-3 border border-primary/15 dark:border-white/10 shadow-[0_20px_50px_rgba(8,112,184,0.12)] dark:shadow-[0_20px_50px_rgba(255,255,255,0.06)] hover:shadow-[0_25px_60px_rgba(8,112,184,0.18)] dark:hover:shadow-[0_25px_60px_rgba(255,255,255,0.09)] hover:scale-[1.01]"
        }`}
      >
        <div
          className={`flex flex-col md:flex-row items-stretch md:items-center w-full ${compact ? "gap-3 md:gap-1 lg:gap-1.5" : "gap-3 md:gap-1.5 lg:gap-2"}`}
        >
          {/* Location Section */}
          <div
            className={`relative flex-1 md:flex-2 border border-border rounded-full shadow-2xs bg-card hover:border-primary/40 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 cursor-pointer transition-all duration-300 ${compact ? "h-10" : "h-14 md:h-12 lg:h-14"}`}
          >
            <MapPin
              className={`absolute top-1/2 transform -translate-y-1/2 text-primary drop-shadow-sm shrink-0 z-10 pointer-events-none ${compact ? "left-3" : "left-4 md:left-2.5 lg:left-4"}`}
              size={compact ? 15 : 18}
            />
            <Input
              ref={locationInputRef}
              value={locationInput}
              onChange={(e) => handleChange(e.target.value)}
              onFocus={handleFocus}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={handleKeyDown}
              placeholder={t("Where are you going?")}
              className={`pr-2 h-full w-full bg-transparent border-none elegant-subheading rounded-full placeholder:text-foreground/40 truncate focus:outline-hidden focus-visible:ring-0 ${compact ? "pl-8 text-xs md:text-[11px] lg:text-xs" : "pl-11 pr-4 text-sm md:pl-8 md:pr-1 md:text-[11px] lg:pl-11 lg:pr-4 lg:text-sm"}`}
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

          {/* Date Section */}
          <div
            className={`relative flex-1 md:flex-2 ${compact ? "h-10" : "h-14 md:h-12 lg:h-14"}`}
          >
            <DateRangePicker
              compact={compact}
              value={
                checkIn && checkOut
                  ? { from: checkIn, to: checkOut }
                  : undefined
              }
              onChange={(range) => {
                setCheckIn(range?.from ?? null);
                setCheckOut(range?.to ?? null);
              }}
            />
          </div>

          {/* Guest Section */}
          <div
            className={`relative flex-1 md:flex-2 ${compact ? "h-10" : "h-14 md:h-12 lg:h-14"}`}
          >
            <Users
              className={`absolute top-1/2 transform -translate-y-1/2 text-primary drop-shadow-xs shrink-0 z-10 pointer-events-none ${compact ? "left-3" : "left-4 md:left-2.5 lg:left-4"}`}
              size={compact ? 15 : 18}
            />
            <GuestPicker
              compact={compact}
              adults={adults}
              children={children}
              setAdults={setAdults}
              setChildren={setChildren}
            />
          </div>

          {/* Search Button */}
          <Button
            onClick={() => handleSearch()}
            className={`font-semibold flex items-center justify-center cursor-pointer transition-all duration-300 active:scale-95 text-sm
              ${
                compact
                  ? "h-10 w-10 md:w-10 md:h-10 md:p-0 rounded-full bg-primary hover:bg-primary/90 text-white"
                  : "h-14 md:h-12 w-full md:w-auto px-8 md:px-4 md:text-xs lg:px-8 lg:text-sm rounded-full bg-primary hover:bg-primary/90 text-white"
              }`}
          >
            {compact && <Search size={16} className="hidden md:block" />}
            {compact && <span className="md:hidden">{t("search")}</span>}
            {!compact && <span>{t("search")}</span>}
          </Button>
        </div>
      </div>

      {/* Mobile Pop-up Search Modal - Rendered via Portal to escape scaled containing blocks */}
      {isMobileSearchOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className={`fixed inset-0 z-1000 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 md:hidden animate-in fade-in duration-200`}
            onClick={() => setIsMobileSearchOpen(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border/50 rounded-3xl w-full max-w-sm shadow-2xl p-5 flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200 relative overflow-visible"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-border/60 mb-5">
                <h2 className="text-base font-bold text-foreground">
                  {t("search")}
                </h2>
                <button
                  onClick={() => setIsMobileSearchOpen(false)}
                  className="p-1.5 rounded-full hover:bg-foreground/5 text-foreground/50 transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Content Body */}
              <div className="space-y-5 flex-1 overflow-visible">
                {/* Location Input Section */}
                <div className="space-y-2 relative">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <MapPin size={14} className="text-primary" />
                    {t("location")}
                  </label>
                  <div className="relative border border-border rounded-full bg-card focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all h-11">
                    <Input
                      ref={locationInputRef}
                      value={locationInput}
                      onChange={(e) => handleChange(e.target.value)}
                      onFocus={handleFocus}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={handleKeyDown}
                      placeholder={t("Where are you going?")}
                      className="pl-4 pr-4 h-full w-full bg-transparent border-none elegant-subheading rounded-full placeholder:text-foreground/40 truncate focus:outline-hidden focus-visible:ring-0 text-xs"
                    />
                    <LocationSuggestions
                      locations={locations}
                      showSuggestions={showSuggestions}
                      onSelect={(loc) => {
                        handleSelect(loc);
                      }}
                      activeIndex={activeIndex}
                      listRef={listRef}
                    />
                  </div>
                </div>

                {/* Date Input Section */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    {t("selectDate")}
                  </label>
                  <div className="h-11 relative">
                    <DateRangePicker
                      value={
                        checkIn && checkOut
                          ? { from: checkIn, to: checkOut }
                          : undefined
                      }
                      onChange={(range) => {
                        setCheckIn(range?.from ?? null);
                        setCheckOut(range?.to ?? null);
                      }}
                    />
                  </div>
                </div>

                {/* Guests Section */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Users size={14} className="text-primary" />
                    {t("selectGuests")}
                  </label>
                  <div className="h-11 relative">
                    <GuestPicker
                      adults={adults}
                      children={children}
                      setAdults={setAdults}
                      setChildren={setChildren}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div className="pt-4 border-t border-border/60 flex gap-3 mt-5">
                <Button
                  variant="outline"
                  onClick={() => {
                    handleChange("");
                    setCheckIn(null);
                    setCheckOut(null);
                    setAdults(1);
                    setChildren(0);
                  }}
                  className="flex-1 py-5 rounded-full border border-border/80 hover:bg-foreground/5 text-foreground transition-all cursor-pointer font-medium text-xs h-10"
                >
                  {t("langCode") === "en" ? "Clear" : "Xóa"}
                </Button>
                <Button
                  onClick={() => {
                    handleSearch();
                    setIsMobileSearchOpen(false);
                  }}
                  className="flex-2 py-5 rounded-full bg-primary hover:bg-primary/95 text-white font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 text-xs h-10"
                >
                  <Search size={14} />
                  <span>{t("search")}</span>
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
