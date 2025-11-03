"use client";

import {
  ArrowLeft,
  Baby,
  Loader2,
  Pencil,
  Star,
  Trash2,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { formatDate } from "@/lib/utils/date";

import {
  deleteRoom,
  getBookingsByRoomId,
  getReviewsByRoomId,
  getRoomById,
  updateRoom,
} from "@/services/admin/roomsApi";
import type { Room, UpdateRoomDto } from "@/types/room";

import { RoomFormModal } from "@/components/admin/room-form-modal";
import { handleDeleteEntity } from "@/lib/utils/handleDelete";
import RoomBookingsTab from "./room-tabs/RoomBookingsTab";
import RoomImagesTab from "./room-tabs/RoomImagesTab";
import RoomInfoTab from "./room-tabs/RoomInfoTab";
import RoomReviewsTab from "./room-tabs/RoomReviewsTab";

export default function RoomDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { toast } = useToast();
  const router = useRouter();

  const [room, setRoom] = useState<Room | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openEdit, setOpenEdit] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchRoomData = async () => {
    try {
      const [roomData, bookingData, reviewData] = await Promise.all([
        getRoomById(Number(id)),
        getBookingsByRoomId(Number(id)),
        getReviewsByRoomId(Number(id)),
      ]);
      setRoom(roomData);
      setBookings(bookingData);
      setReviews(reviewData);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Không thể tải thông tin phòng",
        description:
          err?.response?.data?.message ||
          err?.message ||
          "Vui lòng thử lại sau.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomData();
  }, [id]);

  const groupedAmenities = useMemo(() => {
    if (!room?.amenities?.length) return {};
    return room.amenities.reduce((acc, a) => {
      if (!acc[a.category]) acc[a.category] = [];
      acc[a.category].push(a);
      return acc;
    }, {} as Record<string, typeof room.amenities>);
  }, [room]);

  const handleUpdate = async (data: UpdateRoomDto) => {
    if (!room) return;
    try {
      setSaving(true);
      await updateRoom(room.id, data);
      toast({
        title: "Cập nhật thành công!",
        description: `Phòng "${data.name}" đã được cập nhật.`,
      });
      await fetchRoomData();
      setOpenEdit(false);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Cập nhật thất bại",
        description:
          err?.response?.data?.message || "Không thể cập nhật phòng.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!room) return;
    await handleDeleteEntity(
      "phòng",
      () => deleteRoom(room.id),
      () => {
        router.push("/admin/rooms");
      }
    );
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );

  if (!room)
    return (
      <Card className="p-8 text-center border-red-300 bg-red-50">
        <h2 className="text-xl font-semibold text-red-700">
          Không tìm thấy thông tin phòng.
        </h2>
        <div className="mt-6">
          <Link href="/admin/rooms">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại danh sách
            </Button>
          </Link>
        </div>
      </Card>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/rooms">
            <Button variant="ghost" size="icon" className="hover:bg-muted">
              <ArrowLeft className="w-6 h-6 text-warm-700" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-warm-900">
              {room.name}
            </h1>
            <Badge
              className={`mt-1 font-semibold text-xs py-1 px-3 ${
                room.status === "AVAILABLE"
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : room.status === "BOOKED"
                  ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                  : "bg-red-100 text-red-700 border border-red-200"
              }`}
            >
              {room.status.toUpperCase()}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setOpenEdit(true)}
            className="gap-2"
          >
            <Pencil className="w-4 h-4" />
            Chỉnh sửa
          </Button>

          <Button
            variant="destructive"
            onClick={handleDelete}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Xóa
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border-2 border-primary shadow-md">
          <p className="text-sm text-muted-foreground font-medium">Giá / đêm</p>
          <p className="text-2xl font-bold text-primary mt-1">
            {room.price.toLocaleString()}₫
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-muted-foreground font-medium">
            Sức chứa tối đa
          </p>
          <div className="text-lg font-semibold text-warm-900 flex items-center gap-3 mt-1">
            <UserRound className="w-5 h-5 text-primary" />
            <span className="font-bold">{room.adultCapacity}</span>
            {room.childCapacity ? (
              <>
                <Baby className="w-5 h-5 text-primary ml-4" />
                <span className="font-bold">{room.childCapacity}</span>
              </>
            ) : null}
          </div>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-muted-foreground font-medium">
            Điểm đánh giá
          </p>
          <p className="text-xl font-bold text-warm-900 flex items-center gap-2 mt-1">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            <span className="text-2xl">{room.rating ?? 0}</span>
            <span className="text-base font-normal text-muted-foreground">
              ({room.reviewCount ?? 0})
            </span>
          </p>
        </Card>
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid grid-cols-4 w-full h-12">
          <TabsTrigger value="info">Thông tin</TabsTrigger>
          <TabsTrigger value="bookings">
            Đặt phòng ({bookings.length})
          </TabsTrigger>
          <TabsTrigger value="reviews">Đánh giá ({reviews.length})</TabsTrigger>
          <TabsTrigger value="images">Hình ảnh</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <RoomInfoTab room={room} groupedAmenities={groupedAmenities} />
        </TabsContent>

        <TabsContent value="bookings">
          <RoomBookingsTab bookings={bookings} formatDate={formatDate} />
        </TabsContent>

        <TabsContent value="reviews">
          <RoomReviewsTab reviews={reviews} formatDate={formatDate} />
        </TabsContent>

        <TabsContent value="images">
          <RoomImagesTab room={room} />
        </TabsContent>
      </Tabs>

      {room && (
        <RoomFormModal
          open={openEdit}
          onOpenChange={setOpenEdit}
          isEditMode
          initialData={room}
          onSubmit={handleUpdate}
          saving={saving}
        />
      )}
    </div>
  );
}
