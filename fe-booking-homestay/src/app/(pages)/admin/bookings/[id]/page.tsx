"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserAvatar } from "@/components/UserAvatar";
import { formatDate } from "@/lib/utils/date";
import { getBookingById } from "@/services/admin/bookingsApi";
import {
  ArrowLeft,
  Baby,
  Calendar,
  Clock,
  CreditCard,
  DollarSign,
  Image as ImageIcon,
  MapPin,
  Moon,
  Users,
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getStatusColorClasses } from "./_utils/color-utils";

function InfoItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: any;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 bg-muted/30 p-3 rounded-lg">
      <div className="text-gray-600">{icon}</div>

      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-medium">{value}</p>
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
  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-lg font-medium">
        Đang tải thông tin đặt phòng #{bookingId}…
      </div>
    );
  }
  if (!booking) {
    return (
      <div className="flex items-center justify-center py-32 text-lg font-medium text-red-600">
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

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/admin/bookings")}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div>
            <h1 className="text-3xl font-extrabold text-foreground">
              Booking <span className="text-primary">#{booking.id}</span>
            </h1>
          </div>
        </div>
        <span
          className={`px-4 py-2 text-sm rounded-full font-bold uppercase tracking-wide
          ${getStatusColorClasses(booking.status)}`}
        >
          {booking.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-bold">Phòng đã đặt</h2>

            <div className="flex items-start gap-4">
              <div className="shrink-0 relative w-32 h-24 sm:w-40 sm:h-28">
                {room?.images?.main ? (
                  <Image
                    src={room.images.main}
                    layout="fill"
                    alt={room.name || "Room Image"}
                    className="rounded-lg border object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-lg border flex items-center justify-center bg-muted/40 text-muted-foreground">
                    <ImageIcon className="w-8 h-8 opacity-50" />
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-between flex-1 h-24 sm:h-28">
                <div>
                  <p className="font-extrabold text-3xl mb-1 text-foreground">
                    {room?.name}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-primary shrink-0" />
                    {room?.location.fullAddress}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-bold">Chi tiết Booking</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <InfoItem
                label="Check-in"
                value={formatDate(booking.checkIn)}
                icon={<Calendar className="w-5 h-5" />}
                // className="bg-green-50/70 border-green-200"
              />
              <InfoItem
                label="Check-out"
                value={formatDate(booking.checkOut)}
                icon={<Calendar className="w-5 h-5" />}
                // className="bg-red-50/70 border-red-200"
              />
              <InfoItem
                label="Số đêm lưu trú"
                value={`${nights} đêm`}
                icon={<Moon className="w-5 h-5" />}
                // className="bg-purple-50/70 border-purple-200"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t mt-4">
              <div className="sm:col-span-1 grid grid-cols-2 sm:grid-cols-1 gap-4">
                <InfoItem
                  label="Người lớn (NL)"
                  value={booking.adults}
                  icon={<Users className="w-5 h-5" />}
                  // className="bg-blue-50/70 border-blue-200"
                />
                <InfoItem
                  label="Trẻ em (TE)"
                  value={booking.children}
                  icon={<Baby className="w-5 h-5" />}
                  // className="bg-teal-50/70 border-teal-200"
                />
              </div>

              <div className="sm:col-span-1 grid grid-cols-2 sm:grid-cols-1 gap-4">
                <InfoItem
                  label="Ngày tạo"
                  value={formatDate(booking.createdAt)}
                  icon={<Clock className="w-5 h-5" />}
                />
                <InfoItem
                  label="Cập nhật gần nhất"
                  value={formatDate(booking.updatedAt)}
                  icon={<Clock className="w-5 h-5" />}
                />
              </div>
            </div>

            {booking.cancelReason && (
              <div className="pt-4 border-t mt-4 bg-red-50 p-4 rounded-lg border-red-200">
                <p className="text-sm font-semibold text-red-600 mb-1">
                  Lý do hủy
                </p>
                <p className="font-medium text-red-800">
                  {booking.cancelReason}
                </p>
              </div>
            )}
          </Card>

          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-bold">Thanh toán</h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <InfoItem
                label="Tổng chi phí"
                value={booking.totalAmount?.toLocaleString() + " ₫"}
                icon={<DollarSign className="w-5 h-5" />}
                // className="bg-primary/5 border-primary/20"
              />
              <InfoItem
                label="Phương thức"
                value={"Đang cập nhật..."}
                icon={<CreditCard className="w-5 h-5" />}
              />
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-bold border-b pb-3">Người đặt phòng</h2>
            <div className="flex items-center gap-4">
              <UserAvatar
                avatarUrl={user?.avatar}
                fullName={user?.name}
                className="w-16 h-16 shrink-0"
              />
              <div>
                <p className="font-bold text-lg">{user?.name || "N/A"}</p>
                <p className="text-gray-600 text-sm truncate">{user?.email}</p>
                <p className="text-gray-600 text-sm">{user?.phoneNumber}</p>
              </div>
            </div>
            {user?.id && (
              <div className="pt-4 border-t">
                <Button variant="link" className="p-0 text-sm">
                  Xem hồ sơ người dùng →
                </Button>
              </div>
            )}
          </Card>

          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-bold border-b pb-3">Khách lưu trú</h2>
            <div>
              <p className="font-bold text-lg">
                {guest?.fullName || user?.name || "Khách vãng lai"}
              </p>
              <p className="text-gray-600 text-sm">
                {guest?.email || user?.email}
              </p>
              <p className="text-gray-600 text-sm">
                {guest?.phoneNumber || user?.phoneNumber}
              </p>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm font-semibold text-muted-foreground mb-1">
                Yêu cầu đặc biệt
              </p>
              <p className="font-medium text-foreground italic">
                {booking.specialRequest ||
                  guest?.specialRequest ||
                  "Không có yêu cầu đặc biệt"}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
