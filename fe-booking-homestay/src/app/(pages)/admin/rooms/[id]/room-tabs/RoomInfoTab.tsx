"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getAmenityIcon } from "@/constants/amenity-icons";
import type { Room } from "@/types/room";
import {
  Baby,
  Bed,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Star,
  User,
  UserRound,
} from "lucide-react";

export default function RoomInfoTab({
  room,
  onEditAmenities,
  onEditBeds,
}: {
  room: Room;
  onEditAmenities: () => void;
  onEditBeds: () => void;
}) {
  return (
    <div className="space-y-6 mt-2">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 relative">
          <p className="text-xs text-muted-foreground">Giá / đêm</p>
          <p className="text-2xl font-bold text-primary mt-1">
            {room.price.toLocaleString()}₫
          </p>
        </Card>

        <Card className="p-4 relative">
          <p className="text-xs text-muted-foreground">Sức chứa</p>
          <div className="flex items-center gap-3 mt-1 text-lg font-semibold">
            <UserRound className="w-5 h-5 text-primary" />
            {room.adultCapacity}
            <Baby className="w-5 h-5 text-primary ml-3" />
            {room.childCapacity}
          </div>
        </Card>

        <Card className="p-4 relative">
          <p className="text-xs text-muted-foreground">Đánh giá</p>
          <div className="flex items-center gap-2 mt-1 text-xl font-semibold">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            {room.rating ?? 0}
            <span className="text-sm text-muted-foreground">
              ({room.reviewCount ?? 0})
            </span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 relative">
            <h3 className="section-title">Mô tả & Vị trí</h3>

            <div className="space-y-4 text-sm">
              <div>
                <h4 className="label">Mô tả</h4>
                <p className="text-muted-foreground whitespace-pre-line">
                  {room.description || "Không có mô tả"}
                </p>
              </div>

              <div>
                <h4 className="label">Địa chỉ</h4>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-primary shrink-0 mt-1" />
                  <p>{room.location?.fullAddress || "Không rõ vị trí"}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 relative">
            <Button
              variant="outline"
              size="sm"
              className="absolute top-4 right-4 flex items-center gap-1"
              onClick={onEditAmenities}
            >
              <Pencil className="w-4 h-4" />
            </Button>

            <h3 className="section-title">Tiện nghi</h3>

            {room.amenities?.length ? (
              <div className="space-y-4">
                {Object.entries(
                  Object.groupBy(room.amenities, (a) => a.category)
                ).map(([cat, list]) => (
                  <div key={cat}>
                    <h4 className="text-sm font-semibold text-primary uppercase mb-2">
                      {cat}
                    </h4>

                    <div className="flex flex-wrap gap-2">
                      {list?.map((a) => (
                        <Badge
                          key={a.id}
                          variant="secondary"
                          className="flex items-center gap-2 py-1 px-2"
                        >
                          {getAmenityIcon(a.name)}
                          <span>{a.name}</span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                Chưa có tiện nghi nào.
              </p>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="section-title">Chủ sở hữu</h3>

            <div className="flex items-start gap-4">
              {room.host?.avatar ? (
                <img
                  src={room.host.avatar}
                  className="w-14 h-14 rounded-full object-cover"
                />
              ) : (
                <User className="w-14 h-14 p-3 border rounded-full text-muted-foreground" />
              )}

              <div className="space-y-1">
                <p className="font-bold text-lg">{room.host.name}</p>

                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" /> {room.host.email}
                </p>
                <p className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4" /> {room.host.phoneNumber}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 relative">
            <Button
              variant="outline"
              size="sm"
              className="absolute top-4 right-4 flex items-center gap-1"
              onClick={onEditBeds}
            >
              <Pencil className="w-4 h-4" />
            </Button>

            <h3 className="section-title">Thông tin giường</h3>

            {room.beds?.length ? (
              <div className="space-y-3">
                {room.beds.map((bed, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center border-b pb-2 last:border-none"
                  >
                    <div className="flex items-center gap-3">
                      <Bed className="w-5 h-5 text-primary" />
                      <span className="font-medium">{bed.type}</span>
                    </div>

                    <Badge>{bed.quantity} chiếc</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Không có thông tin giường.
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
