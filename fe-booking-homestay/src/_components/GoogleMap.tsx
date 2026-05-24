"use client";

import { Button } from "@/_components/ui/button";
import { MapPinned } from "lucide-react";

type GoogleMapProps = {
  lat?: number | string | null;
  lng?: number | string | null;
  address?: string | null;
  zoom?: number;
  showOpenButton?: boolean;
};

export function GoogleMap({
  lat,
  lng,
  address,
  zoom = 6,
  showOpenButton = false,
}: GoogleMapProps) {
  const latitude = lat ? Number(lat) : null;
  const longitude = lng ? Number(lng) : null;

  const hasCoords =
    latitude !== null &&
    longitude !== null &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude);

  const query = hasCoords ? `${latitude},${longitude}` : address || "Việt Nam";

  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(
    query,
  )}&z=${zoom}&output=embed`;

  const openMapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    query,
  )}`;

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border shadow-sm">
      <iframe
        src={mapSrc}
        width="100%"
        height="100%"
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        className="absolute inset-0 h-full w-full border-0"
      />

      {showOpenButton && (
        <Button
          asChild
          variant="outline"
          size="sm"
          className="absolute bottom-2 right-2 z-10 shadow-md backdrop-blur-md bg-white/40"
        >
          <a
            href={openMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary/75 hover:text-primary"
          >
            <MapPinned className="mr-1 h-3 w-3" />
            Mở trên Google Maps
          </a>
        </Button>
      )}
    </div>
  );
}
