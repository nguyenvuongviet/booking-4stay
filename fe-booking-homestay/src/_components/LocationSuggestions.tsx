"use client";

import { Location } from "@/models/Location";
import { RefObject } from "react";

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
  if (!showSuggestions || locations.length === 0) return null;

  return (
    <ul className="absolute z-50 left-0 right-0 bg-white/20 backdrop-blur-2xl border border-white/30 mt-4 rounded-3xl shadow-2xl max-h-80 overflow-auto p-2">
      <div ref={listRef} className="space-y-1">
        {locations.map((loc, index) => (
          <li
            id={`loc-${index}`}
            key={loc.id}
            data-index={index}
            onClick={() => onSelect(loc)}
            className={`flex items-center gap-4 px-4 py-3 rounded-2xl cursor-pointer transition-all duration-200
            ${index === activeIndex ? "bg-white/20 scale-[1.02] shadow-sm" : "hover:bg-white/10"}`}
          >
            <img
              src={loc.imageUrl || "/default.jpg"}
              alt={loc.name}
              className="w-12 h-12 rounded-xl object-cover border border-white/20 shadow-sm"
            />
            <div className="flex flex-col text-left">
              <span className="font-semibold text-sm">
                {loc.name || "Unknown"}
              </span>
              <span className="text-[10px] uppercase tracking-wider">
                {loc.country || "Vietnam"}
              </span>
            </div>
          </li>
        ))}
      </div>
    </ul>
  );
}
