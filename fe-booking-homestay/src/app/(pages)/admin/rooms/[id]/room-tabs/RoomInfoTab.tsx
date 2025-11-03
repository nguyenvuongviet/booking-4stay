import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getAmenityIcon } from "@/constants/amenity-icons";
import type { Amenity, Room } from "@/types/room";
import { Bed, Mail, MapPin, Phone, User } from "lucide-react";
import React from "react";

interface RoomInfoTabProps {
  room: Room;
  groupedAmenities: Record<string, Amenity[]>;
}

const RoomInfoTab: React.FC<RoomInfoTabProps> = ({
  room,
  groupedAmenities,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card className="p-6">
          <h3 className="text-xl font-bold text-warm-900 mb-4 border-b pb-2">
            Mô tả & Vị trí
          </h3>
          <div className="space-y-5">
            <div>
              <h4 className="text-lg font-semibold text-warm-800 mb-1">
                Mô tả chi tiết
              </h4>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {room.description || "Chưa có mô tả"}
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-warm-800 mb-1">
                Địa chỉ
              </h4>
              <p className="text-sm text-warm-700 flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                {room.location?.fullAddress || "Không rõ địa chỉ"}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-bold text-warm-900 mb-4 border-b pb-2">
            Tiện nghi
          </h3>
          {Object.keys(groupedAmenities).length ? (
            Object.entries(groupedAmenities).map(([category, list]) => (
              <div key={category} className="mb-4">
                <h4 className="text-sm font-bold uppercase text-primary mb-2">
                  {category}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {list.map((a) => (
                    <Badge
                      key={a.id}
                      variant="secondary"
                      className="flex items-center gap-1.5 p-2 font-normal text-warm-800 bg-muted/50 hover:bg-muted"
                    >
                      {getAmenityIcon(a.name)}
                      <span className="text-sm">{a.name}</span>
                    </Badge>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-sm">
              Chưa có tiện nghi nào.
            </p>
          )}
        </Card>
      </div>

      <div className="lg:col-span-1 space-y-6">
        <Card className="p-6">
          <h3 className="text-xl font-bold text-warm-900 mb-4 border-b pb-2">
            Chủ sở hữu
          </h3>
          <div className="flex items-start gap-4 text-sm">
            {room.host.avatar ? (
              <img
                src={room.host.avatar}
                alt={room.host.name}
                className="w-12 h-12 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <User className="w-12 h-12 text-warm-400 p-2 border rounded-full flex-shrink-0" />
            )}
            <div className="space-y-1">
              <p className="font-bold text-lg text-warm-900">
                {room.host.name}
              </p>
              <p className="flex items-center gap-1 text-muted-foreground">
                <Mail className="w-3.5 h-3.5" /> {room.host.email}
              </p>
              <p className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" /> {room.host.phoneNumber}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-bold text-warm-900 mb-4 border-b pb-2">
            Thông tin Giường
          </h3>
          {room.beds?.length ? (
            <div className="space-y-3">
              {room.beds.map((b, i) => (
                <div
                  key={i}
                  className="p-3 flex items-center justify-between border-b border-dashed last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <Bed className="w-5 h-5 text-primary" />
                    <p className="font-semibold text-warm-900">{b.type}</p>
                  </div>
                  <Badge className="bg-primary/10 text-primary font-bold hover:bg-primary/20">
                    {b.quantity} chiếc
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              Chưa có thông tin giường.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default RoomInfoTab;
