"use client";

import { Badge } from "@/_components/ui/badge";
import { Button } from "@/_components/ui/button";
import { Card } from "@/_components/ui/card";
import { useToast } from "@/_components/ui/use-toast";
import { updateRoom } from "@/services/admin/roomsApi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { ArrowLeft, Lock, Pencil, Trash2, Unlock } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, use, useState } from "react";
import CalendarGrid from "../../_components/calendar/CalendarGrid";
import { RefreshButton } from "../../_components/RefreshButton";
import { RoomFormModal } from "../_components/RoomFormModal";
import { UpdateAmenitiesModal } from "./_components/UpdateAmenitiesModal";
import { UpdateBedsModal } from "./_components/UpdateBedsModal";
import { useRoomDetail } from "./_hooks/useRoomDetail";
import { useRoomExtrasForm } from "./_hooks/useRoomExtrasForm";
import RoomBookingsTab from "./room-tabs/RoomBookingsTab";
import RoomImagesTab from "./room-tabs/RoomImagesTab";
import RoomInfoTab from "./room-tabs/RoomInfoTab";
import RoomReviewsTab from "./room-tabs/RoomReviewsTab";
import RoomStatsTab from "./room-tabs/RoomStatsTab";

function RoomDetailContent({ id }: { id: number | string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "calendar";

  const handleTabChange = (value: string) => {
    router.push(`/admin/rooms/${id}?tab=${value}`, { scroll: false });
  };

  const { toast } = useToast();
  const {
    room,
    bookings,
    reviews,
    soldOutDates,
    roomPrices,
    loading,
    reload,
    handleDelete,
  } = useRoomDetail(Number(id), () => router.push("/admin/rooms"));

  const extras = useRoomExtrasForm(Number(id));

  const [openEditRoom, setOpenEditRoom] = useState(false);
  const [openAmenities, setOpenAmenities] = useState(false);
  const [openBeds, setOpenBeds] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const defaultPrice = room?.price || 0;

  const handleToggleStatus = async () => {
    if (!room) return;
    const isMaintenance = room.status === "MAINTENANCE";
    const newStatus = isMaintenance ? "AVAILABLE" : "MAINTENANCE";
    const actionText = isMaintenance ? "mở khóa" : "khóa";

    try {
      setUpdatingStatus(true);
      await updateRoom(Number(id), { status: newStatus });
      toast({
        variant: "success",
        title: `${isMaintenance ? "Mở khóa" : "Khóa"} phòng thành công`,
        description: `Phòng ${room.name} đã được ${actionText}.`,
      });
      reload();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: `Không thể ${actionText} phòng`,
        description: err?.response?.data?.message || err.message,
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

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
      <Card className="backdrop-blur-lg bg-white/30 border border-white/20 shadow-md rounded-2xl p-6">
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
      <div className="flex items-center justify-between backdrop-blur-xl bg-white/20 border border-white/10 shadow-lg p-4 rounded-2xl">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/admin/rooms">
              <ArrowLeft />
            </Link>
          </Button>

          <div>
            <h1 className="text-3xl font-bold">{room.name}</h1>

            <div className="flex items-center gap-3 mt-2">
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold tracking-wide shadow-sm">
                ROOM ID: {room.id}
              </span>
              <Badge
                className={
                  room.status === "AVAILABLE"
                    ? "bg-green-100 text-green-700"
                    : room.status === "BOOKED"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                }
              >
                {room.status === "AVAILABLE"
                  ? "Sẵn sàng"
                  : room.status === "BOOKED"
                    ? "Đang đặt"
                    : room.status === "MAINTENANCE"
                      ? "Đang khóa (Bảo trì)"
                      : room.status}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <RefreshButton onRefresh={reload} />
          <Button
            variant="outline"
            onClick={handleToggleStatus}
            disabled={updatingStatus}
            className={`cursor-pointer ${
              room.status === "MAINTENANCE"
                ? "border-emerald-200 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 font-semibold"
                : "border-amber-200 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-amber-600 dark:text-amber-400 font-semibold"
            }`}
          >
            {room.status === "MAINTENANCE" ? (
              <>
                <Unlock className="w-4 h-4 mr-1" /> Mở khóa
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-1" /> Khóa phòng
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => setOpenEditRoom(true)}
            className="cursor-pointer"
          >
            <Pencil className="w-4 h-4 mr-1" /> Chỉnh sửa
          </Button>
          <Button
            className="bg-red-500/70 backdrop-blur-md hover:bg-red-600/70 text-white cursor-pointer"
            onClick={handleDelete}
          >
            <Trash2 className="w-4 h-4 mr-1" /> Xoá
          </Button>
        </div>
      </div>

      <Tabs value={currentTab} onValueChange={handleTabChange}>
        <TabsList className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 w-full h-auto backdrop-blur-md bg-white/30 border border-white/20 shadow-sm rounded-2xl p-1.5 gap-1.5 mb-5">
          <TabsTrigger
            className="data-[state=active]:bg-white/80 data-[state=active]:shadow-lg data-[state=active]:backdrop-blur-xl data-[state=active]:text-black bg-white/10 text-gray-700 rounded-xl font-medium py-2.5 lg:py-0 transition-all hover:bg-white/20 cursor-pointer"
            value="calendar"
          >
            Lịch phòng
          </TabsTrigger>
          <TabsTrigger
            className="data-[state=active]:bg-white/80 data-[state=active]:shadow-lg data-[state=active]:backdrop-blur-xl data-[state=active]:text-black bg-white/10 text-gray-700 rounded-xl font-medium py-2.5 lg:py-0 transition-all hover:bg-white/20 cursor-pointer"
            value="info"
          >
            Thông tin
          </TabsTrigger>
          <TabsTrigger
            className="data-[state=active]:bg-white/80 data-[state=active]:shadow-lg data-[state=active]:backdrop-blur-xl data-[state=active]:text-black bg-white/10 text-gray-700 rounded-xl font-medium py-2.5 lg:py-0 transition-all hover:bg-white/20 cursor-pointer"
            value="bookings"
          >
            Đặt phòng ({bookings.length})
          </TabsTrigger>
          <TabsTrigger
            className="data-[state=active]:bg-white/80 data-[state=active]:shadow-lg data-[state=active]:backdrop-blur-xl data-[state=active]:text-black bg-white/10 text-gray-700 rounded-xl font-medium py-2.5 lg:py-0 transition-all hover:bg-white/20 cursor-pointer"
            value="reviews"
          >
            Đánh giá ({reviews.length})
          </TabsTrigger>
          <TabsTrigger
            className="data-[state=active]:bg-white/80 data-[state=active]:shadow-lg data-[state=active]:backdrop-blur-xl data-[state=active]:text-black bg-white/10 text-gray-700 rounded-xl font-medium py-2.5 lg:py-0 transition-all hover:bg-white/20 cursor-pointer"
            value="images"
          >
            Hình ảnh
          </TabsTrigger>
          <TabsTrigger
            className="data-[state=active]:bg-white/80 data-[state=active]:shadow-lg data-[state=active]:backdrop-blur-xl data-[state=active]:text-black bg-white/10 text-gray-700 rounded-xl font-medium py-2.5 lg:py-0 transition-all hover:bg-white/20 cursor-pointer"
            value="stats"
          >
            Thống kê
          </TabsTrigger>
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

        <TabsContent value="calendar">
          <Card className="p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 bg-card">
            <CalendarGrid
              roomId={room.id}
              soldOutDates={soldOutDates}
              defaultPrice={defaultPrice}
              roomPriceDates={roomPrices}
              bookings={bookings}
            />
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <RoomReviewsTab reviews={reviews} />
        </TabsContent>

        <TabsContent value="images">
          <RoomImagesTab room={room} reload={reload} />
        </TabsContent>

        <TabsContent value="stats">
          <RoomStatsTab bookings={bookings} />
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

export default function RoomDetailPage({
  params,
}: {
  params: Promise<{ id: number | string }>;
}) {
  const { id } = use(params);
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      }
    >
      <RoomDetailContent id={id} />
    </Suspense>
  );
}
