"use client";

import { CancellationPolicy } from "@/_components/CancellationPolicy";
import { PhotoGalleryModal } from "@/_components/gallery/PhotoGalleryModal";
import { GoogleMap } from "@/_components/GoogleMap";
import { RelatedBlogPosts } from "@/_components/room/RelatedBlogPosts";
import SimilarRooms from "@/_components/room/SimilarRooms";
import { Button } from "@/_components/ui/button";
import { Card } from "@/_components/ui/card";
import { useCalendarPricing } from "@/_hooks/useCalendarPricing";
import { useRecentlyViewed } from "@/_hooks/useRecentlyViewed";
import { getAmenityIcon } from "@/constants/amenity-icons";
import { useAuth } from "@/context/auth-context";
import { useLang } from "@/context/lang-context";
import { BookingPre } from "@/models/BookingPre";
import { Room } from "@/models/Room";
import { checkFavorite, toggleFavorite } from "@/services/favoriteApi";
import { room_available, room_detail, room_preview } from "@/services/roomApi";
import { addMonths, format, parse } from "date-fns";
import {
  Heart,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Star,
  Users,
} from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import GuestPicker from "../../../../_components/GuestPicker";
import Header from "../../../../_components/Header";
import DateRangePicker from "../../../../_components/ui/date-range-picker";
import { ReviewList } from "../_component/ReviewList";

interface RoomDetailClientProps {
  roomId: number;
}

