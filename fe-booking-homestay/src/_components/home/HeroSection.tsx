"use client";

import GuestPicker from "@/_components/GuestPicker";
import LocationSuggestions from "@/_components/LocationSuggestions";
import { Button } from "@/_components/ui/button";
import DateRangePicker from "@/_components/ui/date-range-picker";
import { useSearchBar } from "@/_hooks/useSearchBar";
import { useAuth } from "@/context/auth-context";
import { useLang } from "@/context/lang-context";
import ScrollFade from "@/styles/animations/ScrollFade";
import Typing from "@/styles/animations/Typing";
import { motion } from "framer-motion";
import { Calendar, MapPin, Search, Users } from "lucide-react";
import { useEffect } from "react";

export default function HeroSection() {
  const { lang, t } = useLang();
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
  } = useSearchBar();

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
    <section className="relative min-h-screen flex items-center justify-center z-0 overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover -z-10 scale-105"
        src="https://res.cloudinary.com/nguyenvuongviet/video/upload/v1765448600/video_bg_omgnlu.mp4"
      />

      {/* LAYER LÀM MỜ + TỐI */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] -z-10" />

      <div className="relative w-full max-w-6xl mx-auto px-6 lg:px-8 text-center z-10">
        <div className="mb-12 max-w-4xl mx-auto px-6 lg:px-8 text-center">
          {user && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-accent/90 text-xl elegant-subheading mb-4"
            >
              Chào{user.firstName}, bạn đã sẵn sàng cho chuyến đi tiếp theo
              chưa?
            </motion.p>
          )}

          <Typing
            texts={[t("findYourPerfectStay"), t("enjoyYourTrip")]}
            speed={80}
            deleteSpeed={60}
            pause={2000}
            loop={true}
            className={`elegant-heading text-gradient ${
              lang === "vi"
                ? "md:text-7xl m-4 min-h-46"
                : " md:text-8xl mb-4 min-h-55 "
            }`}
          />

          <ScrollFade
            delay={500}
            className="elegant-subheading text-lg text-white/80 mx-auto max-w-2xl text-pretty"
          >
            {t("discoverAccommodations")}
          </ScrollFade>
        </div>

        {/* SEARCH FORM - MODERN PILL STYLE */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mx-auto max-w-5xl"
        >
          <div className="bg-white/10 backdrop-blur-2xl border border-white/30 rounded-full p-8 md:p-3 shadow-2xl transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl hover:bg-white/20">
            <div className="flex flex-col md:flex-row items-center gap-1">
              {/* Location input */}
              <div className="relative flex-2 w-full group">
                <div
                  className="flex items-center gap-3 px-6 py-3 rounded-4xl hover:bg-white/10 transition-colors cursor-pointer"
                  onClick={() => locationInputRef.current?.focus()}
                >
                  <MapPin className="text-accent drop-shadow-sm" size={22} />
                  <div className="text-left overflow-hidden">
                    <p className="text-[10px] uppercase tracking-widest text-white/70 font-bold drop-shadow-sm">
                      {t("location")}
                    </p>
                    <input
                      ref={locationInputRef}
                      value={locationInput}
                      onChange={(e) => handleChange(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onFocus={handleFocus}
                      placeholder={t("Where are you going?")}
                      className="bg-transparent border-none focus:outline-none text-white placeholder:text-white/50 w-full text-sm drop-shadow-sm"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-xs text-red-500 mt-1 absolute">{error}</p>
                )}

                <LocationSuggestions
                  locations={locations}
                  showSuggestions={showSuggestions}
                  onSelect={handleSelect}
                  activeIndex={activeIndex}
                  listRef={listRef}
                />
              </div>

              <div className="hidden md:block w-px h-10 bg-white/20" />

              {/* Date Picker */}
              <div className="relative flex-2 w-full group">
                <div className="flex items-center gap-3 px-6 py-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer">
                  <Calendar className="text-accent drop-shadow-sm" size={22} />
                  <div className="text-left overflow-hidden">
                    <p className="text-[10px] uppercase tracking-widest text-white/70 font-bold drop-shadow-sm">
                      Thời gian
                    </p>
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
                      className="bg-transparent border-none focus:border-none hover:border-none text-white placeholder:text-white/50 w-full text-sm drop-shadow-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="hidden md:block w-px h-10 bg-white/20" />

              {/* Guest Picker */}
              <div className="relative flex-2 w-full">
                <div className="flex items-center gap-3 px-6 py-3 rounded-full hover:bg-white/10 transition-colors">
                  <Users className="text-accent drop-shadow-sm" size={22} />
                  <div className="text-left w-full">
                    <p className="text-[10px] uppercase tracking-widest text-white/70 font-bold drop-shadow-sm">
                      {t("guests")}
                    </p>
                    <GuestPicker
                      className="bg-transparent border-none text-white p-0 h-auto w-full text-left font-semibold text-sm hover:bg-transparent drop-shadow-sm"
                      adults={adults}
                      children={children}
                      setAdults={setAdults}
                      setChildren={setChildren}
                    />
                  </div>
                </div>
              </div>

              {/* Search Button */}
              <Button
                onClick={() => handleSearch()}
                className="flex-1 rounded-full bg-primary hover:bg-primary/90 h-14 w-full md:w-14 min-w-14 flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-xl group p-0"
              >
                <Search
                  className="text-white group-hover:scale-110 transition-transform"
                  size={24}
                />
                <span>{t("search")}</span>
              </Button>
            </div>
          </div>

          {/* Quick links */}
          {/* <div className="mt-8 flex flex-wrap justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-1000 fill-mode-both">
            <span className="text-white/60 text-sm font-medium">{t("Trending")}:</span>
            {["Đà Nẵng", "Hà Nội", "Hội An", "Phú Quốc"].map((city) => (
              <button
                key={city}
                onClick={() => handleSelect(city)}
                className="text-white/80 text-sm hover:text-accent transition-colors border-b border-white/20 hover:border-accent"
              >
                {city}
              </button>
            ))}
          </div> */}
        </motion.div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce opacity-50">
        <div className="w-px h-12 bg-linear-to-b from-white to-transparent" />
      </div>
    </section>
  );
}
