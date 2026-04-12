"use client";

import { Button } from "@/_components/ui/button";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Loader2, LocateFixed } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface Props {
  lat: number | null;
  lng: number | null;
  address?: string;
  onChange: (lat: number, lng: number) => void;
}

function ClickHandler({
  onChange,
}: {
  onChange: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapFlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 16, { duration: 1 });
  }, [lat, lng]);
  return null;
}

function DraggableMarker({
  lat,
  lng,
  onChange,
}: {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
}) {
  const markerRef = useRef<L.Marker>(null);
  return (
    <Marker
      position={[lat, lng]}
      draggable
      ref={markerRef}
      eventHandlers={{
        dragend() {
          const pos = markerRef.current?.getLatLng();
          if (pos) onChange(pos.lat, pos.lng);
        },
      }}
    />
  );
}

const DEFAULT_CENTER: [number, number] = [16.0, 108.0];
const DEFAULT_ZOOM = 6;

export function MapPicker({ lat, lng, address, onChange }: Props) {
  const hasCoords = lat !== null && lng !== null;
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);

  const handleGeocode = async () => {
    if (!address?.trim()) {
      setGeocodeError(
        "Chưa có địa chỉ để tìm. Hãy chọn tỉnh/huyện và nhập tên đường trước.",
      );
      return;
    }
    try {
      setGeocoding(true);
      setGeocodeError(null);
      const query = encodeURIComponent(address + ", Việt Nam");
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${query}`,
        { headers: { "Accept-Language": "vi" } },
      );
      const data = await res.json();
      if (data?.length > 0) {
        onChange(parseFloat(data[0].lat), parseFloat(data[0].lon));
      } else {
        setGeocodeError(
          "Không tìm thấy vị trí. Hãy thử nhập địa chỉ rõ hơn hoặc ghim tay trên bản đồ.",
        );
      }
    } catch {
      setGeocodeError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setGeocoding(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleGeocode}
          disabled={geocoding || !address?.trim()}
          className="flex items-center gap-2"
        >
          {geocoding ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <LocateFixed className="w-4 h-4" />
          )}
          {geocoding ? "Đang tìm..." : "Tự động lấy tọa độ"}
        </Button>

        {hasCoords && (
          <span className="text-xs text-muted-foreground">
            📍 {Number(lat).toFixed(5)}, {Number(lng).toFixed(5)}
          </span>
        )}
      </div>

      {geocodeError && (
        <p className="text-xs text-destructive">{geocodeError}</p>
      )}

      <div className="rounded-lg overflow-hidden border border-border shadow-sm h-[260px]">
        <MapContainer
          center={hasCoords ? [Number(lat), Number(lng)] : DEFAULT_CENTER}
          zoom={hasCoords ? 15 : DEFAULT_ZOOM}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onChange={onChange} />
          {hasCoords && (
            <>
              <MapFlyTo lat={Number(lat)} lng={Number(lng)} />
              <DraggableMarker
                lat={Number(lat)}
                lng={Number(lng)}
                onChange={onChange}
              />
            </>
          )}
        </MapContainer>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        {hasCoords
          ? "Kéo pin để tinh chỉnh vị trí — hoặc click vào bản đồ để đặt lại."
          : "Bấm nút trên hoặc click vào bản đồ để đặt vị trí homestay."}
      </p>
    </div>
  );
}