export function RoomDetailClient({ roomId }: RoomDetailClientProps) {
  const { openSignIn, user } = useAuth();
  const { trackView } = useRecentlyViewed();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLang();
  // States
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [available, setAvailable] = useState<boolean | null>(true);
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showFullOverview, setShowFullOverview] = useState(false);
  const [highlightDatePicker, setHighlightDatePicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isFav, setIsFav] = useState(false);

  const [roomPreview, setRoomPreview] = useState<BookingPre | null>(null);
  const [checkingPreview, setCheckingPreview] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // Lấy dữ liệu phòng và lịch khi roomId thay đổi
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        // 1. Lấy thông tin chi tiết của phòng
        const dataRoom = await room_detail(roomId);
        setRoom(dataRoom);

        // Ghi nhận phòng đã xem
        trackView(roomId);

        // Đảm bảo số lượng khách đã chọn không vượt quá sức chứa của phòng
        if (dataRoom.adultCapacity && adults > dataRoom.adultCapacity) {
          setAdults(dataRoom.adultCapacity);
        }
        const maxChild = dataRoom.childCapacity ?? 0;
        if (children > maxChild) {
          setChildren(maxChild);
        }
      } catch (error) {
        console.error("Lỗi khi tải thông tin phòng:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [roomId]);

  // Check trạng thái yêu thích (tách riêng vì user load muộn hơn room)
  useEffect(() => {
    if (!user || !roomId) return;
    checkFavorite(roomId)
      .then((res) => setIsFav(res.isFavorited))
      .catch(() => {});
  }, [roomId, user]);

  const current = currentMonth;
  const next = addMonths(current, 1);
  const months = useMemo(() => {
    const current = currentMonth;
    const next = addMonths(current, 1);

    return [
      { month: current.getMonth() + 1, year: current.getFullYear() },
      { month: next.getMonth() + 1, year: next.getFullYear() },
    ];
  }, [currentMonth]);

  const { statusMap, getPrice } = useCalendarPricing({
    roomId,
    defaultPrice: room?.price ?? 0,
    months,
  });

  // Load params from URL
  useEffect(() => {
    const ad = searchParams.get("adults");
    const ch = searchParams.get("children");
    const ci = searchParams.get("checkIn");
    const co = searchParams.get("checkOut");
    const status = searchParams.get("status");

    if (ci) setCheckIn(parse(ci, "yyyy-MM-dd", new Date()));
    if (co) setCheckOut(parse(co, "yyyy-MM-dd", new Date()));
    if (ad) setAdults(Number(ad));
    if (ch) setChildren(Number(ch));
    setAvailable(status ? status === "Available" : true);

    // Restore price summary from localStorage if dates are set
    if (ci && co) {
      const priceKey = `room_${roomId}_${ci}_${co}_price`;
      const savedPrice = localStorage.getItem(priceKey);
      if (savedPrice) {
        try {
          setRoomPreview(JSON.parse(savedPrice));
        } catch {
          console.error("Failed to parse saved price summary");
        }
      }
    }
  }, [searchParams, roomId]);

  const updateURL = (params: Record<string, string>) => {
    router.replace(
      `/room/${roomId}?${new URLSearchParams(params).toString()}`,
      {
        scroll: false,
      },
    );
  };

  const amenitiesToDisplay = showAllAmenities
    ? (room?.amenities ?? [])
    : (room?.amenities?.slice(0, 5) ?? []);

  const checkRoomPreview = async (inDate?: Date, outDate?: Date) => {
    const checkInDate = inDate || checkIn;
    const checkOutDate = outDate || checkOut;
    if (!checkInDate || !checkOutDate) return;

    try {
      setCheckingPreview(true);
      console.log("roomId:", roomId, typeof roomId);
      const data = await room_preview(
        Number(roomId),
        format(checkInDate, "yyyy-MM-dd"),
        format(checkOutDate, "yyyy-MM-dd"),
      );
      setRoomPreview(data);

      // Save price summary to localStorage
      const priceKey = `room_${roomId}_${format(checkInDate, "yyyy-MM-dd")}_${format(checkOutDate, "yyyy-MM-dd")}_price`;
      localStorage.setItem(priceKey, JSON.stringify(data));

      const status = data.available ? "Available" : "SoldOut";
      setAvailable(data.available);
      console.log("Room preview:", data);
      if (!data.available)
        toast.error(
          "This room is not available for the selected dates. Please choose different dates.",
        );

      updateURL({
        checkIn: format(checkInDate, "yyyy-MM-dd"),
        checkOut: format(checkOutDate, "yyyy-MM-dd"),
        adults: adults.toString(),
        children: children.toString(),
        status,
      });
    } catch (error) {
      console.error("Check availability failed:", error);
    } finally {
      setCheckingPreview(false);
    }
  };

  const handleRoomSelect = async (roomId: number) => {
    if (!checkIn || !checkOut) {
      toast.error("Please select check-in and check-out dates");
      // bật highlight
      setHighlightDatePicker(true);
      // tự tắt sau 2s
      setTimeout(() => setHighlightDatePicker(false), 2000);
      return;
    }
    if (!room) return;

    updateURL({
      checkIn: format(checkIn, "yyyy-MM-dd"),
      checkOut: format(checkOut, "yyyy-MM-dd"),
      adults: adults.toString(),
      children: children.toString(),
      status,
    });

    try {
      setCheckingAvailability(true);
      const data = await room_available(
        roomId,
        format(checkIn, "yyyy-MM-dd"),
        format(checkOut, "yyyy-MM-dd"),
      );
      setAvailable(data.available);
      if (!data.available) {
        toast.error(
          "This room is not available for the selected dates. Please choose different dates.",
        );
        return;
      }

      router.push(
        `/checkout?${new URLSearchParams({
          roomId: String(roomId),
          ...(checkIn ? { checkIn: format(checkIn, "yyyy-MM-dd") } : {}),
          ...(checkOut ? { checkOut: format(checkOut, "yyyy-MM-dd") } : {}),
          adults: String(adults),
          children: String(children),
        })}`,
      );
    } catch (error) {
      console.error(error);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleMonthChange = (date: Date) => {
    setCurrentMonth((prev) => {
      if (
        prev.getMonth() === date.getMonth() &&
        prev.getFullYear() === date.getFullYear()
      ) {
        return prev;
      }
      return date;
    });
  };

  const handleMobileBookClick = () => {
    if (available === false) {
      toast.error("This room is sold out. Please choose other dates.");
      return;
    }
    if (!checkIn || !checkOut) {
      const bookingCard = document.getElementById("booking-card");
      if (bookingCard) {
        bookingCard.scrollIntoView({ behavior: "smooth" });
        setHighlightDatePicker(true);
        setTimeout(() => setHighlightDatePicker(false), 2000);
      }
      toast.error("Vui lòng chọn ngày nhận/trả phòng");
      return;
    }
    if (!user) {
      openSignIn();
    } else {
      handleRoomSelect(room?.id ?? roomId);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin h-6 w-6 text-primary" />
      </div>
    );

  if (!room) return <p>{t("Room not found")}</p>;

  const isDescriptionLong = !!room.description && room.description.length > 250;
  const displayDescription = showFullOverview
    ? room.description
    : room.description?.slice(0, 250) + (isDescriptionLong ? "..." : "");

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Main Content */}
      <div className="container max-w-7xl mx-auto pb-24 lg:pb-12 space-y-12 pt-14 px-4 sm:px-6 lg:px-8">
        {/* <SearchBar /> */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-16">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photo Gallery */}
            <div className="border rounded-2xl bg-card p-6 shadow-xs">
              <div className="relative">
                {/* Favorite Button */}
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (!user) {
                      openSignIn();
                      return;
                    }
                    setIsFav((prev) => !prev);
                    try {
                      const res = await toggleFavorite(roomId);
                      setIsFav(res.isFavorited);
                      toast.success(
                        res.isFavorited
                          ? "Đã thêm vào yêu thích"
                          : "Đã bỏ yêu thích",
                      );
                    } catch {
                      setIsFav((prev) => !prev);
                    }
                  }}
                  className={`absolute top-1 right-1 p-2.5 rounded-full backdrop-blur-md transition-all duration-300 cursor-pointer z-10 ${
                    isFav
                      ? "bg-white text-red-500 shadow-md"
                      : "bg-black/30 text-white hover:bg-white hover:text-red-500 shadow-sm"
                  }`}
                  title="Yêu thích"
                >
                  <Heart
                    size={20}
                    className={isFav ? "fill-red-500 text-red-500" : ""}
                  />
                </button>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 h-64 sm:h-80 md:h-100">
                  {/* Main image */}
                  <div className="col-span-2 row-span-2 overflow-hidden rounded-lg md:rounded-r-none md:rounded-l-lg">
                    <img
                      src={room.images?.main || "/default.jpg"}
                      alt="room image"
                      className="w-full h-full object-cover cursor-pointer hover:scale-105 transition"
                      onClick={() => {
                        setSelectedImage(room.images?.main || null);
                        setIsPhotoModalOpen(true);
                      }}
                    />
                  </div>
                  {room.images?.gallery
                    ?.filter((img) => !img.isMain)
                    .slice(0, 4)
                    .map((img) => (
                      <div
                        key={img.id}
                        className="hidden md:block overflow-hidden rounded"
                      >
                        <img
                          src={img.url || "/placeholder.svg"}
                          alt={`Room ${img.id}`}
                          className="w-full h-full object-cover cursor-pointer hover:scale-105 transition"
                          onClick={() => {
                            setSelectedImage(img.url || null);
                            setIsPhotoModalOpen(true);
                          }}
                        />
                      </div>
                    ))}
                </div>

                <button
                  onClick={() => {
                    setSelectedImage(room.images?.main || null);
                    setIsPhotoModalOpen(true);
                  }}
                  className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-black/75 hover:bg-black/85 backdrop-blur-md text-white text-xs font-bold rounded-lg shadow-md cursor-pointer transition active:scale-95 border border-white/10"
                >
                  <span className="text-sm">📷</span>
                  <span>
                    {room.images?.gallery?.length || 1}{" "}
                    {t("langCode") === "en" ? "Photos" : "Ảnh"}
                  </span>
                </button>

                {room?.images?.gallery && (
                  <PhotoGalleryModal
                    images={room.images.gallery}
                    selectedUrl={selectedImage}
                    isOpen={isPhotoModalOpen}
                    onClose={() => {
                      setIsPhotoModalOpen(false);
                      setSelectedImage(null);
                    }}
                  />
                )}
              </div>
            </div>

            {/* Room Info */}
            <div className="border rounded-2xl bg-card p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2">
                  <h1 className="text-3xl elegant-heading">{room.name}</h1>

                  <p className="text-sm elegant-subheading flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                    <span>{room.location?.fullAddress ?? "Unknown"}</span>
                  </p>
                </div>

                {/* Rating Badge */}
                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-start bg-yellow-50 dark:bg-yellow-950/30 px-3 py-1.5 rounded-xl border border-yellow-100 dark:border-yellow-900/30">
                  <Star className="h-4.5 w-4.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-bold elegant-sans text-yellow-700 dark:text-yellow-400">
                    {room.rating} / 5
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Specs Row */}
            <div className="flex flex-wrap gap-3 py-4 border-y border-border">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border rounded-full text-xs sm:text-sm text-muted-foreground font-medium">
                <Users className="w-4 h-4 text-primary" />
                <span>
                  {t("langCode") === "en"
                    ? `Max ${room.adultCapacity} adults`
                    : `Tối đa ${room.adultCapacity} người lớn`}
                  {room.childCapacity !== undefined &&
                    room.childCapacity > 0 && (
                      <>
                        {t("langCode") === "en"
                          ? `, ${room.childCapacity} children`
                          : `, ${room.childCapacity} trẻ em`}
                      </>
                    )}
                </span>
              </div>
              {room.amenities && room.amenities.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border rounded-full text-xs sm:text-sm text-muted-foreground font-medium">
                  <span className="text-primary font-bold">✨</span>
                  <span>
                    {room.amenities.length}{" "}
                    {t("langCode") === "en" ? "Amenities" : "Tiện nghi"}
                  </span>
                </div>
              )}
              {room.rating !== undefined && room.rating > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border rounded-full text-xs sm:text-sm text-muted-foreground font-medium">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>
                    {room.rating} ({room.reviewCount || 0}{" "}
                    {t("langCode") === "en" ? "reviews" : "đánh giá"})
                  </span>
                </div>
              )}
            </div>

            {room.host && (
              <div className="mt-10 p-6 rounded-2xl border bg-white shadow-sm hover:shadow-md transition-all duration-200">
                <h2 className="text-2xl elegant-heading mb-6 flex items-center gap-2">
                  Thông tin chủ phòng
                  <span className="inline-block bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                    Verified Host
                  </span>
                </h2>

                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Image
                      src={room.host.avatar || "/placeholder.svg"}
                      alt="host avatar"
                      width={100}
                      height={100}
                      className="w-20 h-20 object-cover rounded-full"
                    />
                    <span className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                  </div>

                  <div className="flex-1">
                    <p className="text-xl elegant-sans font-semibold text-foreground">
                      {room.host.name}
                    </p>

                    <div className="mt-2 space-y-1 text-sm text-muted-foreground elegant-subheading">
                      <p className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-primary" />
                        {room.host.email}
                      </p>
                      <p className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-primary" />
                        {room.host.phoneNumber}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gray-50 border rounded-xl text-sm elegant-subheading text-muted-foreground">
                  Chủ phòng đã xác minh danh tính và thông tin liên hệ.
                  <br />
                  Luôn sẵn sàng hỗ trợ bạn trong quá trình lưu trú.
                </div>

                {/* Real-time Chat Trigger Buttons */}
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      if (!user) {
                        openSignIn();
                        return;
                      }
                      if (room.host) {
                        router.push(
                          `/inbox?hostId=${room.host.id}&roomId=${room.id}`,
                        );
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-sm px-6 py-3.5 shadow-lg shadow-primary/10 active:scale-95 transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-4.5 h-4.5" />
                    Nhắn tin với Chủ phòng
                  </button>
                  <a
                    href={
                      room.host?.phoneNumber
                        ? `tel:${room.host.phoneNumber}`
                        : "#"
                    }
                    className="flex items-center justify-center gap-2 rounded-2xl border bg-white text-slate-700 hover:bg-slate-50 font-bold text-sm px-6 py-3.5 transition-all cursor-pointer"
                  >
                    <Phone className="w-4.5 h-4.5 text-primary" />
                    Gọi điện trực tiếp
                  </a>
                </div>
              </div>
            )}

            {/* Overview Card */}
            <div className="border rounded-2xl bg-card p-6 shadow-xs space-y-3">
              <h2 className="text-xl elegant-sans font-semibold text-foreground">
                {t("Overview")}
              </h2>
              <p className="text-sm elegant-subheading leading-relaxed text-muted-foreground whitespace-pre-line">
                {displayDescription}
              </p>
              {isDescriptionLong && (
                <button
                  onClick={() => setShowFullOverview(!showFullOverview)}
                  className="text-sm elegant-subheading text-primary hover:text-accent cursor-pointer mt-3 font-semibold transition"
                >
                  {showFullOverview
                    ? t("langCode") === "en"
                      ? "Show less"
                      : "Rút gọn"
                    : t("langCode") === "en"
                      ? "Show more"
                      : "Hiển thị thêm"}
                </button>
              )}
            </div>

            {/* Amenities Card */}
            <div className="border rounded-2xl bg-card p-6 shadow-xs space-y-4">
              <h2 className="text-xl elegant-sans font-semibold text-foreground">
                {t("Amenities")}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {amenitiesToDisplay.map((amenity) => (
                  <div
                    key={amenity.id}
                    className="flex items-center gap-2 text-sm elegant-subheading text-muted-foreground"
                  >
                    <span>{getAmenityIcon(amenity.name)}</span>
                    <span>{amenity.name}</span>
                  </div>
                ))}
              </div>
              {!showAllAmenities &&
                room?.amenities &&
                room.amenities.length > 5 && (
                  <button
                    onClick={() => setShowAllAmenities(true)}
                    className="text-sm elegant-subheading text-primary hover:text-accent cursor-pointer font-semibold flex items-center gap-1 transition"
                  >
                    <span>{t("Show more")}</span>
                    <span>({room.amenities.length - 5})</span>
                  </button>
                )}
              {showAllAmenities &&
                room?.amenities &&
                room.amenities.length > 5 && (
                  <button
                    onClick={() => setShowAllAmenities(false)}
                    className="text-sm elegant-subheading text-primary hover:text-accent cursor-pointer font-semibold flex items-center gap-1 transition"
                  >
                    <span>
                      {t("langCode") === "en" ? "Show less" : "Rút gọn"}
                    </span>
                  </button>
                )}
            </div>

            {/* Google Map Location Card */}
            <div className="border rounded-2xl bg-card p-6 shadow-xs space-y-4">
              <h2 className="text-xl elegant-sans font-semibold text-foreground flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                {t("langCode") === "en"
                  ? "Homestay Location"
                  : "Vị trí của homestay"}
              </h2>
              <div className="h-87.5 rounded-xl overflow-hidden shadow-xs border">
                <GoogleMap
                  lat={room.location?.latitude}
                  lng={room.location?.longitude}
                  address={room.location?.fullAddress}
                  zoom={16}
                  showOpenButton
                />
              </div>
              {room.location?.fullAddress && (
                <p className="mt-3 text-xs text-muted-foreground elegant-subheading">
                  {room.location.fullAddress}
                </p>
              )}
            </div>

            {/* Review  */}
            <ReviewList roomId={roomId} />
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1 sticky top-24" id="booking-card">
            <Card className="p-5 sticky top-24">
              <div
                className={`mb-3.5 space-y-1.5 transition-opacity duration-200 ${checkingPreview ? "opacity-60 pointer-events-none" : ""}`}
              >
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900 dark:text-slate-50">
                    {roomPreview?.priceSummary?.totalPrice?.toLocaleString() ||
                      room.price.toLocaleString()}{" "}
                    VND
                  </span>
                  {roomPreview?.priceSummary?.discountPercent ? (
                    <span className="text-xs font-bold bg-green-500/10 text-green-600 border border-green-500/20 px-2 py-0.5 rounded-md align-middle shrink-0">
                      -{roomPreview.priceSummary.discountPercent}%
                    </span>
                  ) : null}
                </div>

                {roomPreview?.priceSummary?.discountPercent !== undefined &&
                roomPreview?.priceSummary?.discountPercent !== 0 ? (
                  <div className="text-sm text-muted-foreground line-through decoration-slate-400">
                    {t("langCode") === "en" ? "Original:" : "Giá gốc:"}{" "}
                    {roomPreview?.priceSummary?.rawTotal?.toLocaleString()} VND
                  </div>
                ) : null}

                {/* Detailed discount explanation */}
                {roomPreview?.priceSummary &&
                  roomPreview.priceSummary.discountPercent > 0 && (
                    <div className="p-3 bg-green-50/60 dark:bg-green-950/20 border border-green-100 dark:border-green-900/40 rounded-xl space-y-1.5 text-xs text-green-700 dark:text-green-400">
                      <p className="font-semibold text-green-800 dark:text-green-300 flex items-center gap-1">
                        <span>🎉</span>
                        <span>
                          {t("langCode") === "en"
                            ? "Applied discounts:"
                            : "Ưu đãi áp dụng:"}
                        </span>
                      </p>
                      {roomPreview.priceSummary.loyaltyDiscount !== undefined &&
                        roomPreview.priceSummary.loyaltyDiscount > 0 && (
                          <div className="flex justify-between items-center gap-2">
                            <span className="flex items-center gap-1 min-w-0">
                              <span>⭐</span>
                              <span className="truncate">
                                {t("langCode") === "en"
                                  ? "Member discount"
                                  : "Ưu đãi thành viên"}
                                {roomPreview.priceSummary.tierName && (
                                  <span className="ml-1.5 font-extrabold text-[9px] bg-green-200/50 dark:bg-green-900/50 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                    {roomPreview.priceSummary.tierName}
                                  </span>
                                )}
                              </span>
                            </span>
                            <span className="font-bold shrink-0">
                              -
                              {roomPreview.priceSummary.loyaltyDiscount.toLocaleString()}{" "}
                              VND
                            </span>
                          </div>
                        )}
                      {roomPreview.priceSummary.couponDiscount !== undefined &&
                        roomPreview.priceSummary.couponDiscount > 0 && (
                          <div className="flex justify-between items-center gap-2">
                            <span className="flex items-center gap-1 min-w-0">
                              <span>🎫</span>
                              <span className="truncate">
                                {t("langCode") === "en"
                                  ? "Coupon code"
                                  : "Mã giảm giá"}
                                {roomPreview.priceSummary.couponCode && (
                                  <span className="ml-1.5 font-mono font-bold text-[10px] bg-green-200/50 dark:bg-green-900/50 px-1.5 py-0.5 rounded">
                                    {roomPreview.priceSummary.couponCode}
                                  </span>
                                )}
                              </span>
                            </span>
                            <span className="font-bold shrink-0">
                              -
                              {roomPreview.priceSummary.couponDiscount.toLocaleString()}{" "}
                              VND
                            </span>
                          </div>
                        )}
                      {/* General/Other discount fallback */}
                      {!(roomPreview.priceSummary.loyaltyDiscount! > 0) &&
                        !(roomPreview.priceSummary.couponDiscount! > 0) && (
                          <div className="flex justify-between items-center gap-2">
                            <span className="flex items-center gap-1">
                              <span>🏷️</span>
                              <span>
                                {t("langCode") === "en"
                                  ? "Special discount"
                                  : "Chiết khấu phòng"}
                              </span>
                            </span>
                            <span className="font-bold shrink-0">
                              -
                              {roomPreview.priceSummary.discountAmount?.toLocaleString()}{" "}
                              VND
                            </span>
                          </div>
                        )}
                    </div>
                  )}

                <p className="text-xs text-muted-foreground pt-1">
                  {t("langCode") === "en"
                    ? "Taxes & fees included"
                    : "Giá đã bao gồm thuế & phí"}
                </p>
              </div>

              {/* Sold Out Banner */}
              {available === false && (
                <div className="absolute top-4 right-4 flex items-center h-10 bg-linear-to-r from-red-500 to-red-600 text-white elegant-sans rounded-2xl shadow-xl py-2 px-4 uppercase tracking-wider text-sm animate-pulse">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  {t("sold out")}
                </div>
              )}

              {/* Info */}
              <div className="grid grid-cols-1 md:grid-cols-7 lg:grid-cols-1 gap-3">
                <div
                  className={`relative md:col-span-4 lg:col-span-1 rounded-xl transition-all duration-300 ${highlightDatePicker ? "ring-4 ring-primary/50 scale-[1.02]" : ""}`}
                >
                  <DateRangePicker
                    value={
                      checkIn
                        ? { from: checkIn, to: checkOut || undefined }
                        : undefined
                    }
                    statusMap={statusMap}
                    defaultPrice={room?.price}
                    getPrice={getPrice}
                    onChange={(range) => {
                      setCheckIn(range?.from ?? null);
                      setCheckOut(range?.to ?? null);
                      if (range?.from && range?.to) {
                        checkRoomPreview(range.from, range.to);
                      }
                    }}
                    onMonthChange={handleMonthChange}
                  />
                </div>
                <div className="relative md:col-span-3 lg:col-span-1">
                  <GuestPicker
                    adults={adults}
                    children={children}
                    setAdults={setAdults}
                    setChildren={setChildren}
                    maxAdults={room.adultCapacity}
                    maxChildren={room.childCapacity ?? 0}
                    onLimitReached={(type, limit) => {
                      const label =
                        type === "adults" ? t("adults") : t("children");
                      toast.error("Đã đạt tối đa " + limit + " " + label);
                    }}
                  />
                  <Users
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none z-10"
                    size={16}
                  />
                </div>
              </div>

              {/* Select Room Button */}
              <Button
                onClick={() => {
                  if (available === false) {
                    toast.error(
                      "This room is sold out. Please choose other dates.",
                    );
                    return;
                  }
                  if (!user) {
                    openSignIn();
                  } else {
                    handleRoomSelect(room.id);
                  }
                }}
                disabled={
                  available === false || checkingPreview || checkingAvailability
                }
                className={`w-full h-10 rounded-3xl mb-3 mt-3 hover:bg-primary/80 cursor-pointer ${
                  available === false
                    ? "bg-muted cursor-not-allowed hover:bg-muted"
                    : ""
                }`}
              >
                {checkingPreview || checkingAvailability ? (
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                ) : null}
                {checkingPreview || checkingAvailability
                  ? t("langCode") === "en"
                    ? "Loading..."
                    : "Đang tải..."
                  : available === false
                    ? t("sold out")
                    : t("Select")}
              </Button>

              {/* Check-in/out */}
              <div className="border rounded-lg py-1.5 mb-3.5">
                <div className="grid grid-cols-2 divide-x">
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-xs text-muted-foreground mb-1">
                      {t("checkIn")}
                    </p>
                    <p className="text-lg elegant-sans">14:00</p>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-xs text-muted-foreground mb-1">
                      {t("checkOut")}
                    </p>
                    <p className="text-lg elegant-sans">12:00</p>
                  </div>
                </div>
              </div>

              {/* Policy */}
              <div className="pt-3.5 border-t">
                <CancellationPolicy checkInDate={checkIn || undefined} />
              </div>

              {/* Nearby Places */}
              {/* <div>
                <h3 className="font-semibold mb-3 text-sm">Nearby</h3>
                <div className="space-y-2">
                  {hotel.nearbyPlaces.map((place, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-700">{place.name}</span>
                      </div>
                      <span className="text-gray-600">{place.distance}</span>
                    </div>
                  ))}
                </div>
                <button className="text-sm text-teal-600 hover:text-teal-700 mt-3">Show more</button>
              </div> */}
            </Card>
          </div>
        </div>

        {/* Related Blog Posts (Room-to-Blog linking) */}
        {room.location?.provinceId && (
          <RelatedBlogPosts
            provinceId={room.location.provinceId}
            provinceName={room.location.province || ""}
          />
        )}

        {/* Similar Rooms */}
        <SimilarRooms roomId={roomId} />
      </div>

      {/* Mobile Sticky Booking Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/95 dark:bg-black/95 backdrop-blur-md border-t border-border/80 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] p-4 flex items-center justify-between">
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black text-primary">
              {(
                roomPreview?.priceSummary?.totalPrice || room.price
              ).toLocaleString()}
              đ
            </span>
            <span className="text-xs text-muted-foreground">
              {checkIn && checkOut
                ? `/ ${roomPreview?.stayDetails?.nights || 1} ${t("night")}`
                : `/${t("night")}`}
            </span>
          </div>
          <span
            onClick={handleMobileBookClick}
            className="text-[10px] text-muted-foreground underline cursor-pointer hover:text-primary transition"
          >
            {checkIn && checkOut
              ? `${format(checkIn, "dd/MM")} - ${format(checkOut, "dd/MM")}`
              : t("selectDate")}
          </span>
        </div>

        <button
          onClick={handleMobileBookClick}
          disabled={available === false}
          className={`rounded-full bg-primary hover:bg-primary/90 text-white font-bold text-sm px-6 py-2.5 shadow-md shadow-primary/10 active:scale-95 transition-all cursor-pointer ${
            available === false
              ? "bg-muted cursor-not-allowed hover:bg-muted"
              : ""
          }`}
        >
          {available === false
            ? t("sold out")
            : checkIn && checkOut
              ? t("Select")
              : t("selectDate")}
        </button>
      </div>
    </div>
  );
}
