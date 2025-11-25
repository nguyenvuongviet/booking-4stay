"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { RoomFormModal } from "../_components/RoomFormModal";
import { UpdateAmenitiesModal } from "./_components/UpdateAmenitiesModal";
import { UpdateBedsModal } from "./_components/UpdateBedsModal";
import { useRoomDetail } from "./_hooks/useRoomDetail";
import { useRoomExtrasForm } from "./_hooks/useRoomExtrasForm";
import RoomBookingsTab from "./room-tabs/RoomBookingsTab";
import RoomImagesTab from "./room-tabs/RoomImagesTab";
import RoomInfoTab from "./room-tabs/RoomInfoTab";
import RoomReviewsTab from "./room-tabs/RoomReviewsTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function RoomDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const { room, bookings, reviews, loading, reload, handleDelete } =
    useRoomDetail(Number(id), () => router.push("/admin/rooms"));

  const extras = useRoomExtrasForm(Number(id));

  const [openEditRoom, setOpenEditRoom] = useState(false);
  const [openAmenities, setOpenAmenities] = useState(false);
  const [openBeds, setOpenBeds] = useState(false);

  const handleOpenAmenities = () => {
    if (!room) return;
    extras.setAmenityIds(room.amenities.map((a) => a.id));
    extras.fetchAmenities();
    setOpenAmenities(true);
  };

  const handleOpenBeds = () => {
    if (!room) return;
    extras.setBeds(room.beds);
    setOpenBeds(true);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );

  if (!room)
    return (
      <Card className="p-10 text-center bg-red-50 border border-red-300">
        <p className="text-lg text-red-600 font-semibold">
          Không tìm thấy phòng.
        </p>
        <Link href="/admin/rooms" className="inline-block mt-4">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại danh sách
          </Button>
        </Link>
      </Card>
    );

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/admin/rooms">
              <ArrowLeft />
            </Link>
          </Button>

          <div>
            <h1 className="text-3xl font-bold">{room.name}</h1>
            <Badge
              className={`mt-1 ${
                room.status === "AVAILABLE"
                  ? "bg-green-100 text-green-700"
                  : room.status === "BOOKED"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {room.status}
            </Badge>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setOpenEditRoom(true)}>
            <Pencil className="w-4 h-4 mr-1" /> Chỉnh sửa
          </Button>

          <Button
            className="bg-red-500 hover:bg-red-600"
            onClick={handleDelete}
          >
            <Trash2 className="w-4 h-4 mr-1" /> Xoá
          </Button>
        </div>
      </div>

      {/* TABS */}
      <Tabs defaultValue="info">
        <TabsList className="grid grid-cols-4 w-full h-12">
          <TabsTrigger value="info">Thông tin</TabsTrigger>
          <TabsTrigger value="bookings">
            Đặt phòng ({bookings.length})
          </TabsTrigger>
          <TabsTrigger value="reviews">Đánh giá ({reviews.length})</TabsTrigger>
          <TabsTrigger value="images">Hình ảnh</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <RoomInfoTab
            room={room}
            onEditAmenities={handleOpenAmenities}
            onEditBeds={handleOpenBeds}
          />
        </TabsContent>

        <TabsContent value="bookings">
          <RoomBookingsTab bookings={bookings} />
        </TabsContent>

        <TabsContent value="reviews">
          <RoomReviewsTab reviews={reviews} />
        </TabsContent>

        <TabsContent value="images">
          <RoomImagesTab room={room} reload={reload} />
        </TabsContent>
      </Tabs>

      <RoomFormModal
        open={openEditRoom}
        onClose={() => setOpenEditRoom(false)}
        onSuccess={reload}
        isEditMode
        initialData={room}
      />

      <UpdateAmenitiesModal
        open={openAmenities}
        onClose={() => setOpenAmenities(false)}
        allAmenities={extras.allAmenities}
        values={extras.amenityIds}
        updateValues={extras.setAmenityIds}
        onSubmit={async () => {
          await extras.submitAmenities();
          reload();
          setOpenAmenities(false);
        }}
        loading={extras.loadingAmenities}
      />

      <UpdateBedsModal
        open={openBeds}
        onClose={() => setOpenBeds(false)}
        beds={extras.beds}
        updateBeds={extras.setBeds}
        onSubmit={async () => {
          await extras.submitBeds();
          reload();
          setOpenBeds(false);
        }}
        loading={extras.loadingBeds}
      />
    </div>
  );
}
