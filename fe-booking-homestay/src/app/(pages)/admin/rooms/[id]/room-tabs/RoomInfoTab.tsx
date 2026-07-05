"use client";

import { Badge } from "@/_components/ui/badge";
import { Button } from "@/_components/ui/button";
import { Card } from "@/_components/ui/card";
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
    <div className="space-y-5 sm:space-y-6 mt-4">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card className="p-3.5 sm:p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 bg-card shadow-2xs">
          <p className="text-[10px] sm:text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            Giá thuê / đêm
          </p>
          <p className="text-lg sm:text-xl lg:text-2xl font-extrabold text-primary mt-1">
            {room.price?.toLocaleString()}₫
          </p>
        </Card>

        <Card className="p-3.5 sm:p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 bg-card shadow-2xs">
          <p className="text-[10px] sm:text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            Sức chứa tối đa
          </p>
          <div className="flex items-center gap-2.5 sm:gap-3.5 mt-1.5 text-xs sm:text-sm lg:text-base font-bold text-slate-700 dark:text-slate-200">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <UserRound className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-primary" />
              <span>{room.adultCapacity} người lớn</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5">
              <Baby className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-primary" />
              <span>{room.childCapacity} trẻ em</span>
            </div>
          </div>
        </Card>

        <Card className="p-3.5 sm:p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 bg-card shadow-2xs sm:col-span-2 lg:col-span-1">
          <p className="text-[10px] sm:text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            Đánh giá chung
          </p>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1 sm:mt-1.5 text-sm sm:text-base lg:text-lg font-bold text-slate-800 dark:text-slate-200">
            <Star className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-yellow-500 fill-yellow-500" />
            <span>{room.rating ?? 0}</span>
            <span className="text-[10px] sm:text-xs lg:text-sm text-slate-400 dark:text-slate-500 font-medium">
              ({room.reviewCount ?? 0} nhận xét)
            </span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        <div className="lg:col-span-2 space-y-5 sm:space-y-6">
          {/* Mô tả & Vị trí */}
          <Card className="p-4 sm:p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 bg-card shadow-2xs">
            <h3 className="text-base sm:text-lg font-bold text-slate-850 dark:text-slate-100 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800/60">
              Mô tả & Vị trí
            </h3>

            <div className="space-y-5 text-xs sm:text-sm leading-relaxed">
              <div>
                <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                  Mô tả chi tiết
                </h4>
                <p className="text-slate-650 dark:text-slate-300 whitespace-pre-line">
                  {room.description || "Không có mô tả cho phòng này."}
                </p>
              </div>

              <div className="pt-2">
                <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  Địa chỉ thực tế
                </h4>
                <div className="flex items-start gap-2 text-slate-700 dark:text-slate-300 font-medium">
                  <MapPin className="w-4.5 h-4.5 text-primary shrink-0 mt-0.5" />
                  <p>{room.location?.fullAddress || "Không rõ vị trí"}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Tiện nghi */}
          <Card className="p-4 sm:p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 bg-card shadow-2xs">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100 dark:border-slate-800/60">
              <h3 className="text-base sm:text-lg font-bold text-slate-850 dark:text-slate-100">
                Tiện nghi phòng
              </h3>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg border-slate-200 dark:border-slate-800 cursor-pointer text-xs sm:text-sm font-semibold"
                onClick={onEditAmenities}
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Chỉnh sửa</span>
              </Button>
            </div>

            {room.amenities?.length ? (
              <div className="space-y-5">
                {Object.entries(
                  Object.groupBy(room.amenities, (a) => a.category),
                ).map(([cat, list]) => (
                  <div key={cat} className="space-y-2">
                    <h4 className="text-[10px] sm:text-xs font-bold text-primary uppercase tracking-wider">
                      {cat}
                    </h4>

                    <div className="flex flex-wrap gap-2">
                      {list?.map((a) => (
                        <Badge
                          key={a.id}
                          className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg border border-slate-200/50 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 text-xs font-semibold shadow-none cursor-default select-none"
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
              <p className="text-slate-400 dark:text-slate-500 italic text-xs py-2">
                Chưa cấu hình danh sách tiện nghi.
              </p>
            )}
          </Card>
        </div>

        <div className="space-y-5 sm:space-y-6">
          {/* Chủ sở hữu */}
          <Card className="p-4 sm:p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 bg-card shadow-2xs">
            <h3 className="text-base sm:text-lg font-bold text-slate-850 dark:text-slate-100 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800/60">
              Chủ sở hữu
            </h3>

            <div className="flex items-start gap-4">
              {room.host?.avatar ? (
                <img
                  src={room.host.avatar}
                  alt={room.host.name}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border border-slate-100 shadow-2xs"
                />
              ) : (
                <User className="w-12 h-12 sm:w-14 sm:h-14 p-3 border rounded-full text-slate-400 bg-slate-50 dark:bg-slate-900/60 shrink-0" />
              )}

              <div className="space-y-1.5 min-w-0">
                <p className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-150 truncate">
                  {room.host?.name || "Chưa có thông tin host"}
                </p>

                <p className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{room.host?.email}</span>
                </p>
                <p className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{room.host?.phoneNumber || "N/A"}</span>
                </p>
              </div>
            </div>
          </Card>

          {/* Thông tin giường */}
          <Card className="p-4 sm:p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 bg-card shadow-2xs relative">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100 dark:border-slate-800/60">
              <h3 className="text-base sm:text-lg font-bold text-slate-850 dark:text-slate-100">
                Thông tin giường
              </h3>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg border-slate-200 dark:border-slate-800 cursor-pointer text-xs sm:text-sm font-semibold"
                onClick={onEditBeds}
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Chỉnh sửa</span>
              </Button>
            </div>

            {room.beds?.length ? (
              <div className="space-y-3">
                {room.beds.map((bed, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-2.5 last:border-none last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <Bed className="w-4.5 h-4.5 text-primary" />
                      <span className="font-semibold text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                        Giường {bed.type}
                      </span>
                    </div>

                    <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/30 px-2 py-0.5 rounded-md text-xs font-semibold shadow-none">
                      {bed.quantity} chiếc
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 dark:text-slate-500 italic text-xs py-2">
                Chưa thêm thông tin giường.
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
