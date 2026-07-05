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
import { Suspense, use, useEffect, useState, type ReactNode } from "react";
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

/* ── Skeleton Blocks ── */
function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={`bg-slate-200/70 dark:bg-slate-800 rounded-xl animate-pulse ${className ?? ""}`}
    />
  );
}

function InfoSkeleton() {
  return (
    <div className="space-y-5 mt-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 space-y-3"
          >
            <SkeletonBlock className="h-3 w-24" />
            <SkeletonBlock className="h-6 w-32" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 space-y-4">
            <SkeletonBlock className="h-5 w-36" />
            <SkeletonBlock className="h-3 w-full" />
            <SkeletonBlock className="h-3 w-4/5" />
            <SkeletonBlock className="h-3 w-3/5" />
          </div>
          <div className="p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 space-y-3">
            <SkeletonBlock className="h-5 w-32" />
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <SkeletonBlock key={i} className="h-7 w-20 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
        <div className="p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 space-y-3">
          <SkeletonBlock className="h-5 w-28" />
          <SkeletonBlock className="h-4 w-full" />
          <SkeletonBlock className="h-4 w-4/5" />
          <SkeletonBlock className="h-4 w-3/5" />
        </div>
      </div>
    </div>
  );
}

function CalendarSkeleton() {
  return (
    <div className="p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 space-y-4 mt-4">
      <div className="flex items-center justify-between">
        <SkeletonBlock className="h-6 w-36" />
        <div className="flex gap-2">
          <SkeletonBlock className="h-8 w-8 rounded-lg" />
          <SkeletonBlock className="h-8 w-8 rounded-lg" />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: 7 }).map((_, i) => (
          <SkeletonBlock key={`h-${i}`} className="h-8" />
        ))}
        {Array.from({ length: 35 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-16 sm:h-20" />
        ))}
      </div>
    </div>
  );
}

function BookingsSkeleton() {
  return (
    <div className="space-y-3 mt-4">
      <div className="flex gap-2">
        <SkeletonBlock className="h-9.5 flex-1 max-w-xs" />
        <SkeletonBlock className="h-9.5 w-28" />
      </div>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 flex items-center gap-4"
        >
          <SkeletonBlock className="w-10 h-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonBlock className="h-4 w-32" />
            <SkeletonBlock className="h-3 w-48" />
          </div>
          <SkeletonBlock className="h-6 w-20 rounded-md" />
        </div>
      ))}
    </div>
  );
}

function ReviewsSkeleton() {
  return (
    <div className="space-y-4 mt-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 space-y-3">
          <SkeletonBlock className="h-4 w-32" />
          <SkeletonBlock className="h-10 w-16" />
          <SkeletonBlock className="h-4 w-24" />
        </div>
        <div className="p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 space-y-2.5">
          <SkeletonBlock className="h-4 w-36" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <SkeletonBlock className="h-3 w-6" />
              <SkeletonBlock className="h-3 flex-1" />
              <SkeletonBlock className="h-3 w-6" />
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <SkeletonBlock className="h-9 w-32" />
        <SkeletonBlock className="h-9 w-28 ml-auto" />
      </div>
      {[1, 2].map((i) => (
        <div
          key={i}
          className="p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 space-y-3"
        >
          <div className="flex items-start gap-3">
            <SkeletonBlock className="w-10 h-10 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="flex justify-between">
                <SkeletonBlock className="h-4 w-28" />
                <SkeletonBlock className="h-4 w-20" />
              </div>
              <SkeletonBlock className="h-3 w-20" />
            </div>
          </div>
          <SkeletonBlock className="h-3 w-full" />
          <SkeletonBlock className="h-3 w-3/4" />
        </div>
      ))}
    </div>
  );
}

function ImagesSkeleton() {
  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-between">
        <SkeletonBlock className="h-5 w-28" />
        <SkeletonBlock className="h-9 w-32 rounded-xl" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <SkeletonBlock key={i} className="aspect-4/3 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="space-y-5 mt-4">
      <div className="flex gap-2">
        <SkeletonBlock className="h-9.5 w-36" />
        <SkeletonBlock className="h-9.5 w-36" />
        <SkeletonBlock className="h-9.5 w-28 ml-auto" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 space-y-2"
          >
            <SkeletonBlock className="h-3 w-20" />
            <SkeletonBlock className="h-7 w-24" />
          </div>
        ))}
      </div>
      <div className="p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/40">
        <SkeletonBlock className="h-48 w-full" />
      </div>
    </div>
  );
}

