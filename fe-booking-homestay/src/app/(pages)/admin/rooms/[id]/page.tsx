"use client";

import { use, useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Loader2,
  MapPin,
  Image as ImageIcon,
  User,
  Mail,
  Phone,
  Star,
  BedDouble,
  Baby,
  UserRound,
  Bed,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";

import { getRoomById } from "@/services/admin/roomsApi";
import type { Room } from "@/types/room";
import { getAmenityIcon } from "@/constants/amenity-icons";

export default function RoomDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params); // ✅ unwrap Promise
  const { toast } = useToast();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);

  // 🧭 Fetch room data
  useEffect(() => {
    (async () => {
      try {
        const data = await getRoomById(Number(id));
        setRoom(data);
      } catch (err: any) {
        toast({
          variant: "destructive",
          title: "Không thể tải thông tin phòng",
          description:
            err?.response?.data?.message || err?.message || "Vui lòng thử lại.",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // 📦 Group amenities by category
  const groupedAmenities = useMemo(() => {
    if (!room?.amenities?.length) return {};
    return room.amenities.reduce((acc, a) => {
      if (!acc[a.category]) acc[a.category] = [];
      acc[a.category].push(a);
      return acc;
    }, {} as Record<string, typeof room.amenities>);
  }, [room]);

  // ⏳ Loading state
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-warm-700" />
      </div>
    );

  if (!room)
    return (
      <Card className="p-6 text-center text-red-600">
        Không tìm thấy thông tin phòng.
        <div className="mt-4">
          <Link href="/admin/rooms">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
            </Button>
          </Link>
        </div>
      </Card>
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/rooms">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-warm-900">{room.name}</h1>
            <p className="text-warm-600 capitalize">{room.status}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Edit2 className="w-4 h-4 mr-2" />
            Chỉnh sửa
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700 bg-transparent"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Xóa
          </Button>
        </div>
      </div>

      {/* Quick Info */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Giá / đêm</p>
          <p className="text-lg font-semibold text-warm-900">
            {room.price.toLocaleString()}₫
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Sức chứa</p>
          <div className="text-lg font-semibold text-warm-900 flex items-center gap-3">
            <div className="flex items-center gap-1">
              <UserRound className="w-4 h-4 text-muted-foreground" />
              {room.adultCapacity}
            </div>
            {room.childCapacity ? (
              <div className="flex items-center gap-1">
                <Baby className="w-4 h-4 text-muted-foreground" />
                {room.childCapacity}
              </div>
            ) : null}
          </div>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Đánh giá</p>
          <p className="text-lg font-semibold text-warm-900 flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />{" "}
            {room.rating ?? 0} ({room.reviewCount ?? 0})
          </p>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="info">Thông tin</TabsTrigger>
          <TabsTrigger value="amenities">Tiện nghi</TabsTrigger>
          <TabsTrigger value="beds">Giường</TabsTrigger>
          <TabsTrigger value="images">Hình ảnh</TabsTrigger>
        </TabsList>

        {/* Info */}
        <TabsContent value="info">
          <Card className="p-6 space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-warm-900 mb-1">
                Mô tả
              </h3>
              <p className="text-sm text-muted-foreground">
                {room.description || "Chưa có mô tả"}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-warm-900 mb-1">
                Vị trí
              </h3>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {room.location?.fullAddress || "Không rõ địa chỉ"}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-warm-900 mb-1">
                Chủ sở hữu
              </h3>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                {room.host.avatar ? (
                  <img
                    src={room.host.avatar}
                    alt={room.host.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 text-warm-400" />
                )}
                <div>
                  <p className="font-medium text-warm-900">{room.host.name}</p>
                  <p className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" /> {room.host.email}
                  </p>
                  <p className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" /> {room.host.phoneNumber}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Amenities */}
        <TabsContent value="amenities">
          <Card className="p-6 space-y-6">
            {Object.keys(groupedAmenities).length ? (
              Object.entries(groupedAmenities).map(([category, list]) => (
                <div key={category}>
                  <h4 className="text-md font-semibold mb-3 text-warm-900 uppercase">
                    {category}
                  </h4>
                  <div className="grid grid-cols-4 gap-3">
                    {list.map((a) => (
                      <Tooltip key={a.id}>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2 p-2 rounded-md border border-warm-200 bg-muted/30 hover:bg-muted/50 transition">
                            {getAmenityIcon(a.name)}
                            <div className="flex flex-col">
                              <p className="text-sm font-medium text-warm-900">
                                {a.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {a.category}
                              </p>
                            </div>
                          </div>
                        </TooltipTrigger>
                      </Tooltip>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center">
                Chưa có tiện nghi nào.
              </p>
            )}
          </Card>
        </TabsContent>

        {/* Beds */}
        <TabsContent value="beds">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-warm-900 mb-4">
              Loại giường
            </h3>
            {room.beds?.length ? (
              <div className="grid grid-cols-3 gap-4">
                {room.beds.map((b, i) => (
                  <Card
                    key={i}
                    className="p-3 flex items-center justify-between border-warm-200"
                  >
                    <div className="flex items-center gap-2">
                      <Bed className="w-4 h-4 text-muted-foreground" />
                      <p className="font-medium text-warm-900">{b.type}</p>
                    </div>
                    <Badge>{b.quantity}</Badge>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">
                Chưa có thông tin giường.
              </p>
            )}
          </Card>
        </TabsContent>

        {/* Images */}
        <TabsContent value="images">
          <Card className="p-6">
            <div className="grid grid-cols-3 gap-4">
              {room.images?.gallery?.length ? (
                room.images.gallery.map((img) => (
                  <div
                    key={img.id}
                    className="relative aspect-video rounded-lg overflow-hidden"
                  >
                    <img
                      src={img.url}
                      alt={room.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center text-muted-foreground py-10">
                  <div className="inline-flex flex-col items-center">
                    <ImageIcon className="w-8 h-8 mb-2 opacity-70" />
                    <p>Chưa có ảnh nào cho phòng này</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
