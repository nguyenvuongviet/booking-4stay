"use client";

import { Room } from "@/models/Room";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

const RedIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  iconRetinaUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function MapAutoFit({
  roomsArray,
  fallbackCenter,
}: {
  roomsArray: Room[];
  fallbackCenter?: [number, number];
}) {
  const map = useMap();

  useEffect(() => {
    // if (!roomsArray.length) return;
    const validCoords = roomsArray
      .filter((r) => r.location?.latitude && r.location?.longitude)
      .map((r): [number, number] => [
        Number(r.location.latitude),
        Number(r.location.longitude),
      ]);

    if (validCoords.length > 0) {
      const bounds = L.latLngBounds(validCoords);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (fallbackCenter) {
      map.setView(fallbackCenter, 12);
    }
  }, [roomsArray, fallbackCenter, map]);

  return null;
}

export function MapMarker({
  rooms,
  fallbackCenter,
}: {
  rooms: Room[] | Room | null;
  fallbackCenter?: [number, number];
}) {
  const roomsArray = Array.isArray(rooms) ? rooms : rooms ? [rooms] : [];
  const router = useRouter();

  const validRooms = roomsArray.filter(
    (r) => r.location?.latitude && r.location?.longitude,
  );

  const center: [number, number] =
    validRooms.length > 0
      ? [
          Number(validRooms[0].location.latitude),
          Number(validRooms[0].location.longitude),
        ]
      : fallbackCenter || [10.762622, 106.660172];

  return (
    <MapContainer
      center={center}
      zoom={14}
      className={`w-full h-full rounded-lg`}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />

      {validRooms.map((room) => (
        <Marker
          key={room.id}
          position={[
            Number(room.location.latitude),
            Number(room.location.longitude),
          ]}
          icon={RedIcon}
        >
          <Popup>
            <div
              className="cursor-pointer"
              onClick={() => router.push(`/room/${room.id}`)}
            >
              {/* Ảnh phòng */}
              {room.images?.main && (
                <img
                  src={room.images.main}
                  alt={room.name}
                  className="w-full h-24 object-cover rounded-md"
                />
              )}
              {/* Tên phòng */}
              <p className="text-sm elegant-sans text-center">
                {room.name} <br />
                <span className="text-primary text-sm elegant-subheading text-center">
                  {room.price?.toLocaleString()} VND
                </span>
              </p>
            </div>
          </Popup>
        </Marker>
      ))}

      {validRooms.length === 0 && fallbackCenter && (
        <Marker position={fallbackCenter} icon={RedIcon}>
          <Popup>Khu vực bạn tìm kiếm</Popup>
        </Marker>
      )}

      <MapAutoFit roomsArray={roomsArray} fallbackCenter={fallbackCenter} />
    </MapContainer>
  );
}
