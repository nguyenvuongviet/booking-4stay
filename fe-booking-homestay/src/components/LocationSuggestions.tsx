"use client";

import Image from "next/image";
import { Location } from "@/models/Location";

interface LocationSuggestionsProps {
  locations: Location[];
  showSuggestions: boolean;
  onSelect: (loc: Location) => void;
}

export default function LocationSuggestions({
  locations,
  showSuggestions,
  onSelect,
}: LocationSuggestionsProps) {
  if (!showSuggestions || locations.length === 0) return null;

  return (
    <ul className="absolute z-50 left-0 right-0 bg-white border border-gray-200 mt-2 rounded-xl shadow-lg max-h-60 overflow-auto">
      {locations.map((loc) => (
        <li
          key={loc.id}
          onClick={() => onSelect(loc)}
          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700"
        >
          <img
            src={loc.provinceImageUrl || "/default.jpg"}
            alt={loc.province}
            className="w-10 h-10 rounded-md object-cover border"
          />
          <span>{loc.province || "Unknown"}</span>
        </li>
      ))}
    </ul>
  );
}