const skeletonMap: Record<string, () => ReactNode> = {
  info: () => <InfoSkeleton />,
  calendar: () => <CalendarSkeleton />,
  bookings: () => <BookingsSkeleton />,
  reviews: () => <ReviewsSkeleton />,
  images: () => <ImagesSkeleton />,
  stats: () => <StatsSkeleton />,
};

function TabSkeleton({
  type,
  children,
}: {
  type: string;
  children: ReactNode;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 300);
    return () => clearTimeout(timer);
  }, []);

  if (!ready) {
    return skeletonMap[type]?.() ?? null;
  }

  return <>{children}</>;
}

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

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="bg-card p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs flex flex-col lg:flex-row items-center lg:items-start gap-4">
          <div className="w-9 h-9 bg-slate-200 dark:bg-slate-800 rounded-xl shrink-0" />
          <div className="grow w-full space-y-3.5">
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
            <div className="flex gap-2">
              <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-16" />
              <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-20" />
            </div>
          </div>
          <div className="flex gap-2 w-full lg:w-auto mt-2 lg:mt-0">
            <div className="h-9.5 bg-slate-200 dark:bg-slate-800 rounded-xl flex-1 lg:w-24" />
            <div className="h-9.5 bg-slate-200 dark:bg-slate-800 rounded-xl flex-1 lg:w-28" />
            <div className="h-9.5 bg-slate-200 dark:bg-slate-800 rounded-xl flex-1 lg:w-24" />
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="h-11.5 bg-slate-100 dark:bg-slate-800 rounded-xl sm:rounded-2xl w-full" />

        {/* Content Skeleton */}
        <div className="p-6 bg-card border border-border rounded-2xl h-96 w-full shadow-2xs" />
      </div>
    );
  }

  if (!room)
    return (
      <Card className="border border-red-200/60 dark:border-red-900/30 rounded-2xl p-6 shadow-sm bg-white dark:bg-slate-900">
        <p className="text-sm sm:text-base text-red-600 dark:text-red-400 font-semibold">
          Không tìm thấy phòng.
        </p>
        <Link href="/admin/rooms" className="inline-block mt-4">
          <Button variant="outline" className="rounded-xl cursor-pointer">
            <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại danh sách
          </Button>
        </Link>
      </Card>
    );

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shadow-2xs">
        <div className="flex items-start gap-3 sm:gap-4 min-w-0">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 rounded-xl border border-slate-200/50 dark:border-slate-800"
          >
            <Link href="/admin/rooms">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>

          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
              {room.name}
            </h1>

            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span className="px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider border border-blue-200/30">
                ROOM ID: {room.id}
              </span>
              <Badge
                className={`px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-semibold shadow-none border ${
                  room.status === "AVAILABLE"
                    ? "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200/30"
                    : room.status === "BOOKED"
                      ? "bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400 border-yellow-200/30"
                      : "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200/30"
                }`}
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

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <RefreshButton
            onRefresh={reload}
            className="h-9 w-9 p-0 sm:w-auto sm:h-9 sm:px-3 rounded-lg border border-border/80 cursor-pointer"
          />
          <Button
            variant="outline"
            onClick={handleToggleStatus}
            disabled={updatingStatus}
            className={`h-9 text-xs sm:text-sm px-3 rounded-lg cursor-pointer flex-1 lg:flex-none font-semibold ${
              room.status === "MAINTENANCE"
                ? "border-emerald-250/60 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-900/40 dark:text-emerald-400 dark:hover:bg-emerald-950/20"
                : "border-amber-250/60 text-amber-600 hover:bg-amber-50 dark:border-amber-900/40 dark:text-amber-400 dark:hover:bg-amber-950/20"
            }`}
          >
            {room.status === "MAINTENANCE" ? (
              <>
                <Unlock className="w-3.5 h-3.5 mr-1" /> Mở khóa
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 mr-1" /> Khóa phòng
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => setOpenEditRoom(true)}
            className="h-9 text-xs sm:text-sm px-3 rounded-lg cursor-pointer flex-1 lg:flex-none border-slate-200 dark:border-slate-800"
          >
            <Pencil className="w-3.5 h-3.5 mr-1" /> Chỉnh sửa
          </Button>
          <Button
            variant="destructive"
            className="h-9 text-xs sm:text-sm px-3 rounded-lg cursor-pointer flex-1 lg:flex-none text-white hover:bg-destructive/90"
            onClick={handleDelete}
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" /> Xoá
          </Button>
        </div>
      </div>

      <Tabs
        value={currentTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <div className="sticky top-16 sm:top-20 z-20 -mx-4 px-4 py-2.5 sm:-mx-6 sm:px-6 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800 transition-all duration-300">
          <TabsList className="flex items-center gap-1 w-full overflow-x-auto beautiful-scrollbar bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl sm:rounded-2xl border border-slate-200/40 dark:border-slate-800 shadow-2xs">
            <TabsTrigger
              className="bg-transparent! data-[state=active]:bg-white! dark:data-[state=active]:bg-slate-900! data-[state=active]:text-primary! text-slate-600 dark:text-slate-350 data-[state=active]:shadow-xs! border border-transparent data-[state=active]:border-slate-200/50! text-xs sm:text-sm rounded-lg sm:rounded-xl font-semibold px-4 py-2 cursor-pointer transition-all shrink-0"
              value="calendar"
            >
              Lịch phòng
            </TabsTrigger>
            <TabsTrigger
              className="bg-transparent! data-[state=active]:bg-white! dark:data-[state=active]:bg-slate-900! data-[state=active]:text-primary! text-slate-600 dark:text-slate-350 data-[state=active]:shadow-xs! border border-transparent data-[state=active]:border-slate-200/50! text-xs sm:text-sm rounded-lg sm:rounded-xl font-semibold px-4 py-2 cursor-pointer transition-all shrink-0"
              value="info"
            >
              Thông tin
            </TabsTrigger>
            <TabsTrigger
              className="bg-transparent! data-[state=active]:bg-white! dark:data-[state=active]:bg-slate-900! data-[state=active]:text-primary! text-slate-600 dark:text-slate-350 data-[state=active]:shadow-xs! border border-transparent data-[state=active]:border-slate-200/50! text-xs sm:text-sm rounded-lg sm:rounded-xl font-semibold px-4 py-2 cursor-pointer transition-all shrink-0"
              value="bookings"
            >
              Đặt phòng ({bookings.length})
            </TabsTrigger>
            <TabsTrigger
              className="bg-transparent! data-[state=active]:bg-white! dark:data-[state=active]:bg-slate-900! data-[state=active]:text-primary! text-slate-600 dark:text-slate-350 data-[state=active]:shadow-xs! border border-transparent data-[state=active]:border-slate-200/50! text-xs sm:text-sm rounded-lg sm:rounded-xl font-semibold px-4 py-2 cursor-pointer transition-all shrink-0"
              value="reviews"
            >
              Đánh giá ({reviews.length})
            </TabsTrigger>
            <TabsTrigger
              className="bg-transparent! data-[state=active]:bg-white! dark:data-[state=active]:bg-slate-900! data-[state=active]:text-primary! text-slate-600 dark:text-slate-350 data-[state=active]:shadow-xs! border border-transparent data-[state=active]:border-slate-200/50! text-xs sm:text-sm rounded-lg sm:rounded-xl font-semibold px-4 py-2 cursor-pointer transition-all shrink-0"
              value="images"
            >
              Hình ảnh
            </TabsTrigger>
            <TabsTrigger
              className="bg-transparent! data-[state=active]:bg-white! dark:data-[state=active]:bg-slate-900! data-[state=active]:text-primary! text-slate-600 dark:text-slate-350 data-[state=active]:shadow-xs! border border-transparent data-[state=active]:border-slate-200/50! text-xs sm:text-sm rounded-lg sm:rounded-xl font-semibold px-4 py-2 cursor-pointer transition-all shrink-0"
              value="stats"
            >
              Thống kê
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="info">
          <TabSkeleton type="info">
            <RoomInfoTab
              room={room}
              onEditAmenities={handleOpenAmenities}
              onEditBeds={handleOpenBeds}
            />
          </TabSkeleton>
        </TabsContent>

        <TabsContent value="bookings">
          <TabSkeleton type="bookings">
            <RoomBookingsTab bookings={bookings} />
          </TabSkeleton>
        </TabsContent>

        <TabsContent value="calendar">
          <TabSkeleton type="calendar">
            <Card className="p-1.5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-card shadow-2xs">
              <CalendarGrid
                roomId={room.id}
                soldOutDates={soldOutDates}
                defaultPrice={defaultPrice}
                roomPriceDates={roomPrices}
                bookings={bookings}
              />
            </Card>
          </TabSkeleton>
        </TabsContent>

        <TabsContent value="reviews">
          <TabSkeleton type="reviews">
            <RoomReviewsTab reviews={reviews} />
          </TabSkeleton>
        </TabsContent>

        <TabsContent value="images">
          <TabSkeleton type="images">
            <RoomImagesTab room={room} reload={reload} />
          </TabSkeleton>
        </TabsContent>

        <TabsContent value="stats">
          <TabSkeleton type="stats">
            <RoomStatsTab bookings={bookings} />
          </TabSkeleton>
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
