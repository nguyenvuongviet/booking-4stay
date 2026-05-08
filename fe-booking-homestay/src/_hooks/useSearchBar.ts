import { Location } from "@/models/Location";
import { getLocation, search_location } from "@/services/locationApi";
import { format } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseSearchBarOptions {
  autoSearchOnSelect?: boolean;
}

export function useSearchBar(options?: UseSearchBarOptions) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { autoSearchOnSelect = false } = options || {};

  const locationInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // sync URL → state
  const params = new URLSearchParams(searchParams.toString());

  // state
  const [locations, setLocations] = useState<Location[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [error, setError] = useState("");

  const [locationInput, setLocationInput] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);

  useEffect(() => {
    const loc = searchParams.get("location");
    const ci = searchParams.get("checkIn");
    const co = searchParams.get("checkOut");
    const ad = searchParams.get("adults");
    const ch = searchParams.get("children");

    setLocationInput(loc ? decodeURIComponent(loc) : "");

    setCheckIn(ci ? new Date(ci + "T00:00") : null);

    setCheckOut(co ? new Date(co + "T00:00") : null);

    setAdults(ad ? Number(ad) : 1);

    setChildren(ch ? Number(ch) : 0);
  }, [searchParams]);

  // fetch location
  const fetchLocations = useCallback(async (query: string) => {
    try {
      if (!query.trim()) {
        const res = await getLocation({ pageSize: 1000 });
        setLocations(res.items || []);
      } else {
        const res = await search_location({ search: query });
        setLocations(res.items || []);
      }
      setError("");
      setShowSuggestions(true);
    } catch (err) {
      console.error("fetchLocations error:", err);
    }
  }, []);

  // debounce
  useEffect(() => {
    if (!showSuggestions) return;
    const timeout = setTimeout(() => {
      fetchLocations(locationInput);
    }, 200);

    return () => clearTimeout(timeout);
  }, [locationInput, fetchLocations, showSuggestions]);

  // handlers
  const handleFocus = () => {
    setShowSuggestions(true);
    setActiveIndex(-1);
    fetchLocations(locationInput || "");
  };

  const handleChange = (value: string) => {
    setLocationInput(value);
    setShowSuggestions(true);
    setActiveIndex(-1);
    setError("");

    if (!value.trim()) {
      fetchLocations("");
    }
  };

  const handleSearch = (customLocation?: string) => {
    const loc = customLocation || locationInput;

    if (!loc.trim()) {
      setError("Please enter a location");
      locationInputRef.current?.focus();
      return;
    }

    const query = new URLSearchParams({
      location: loc,
      ...(checkIn ? { checkIn: format(checkIn, "yyyy-MM-dd") } : {}),
      ...(checkOut ? { checkOut: format(checkOut, "yyyy-MM-dd") } : {}),
      adults: adults.toString(),
      children: children.toString(),
    }).toString();

    setShowSuggestions(false);
    router.push(`/room?${query}`);
    router.refresh();
  };

  const handleSelect = (loc: Location) => {
    setLocationInput(loc.name || "");
    setShowSuggestions(false);

    if (autoSearchOnSelect) {
      handleSearch(loc.name);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < locations.length - 1 ? prev + 1 : 0));
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : locations.length - 1));
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (locations.length > 0 && activeIndex >= 0) {
        handleSelect(locations[activeIndex]);
      } else {
        handleSearch(locationInput);
      }
    }

    if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const el = listRef.current.querySelector(
        `[data-index="${activeIndex}"]`,
      ) as HTMLElement | null;
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [locations]);

  return {
    // state
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

    // setters
    setLocationInput,
    setCheckIn,
    setCheckOut,
    setAdults,
    setChildren,
    setShowSuggestions,
    setActiveIndex,
    setError,

    // handlers
    handleFocus,
    handleChange,
    handleSelect,
    handleKeyDown,
    handleSearch,
  };
}
