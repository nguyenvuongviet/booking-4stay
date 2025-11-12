"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Room } from "@/models/Room";

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

interface MapRoomsProps {
  rooms: Room[] | Room | null;
  height?: string;
}

function MapAutoFit({ roomsArray }: { roomsArray: Room[] }) {
  const map = useMap();

  const bounds = L.latLngBounds(
    roomsArray
      .filter((r) => r.location?.latitude && r.location?.longitude)
      .map((r) => [Number(r.location.latitude), Number(r.location.longitude)])
  );

  if (bounds.isValid()) {
    map.fitBounds(bounds, { padding: [50, 50] });
  }

  return null;
}

export default function MapRooms({ rooms, height }: MapRoomsProps) {
  const roomsArray = Array.isArray(rooms) ? rooms : rooms ? [rooms] : [];

  // Default center nếu chưa có room
  const defaultCenter: [number, number] = [10.762622, 106.660172];

  return (
    <MapContainer
      center={defaultCenter}
      zoom={14}
      className={`w-full ${height} rounded-lg`}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />

      {roomsArray.map(
        (room) =>
          room.location?.latitude &&
          room.location?.longitude && (
            <Marker
              key={room.id}
              position={[
                Number(room.location.latitude),
                Number(room.location.longitude),
              ]}
              icon={RedIcon}
            >
              <Popup>
                <div>
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
          )
      )}

      <MapAutoFit roomsArray={roomsArray} />
    </MapContainer>
  );
}
