"use client";

import GuestPicker from "@/components/GuestPicker";
import LocationSuggestions from "@/components/LocationSuggestions";
import { Button } from "@/components/ui/button";
import DateRangePicker from "@/components/ui/date-range-picker";
import { Input } from "@/components/ui/input";
import { Location } from "@/models/Location";
import ScrollFade from "@/styles/animations/ScrollFade";
import Typing from "@/styles/animations/Typing";
import { motion } from "framer-motion";
import { MapPin, Search, Users } from "lucide-react";

interface Props {
  checkIn: Date | null;
  checkOut: Date | null;
  setCheckIn: (v: Date | null) => void;
  setCheckOut: (v: Date | null) => void;
  adults: number;
  children: number;
  setAdults: (v: number) => void;
  setChildren: (v: number) => void;

  locationInput: string;
  setLocationInput: (v: string) => void;

  locations: Location[];
  showSuggestions: boolean;
  error: string;

  onSearch: () => void;
  onFocusLocation: () => void;
  onSelectLocation: (loc: Location) => void;

  locationInputRef: any;
}

export default function HeroSection({
  checkIn,
  checkOut,
  setCheckIn,
  setCheckOut,
  adults,
  children,
  setAdults,
  setChildren,
  locationInput,
  setLocationInput,
  locations,
  showSuggestions,
  error,
  onSearch,
  onFocusLocation,
  onSelectLocation,
  locationInputRef,
}: Props) {
  return (
    <section className="relative min-h-screen flex items-center justify-center z-0">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover -z-10"
        src="/video_bg.mp4"
      />

      {/* LAYER LÀM MỜ + TỐI */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[0.5px] -z-10" />
      <div className="relative max-w-5xl mx-auto px-6 lg:px-8 text-center z-10">
        <div className="mb-12 max-w-2xl mx-auto">
          <Typing
            texts={["Find Your Perfect Stay", "Enjoy Your Trip"]}
            speed={80}
            deleteSpeed={60}
            pause={1000}
            loop={true}
            className="elegant-heading md:text-8xl text-gradient mb-4 min-h-54"
          />

          <ScrollFade
            delay={500}
            className="elegant-subheading text-lg text-accent mx-auto text-pretty"
          >
            Discover amazing hotels, resorts, and accommodations worldwide
          </ScrollFade>
        </div>

        {/* SEARCH FORM */}
        <motion.div
          layoutId="search-bar"
          initial={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-card rounded-4xl p-8 shadow-xl transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-8">
              <div>
                <label className="elegant-subheading text-sm text-secondary-foreground mb-2 block">
                  Location
                </label>
                <div className="relative">
                  <MapPin
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                    size={20}
                  />
                  <Input
                    ref={locationInputRef}
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    onFocus={onFocusLocation}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Where are you going?"
                    className="pl-10 h-12 bg-card border-border focus:border-accent elegant-subheading rounded-3xl placeholder:text-muted"
                  />

                  {error && (
                    <p className="text-sm text-red-500 mt-1 absolute">
                      {error}
                    </p>
                  )}

                  <LocationSuggestions
                    locations={locations}
                    showSuggestions={showSuggestions}
                    onSelect={onSelectLocation}
                  />
                </div>
              </div>

              {/* DATE RANGE */}
              <div className="relative ">
                <label className="elegant-subheading text-sm text-secondary-foreground mb-2 block">
                  Check in & Check out
                </label>
                <div className="relative">
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

              {/* GUEST PICKER */}
              <div>
                <label className="elegant-subheading text-sm text-secondary-foreground mb-2 block">
                  Guests
                </label>

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
              </div>
            </div>

            {/* SEARCH BUTTON */}
            <Button
              onClick={onSearch}
              className="rounded-3xl w-full bg-primary hover:bg-primary/90 h-12 elegant-subheading text-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
            >
              <Search className="mr-2" size={20} />
              Search Hotels
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
