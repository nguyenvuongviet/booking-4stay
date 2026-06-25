"use client";

import { Location } from "@/models/Location";
import { RefObject, useEffect, useRef, useState } from "react";

interface LocationSuggestionsProps {
  locations: Location[];
  showSuggestions: boolean;
  onSelect: (loc: Location) => void;
  activeIndex?: number;
  listRef?: RefObject<HTMLDivElement | null>;
}

export default function LocationSuggestions({
  locations,
  showSuggestions,
  onSelect,
  activeIndex,
  listRef,
}: LocationSuggestionsProps) {
  const [direction, setDirection] = useState<"up" | "down">("down");
  const containerRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (showSuggestions && containerRef.current) {
      const rect = containerRef.current.parentElement?.getBoundingClientRect();
      if (rect) {
        const windowHeight = window.innerHeight;
        // Nếu vị trí của input nằm ở nửa dưới màn hình (ví dụ > 60% chiều cao), hiển thị phía trên
        if (rect.bottom > windowHeight * 0.6) {
          setDirection("up");
        } else {
          setDirection("down");
        }
      }
    }
  }, [showSuggestions]);

  if (!showSuggestions || locations.length === 0) return null;

  return (
    <ul
      ref={containerRef}
      className={`absolute z-50 left-0 right-0 bg-white/95 dark:bg-black/40 backdrop-blur-3xl border border-white/30 dark:border-white/10 rounded-3xl shadow-2xl max-h-80 overflow-auto p-2 transition-all duration-300
      scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent hover:scrollbar-thumb-primary/40 scrollbar-py-2
      [&::-webkit-scrollbar]:w-1.5
      [&::-webkit-scrollbar-thumb]:bg-primary/20
      [&::-webkit-scrollbar-thumb]:rounded-full
      hover:[&::-webkit-scrollbar-thumb]:bg-primary/40
      [&::-webkit-scrollbar-track]:bg-transparent
      ${direction === "up" ? "bottom-full mb-4" : "mt-4"}`}
    >
      <div ref={listRef} className="space-y-1">
        {locations.map((loc, index) => (
          <li
            id={`loc-${index}`}
            key={loc.id}
            data-index={index}
            onClick={() => onSelect(loc)}
            className={`flex items-center gap-4 px-4 py-3 rounded-2xl cursor-pointer transition-all duration-200
            ${index === activeIndex ? "bg-primary/20 scale-[1.01] shadow-sm" : "hover:bg-primary/10 dark:hover:bg-white/5"}`}
          >
            <img
              src={loc.imageUrl || "/default-location.jpg"}
              alt={loc.name}
              className="w-12 h-12 rounded-xl object-cover border border-gray-200 dark:border-white/10 shadow-sm"
            />
            <div className="flex flex-col text-left">
              <span className="elegant-sans text-xs text-foreground">
                {loc.name || "Unknown"}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider elegant-subheading">
                {loc.country || "Vietnam"}
              </span>
            </div>
          </li>
        ))}
      </div>
    </ul>
  );
}
