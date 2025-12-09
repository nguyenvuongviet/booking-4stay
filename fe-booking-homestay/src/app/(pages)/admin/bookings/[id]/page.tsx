"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserAvatar } from "@/components/UserAvatar";
import { formatDate } from "@/lib/utils/date";
import { getBookingById } from "@/services/admin/bookingsApi";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  ArrowLeft,
  Baby,
  Calendar,
  CreditCard,
  Image as ImageIcon,
  MapPin,
  Moon,
  Users,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RefreshButton } from "../../_components/RefreshButton";
import { StarRating } from "../../_components/StarRating";
import {
  getStatusColorClasses,
  translateStatus,
} from "../../_utils/color-utils";
import { BookingActionButtons } from "../_components/BookingActionButtons";
import { BookingActionDialog } from "../_components/BookingActionDialog";
import { useBookingActions } from "../_hooks/useBookingActions";

function InfoItem({
  label,
  value,
  icon,
  className = "",
}: {
  label: string;
  value: any;
  icon: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex items-start gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100 ${className}`}
    >
      <div className="text-primary mt-0.5 shrink-0">{icon}</div>
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
          {label}
        </p>
        <p className="font-bold text-gray-800 leading-snug">{value}</p>
      </div>
    </div>
  );
}

export default function BookingDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const bookingId = Number(id);

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<any>(null);

  async function load() {
    try {
      const booking = await getBookingById(bookingId);
      setBooking(booking);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [bookingId]);

  const {
    dialog,
    openAccept,
    openReject,
    openRefund,
    closeDialog,
    handleConfirm,
  } = useBookingActions(load);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-lg font-medium">
        Đang tải thông tin đặt phòng&nbsp;
        <span className="text-primary font-extrabold ml-1">#{bookingId}</span>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex items-center justify-center py-32 text-xl font-bold text-red-600">
        Không tìm thấy booking #{bookingId}
      </div>
    );
  }

  const user = booking.user;
  const guest = booking.guestInfo;
  const room = booking.room;

  const nights = Math.max(
    1,
    Math.round(
      (new Date(booking.checkOut).getTime() -
        new Date(booking.checkIn).getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );

  const statusLabel = translateStatus(booking.status);
  const isRefunded = booking.status === "REFUNDED";

  return (
    <div className="max-w-7xl mx-auto space-y-4 p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-2 border-gray-200">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/admin/bookings")}
            className="shrink-0 text-gray-600 hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div>
            <p className="text-xl font-semibold text-gray-500">
              Chi tiết Booking
            </p>
            <h1 className="text-4xl font-extrabold text-gray-800">
              #{booking.id}
            </h1>
          </div>
        </div>

        <span
          className={`px-4 py-2 text-sm rounded-full font-extrabold uppercase tracking-wider shadow-sm 
          ${getStatusColorClasses(booking.status)}`}
        >
          {statusLabel}
        </span>
      </div>

      <div className="flex justify-end">
        <BookingActionButtons
          className="mr-2"
          id={booking.id}
          status={booking.status}
          paidAmount={booking.paidAmount}
          onAccept={openAccept}
          onReject={openReject}
          onRefund={openRefund}
        />

        <RefreshButton onRefresh={load} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-6 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold mb-4 pb-3 border-b text-gray-700">
              Phòng đã đặt
            </h2>

            <div className="flex items-start gap-6">
              <div className="shrink-0 relative w-36 h-28 sm:w-48 sm:h-36">
                {room?.images?.main ? (
                  <Image
                    src={room.images.main}
                    fill
                    alt={room.name}
                    className="rounded-xl border object-cover shadow-md"
                  />
                ) : (
                  <div className="w-full h-full rounded-xl border flex items-center justify-center bg-gray-100 text-gray-400">
                    <ImageIcon className="w-10 h-10 opacity-60" />
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-between flex-1">
                <p className="font-extrabold text-3xl text-foreground mb-1">
                  {room?.name}
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-primary" />
                  {room?.location.fullAddress}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold mb-4 pb-3 border-b text-gray-700">
              Chi tiết thời gian & Khách
            </h2>

            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              <InfoItem
                label="Ngày Check-in"
                value={formatDate(booking.checkIn)}
                icon={<Calendar className="w-5 h-5" />}
              />
              <InfoItem
                label="Ngày Check-out"
                value={formatDate(booking.checkOut)}
                icon={<Calendar className="w-5 h-5" />}
              />
              <InfoItem
                label="Số đêm lưu trú"
                value={
                  <span className="text-lg font-extrabold">{nights} đêm</span>
                }
                icon={<Moon className="w-5 h-5" />}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t">
              <InfoItem
                label="Người lớn"
                value={
                  <span className="text-lg font-extrabold">
                    {booking.adults} người
                  </span>
                }
                icon={<Users className="w-5 h-5" />}
              />
              <InfoItem
                label="Trẻ em"
                value={
                  <span className="text-lg font-extrabold">
                    {booking.children} bé
                  </span>
                }
                icon={<Baby className="w-5 h-5" />}
              />
            </div>
          </Card>

          <Card className="p-6 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold mb-4 pb-3 border-b text-gray-700">
              Thông tin Thanh toán
            </h2>

            <div className="grid sm:grid-cols-3 gap-4">
              <InfoItem
                label="Tổng chi phí"
                value={
                  <span className="text-lg text-red-600 font-extrabold">
                    {booking.totalAmount.toLocaleString()} ₫
                  </span>
                }
                icon={<CreditCard className="w-5 h-5" />}
              />

              <InfoItem
                label="Đã thanh toán"
                value={
                  <span className="text-lg text-green-600 font-extrabold">
                    {booking.paidAmount.toLocaleString()} ₫
                  </span>
                }
                icon={<Wallet className="w-5 h-5" />}
              />

              <InfoItem
                label="Phương thức"
                value={booking.paymentMethod || "N/A"}
                icon={<CreditCard className="w-5 h-5" />}
              />
            </div>

            {isRefunded && (
              <div className="pt-4 border-t mt-6 bg-blue-50 p-4 rounded-lg border-blue-200">
                <p className="text-sm font-bold text-blue-700 mb-1">
                  Đã hoàn tiền
                </p>
                <p className="text-blue-900 font-semibold">
                  Số tiền hoàn: {booking.paidAmount.toLocaleString()} ₫
                </p>
                <p className="text-blue-800 text-sm mt-1">
                  Thời gian hoàn:{" "}
                  {booking.updatedAt
                    ? format(new Date(booking.updatedAt), "dd/MM/yyyy HH:mm", {
                        locale: vi,
                      })
                    : "N/A"}
                </p>
              </div>
            )}

            {booking.cancelReason && (
              <div className="pt-4 border-t mt-6 bg-red-50 p-4 rounded-lg border-red-200">
                <p className="text-sm font-bold text-red-700 mb-1">Lý do hủy</p>
                <p className="font-medium italic text-red-800">
                  {booking.cancelReason}
                </p>
              </div>
            )}
          </Card>

          <Card className="p-6 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold mb-4 pb-3 border-b text-gray-700">
              Đánh giá của khách
            </h2>

            {!booking.review ? (
              <p className="text-gray-500 italic">
                Khách chưa để lại đánh giá.
              </p>
            ) : (
              <div className="space-y-6">
                <div className="bg-white border rounded-xl p-5 shadow-md space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center gap-2">
                      <p className="text-4xl font-extrabold">
                        {Number(booking.review.rating).toFixed(1)}
                      </p>
                      <span className="text-gray-500 text-base">/ 5 sao</span>
                    </div>
                    <StarRating value={Number(booking.review.rating)} />
                  </div>

                  <p className="text-base whitespace-pre-line">
                    {booking.review.comment || "Không có bình luận chi tiết."}
                  </p>
                </div>

                <p className="text-sm text-right text-gray-500">
                  Đánh giá vào:&nbsp;
                  <span className="font-bold">
                    {formatDate(booking.review.createdAt)}
                  </span>
                </p>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="p-6 rounded-xl shadow-lg border">
            <h2 className="text-2xl font-bold mb-4 pb-3 border-b">
              Người đặt phòng
            </h2>
            <div className="flex items-center gap-4">
              <UserAvatar
                avatarUrl={user?.avatar}
                fullName={user?.name}
                className="w-16 h-16"
              />

              <div>
                <p className="font-bold text-xl">{user?.name}</p>
                <p className="text-gray-500 text-sm">{user?.email}</p>
                <p className="text-gray-500 text-sm">{user?.phoneNumber}</p>
              </div>
            </div>

            {user?.id && (
              <div className="pt-4 border-t mt-4">
                <Link href={`/admin/users/${user.id}`}>
                  <Button
                    variant="link"
                    className="p-0 text-primary font-semibold text-sm"
                  >
                    Xem hồ sơ người dùng →
                  </Button>
                </Link>
              </div>
            )}
          </Card>

          <Card className="p-6 rounded-xl shadow-lg border">
            <h2 className="text-2xl font-bold pb-3 border-b">Khách lưu trú</h2>

            <div className="space-y-1">
              <p className="font-bold text-lg">
                {guest?.fullName || user?.name}
              </p>
              <p className="text-gray-500 text-sm">Email: {guest?.email}</p>
              <p className="text-gray-500 text-sm">SĐT: {guest?.phoneNumber}</p>
            </div>

            <div className="pt-4 mt-4 border-t">
              <p className="text-sm font-bold text-gray-700 mb-2">
                Yêu cầu đặc biệt
              </p>
              <div className="bg-white p-3 rounded-lg border border-dashed">
                <p className="italic text-sm">
                  {booking.specialRequest || "Không có yêu cầu đặc biệt."}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <BookingActionDialog
        dialog={dialog}
        onCancel={closeDialog}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
