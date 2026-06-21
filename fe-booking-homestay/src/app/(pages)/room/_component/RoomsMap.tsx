"use client";

import { Room } from "@/models/Room";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

interface RoomsMapProps {
  rooms: Room[];
  center: [number, number] | null;
  zoom?: number;
}

const DEFAULT_CENTER: [number, number] = [16.0, 108.0];
const DEFAULT_ZOOM = 6;

// Custom function to create premium price tag icons using Leaflet DivIcon
function createPriceIcon(price: number) {
  const formattedPrice = `${price.toLocaleString("vi-VN")}đ`;

  return L.divIcon({
    className: "relative bg-transparent",
    html: `
      <div class="group relative flex flex-col items-center drop-shadow-[0_2px_6px_rgba(0,0,0,0.15)]">
        <div class="bg-slate-700 text-white font-extrabold px-3 py-1.5 rounded-full text-[11px] border border-white/20 group-hover:scale-105 group-hover:bg-slate-800 transition-all duration-200 whitespace-nowrap cursor-pointer">
          ${formattedPrice}
        </div>
        <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-slate-700 group-hover:border-t-slate-800 -mt-px transition-colors duration-200"></div>
      </div>
    `,
    iconSize: [85, 32],
    iconAnchor: [42, 32],
    popupAnchor: [0, -32],
  });
}

// Inner helper component to automatically update view bounds or center
function MapController({ rooms, center, zoom = DEFAULT_ZOOM }: RoomsMapProps) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // Filter rooms with valid coordinates
    const validCoords = rooms
      .map((r) => {
        const lat = Number(r.location?.latitude);
        const lng = Number(r.location?.longitude);
        return [lat, lng];
      })
      .filter(
        ([lat, lng]) => !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0,
      );

    if (validCoords.length > 0) {
      // Fit bounds to show all markers
      const bounds = L.latLngBounds(validCoords as L.LatLngTuple[]);
      map.fitBounds(bounds, {
        padding: [40, 40],
        maxZoom: 15,
        animate: true,
        duration: 1.2,
      });
    } else if (center) {
      map.setView(center, zoom, { animate: true, duration: 1.0 });
    }
  }, [rooms, center, zoom, map]);

  return null;
}

export default function RoomsMap({
  rooms,
  center,
  zoom = DEFAULT_ZOOM,
}: RoomsMapProps) {
  const mapCenter = center || DEFAULT_CENTER;

  // Filter valid room markers to display
  const mapRooms = rooms.filter((r) => {
    const lat = Number(r.location?.latitude);
    const lng = Number(r.location?.longitude);
    return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
  });

  return (
    <div className="w-full h-full relative group/map">
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom
        attributionControl={false} // Disable Leaflet default attribution to keep UI clean
      >
        <TileLayer
          // Use Google Maps tile service for exact Google layers, Vietnamese labels, and no disputed borders
          url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          subdomains={["mt0", "mt1", "mt2", "mt3"]}
          maxZoom={20}
        />

        {/* Custom attribution to credit Google Maps */}
        <div className="absolute bottom-1 right-2 z-10 bg-white/70 dark:bg-black/70 px-1.5 py-0.5 rounded-sm text-[9px] text-foreground/50 pointer-events-none select-none backdrop-blur-xs font-sans">
          © Google Maps
        </div>

        <MapController rooms={rooms} center={center} zoom={zoom} />

        {mapRooms.map((room) => {
          const lat = Number(room.location.latitude);
          const lng = Number(room.location.longitude);

          return (
            <Marker
              key={room.id}
              position={[lat, lng]}
              icon={createPriceIcon(room.price)}
              eventHandlers={{
                mouseover: (e) => {
                  e.target.openPopup();
                },
              }}
            >
              <Popup className="custom-room-popup">
                <div className="w-46 overflow-hidden rounded-xl bg-card border border-border/40 font-sans shadow-md group/popup-card">
                  <div className="relative h-24 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <Image
                      src={room.images?.main || "/default.jpg"}
                      alt={room.name}
                      fill
                      sizes="184px"
                      className="object-cover transition-transform duration-500 group-hover/popup-card:scale-105"
                    />
                    {room.rating !== undefined && room.rating > 0 && (
                      <div className="absolute top-2 left-2 z-10 flex items-center gap-0.5 text-[9px] font-bold bg-background/90 backdrop-blur-xs text-amber-500 px-1.5 py-0.5 rounded-md shadow-xs">
                        <Star
                          size={8}
                          className="fill-current text-amber-500"
                        />
                        <span>{room.rating}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-2.5 space-y-1.5 bg-card">
                    <h4 className="font-bold text-xs line-clamp-1 text-foreground transition-colors group-hover/popup-card:text-slate-700 dark:group-hover/popup-card:text-slate-300">
                      {room.name}
                    </h4>
                    <div className="flex items-center gap-1 text-[10px] text-foreground/60">
                      <MapPin
                        size={10}
                        className="shrink-0 text-slate-400 dark:text-slate-500"
                      />
                      <span className="truncate">
                        {room.location.province || room.location.fullAddress}
                      </span>
                    </div>
                    <div className="h-px bg-border/40 w-full" />
                    <div className="flex flex-col gap-1.5 pt-0.5">
                      <div className="flex items-baseline justify-between">
                        <span className="text-[9px] text-foreground/50">
                          Giá từ
                        </span>
                        <span className="font-extrabold text-[11px] text-slate-800 dark:text-slate-200">
                          {room.price.toLocaleString("vi-VN")}đ
                          <span className="text-[8px] font-normal text-foreground/50 ml-0.5">
                            /đêm
                          </span>
                        </span>
                      </div>
                      <Link
                        href={`/room/${room.id}`}
                        className="block text-center text-[9px] font-bold bg-primary hover:bg-primary/80 text-white! dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 py-1.5 rounded-lg transition-all duration-200 active:scale-[0.98] shadow-xs"
                      >
                        Chi tiết phòng
                      </Link>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
