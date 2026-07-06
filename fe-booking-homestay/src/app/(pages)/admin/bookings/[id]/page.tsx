"use client";

import { Button } from "@/_components/ui/button";
import { Card } from "@/_components/ui/card";
import { UserAvatar } from "@/_components/UserAvatar";
import { parseAbsoluteDate } from "@/lib/utils";
import { formatDate } from "@/lib/utils/date";
import { getBookingById } from "@/services/admin/bookingsApi";
import api from "@/services/api";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  Image as ImageIcon,
  MapPin,
  Moon,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { RefreshButton } from "../../_components/RefreshButton";
import { StarRating } from "../../_components/StarRating";
import {
  getStatusColorClasses,
  translateStatus,
} from "../../_utils/bookingStatus";
import { AdminBookingUpdateDialog } from "../_components/AdminBookingUpdateDialog";
import { BookingActionButtons } from "../_components/BookingActionButtons";
import { RefundDialog } from "../_components/RefundDialog";
import { SmartCancelDialog } from "../_components/SmartCancelDialog";

function InfoItem({
  label,
  value,
  icon,
  className = "",
  valueClassName = "",
}: {
  label: string;
  value: any;
  icon: React.ReactNode;
  className?: string;
  valueClassName?: string;
}) {
  return (
    <div
      className={`flex items-start gap-2.5 sm:gap-3 bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 ${className}`}
    >
      <div className="text-primary mt-0.5 shrink-0 bg-primary/5 p-1.5 sm:p-2 rounded-lg sm:rounded-xl">
        {React.isValidElement(icon)
          ? React.cloneElement(icon as React.ReactElement<any>, {
              className: "w-3.5 h-3.5 sm:w-4 sm:h-4",
            })
          : icon}
      </div>
      <div>
        <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
          {label}
        </p>
        <p
          className={`text-xs sm:text-sm font-bold text-gray-800 leading-tight ${valueClassName}`}
        >
          {value}
        </p>
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
  const [cancelBookingId, setCancelBookingId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAllLogs, setShowAllLogs] = useState(false);
  const [refundBookingData, setRefundBookingData] = useState<any>(null);

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
      <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-8 bg-[#f8fafc] animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-2">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-slate-200 dark:bg-slate-800 rounded-xl shrink-0" />
              <div className="h-7 w-48 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            </div>
            <div className="h-4 w-40 bg-slate-150 dark:bg-slate-800/60 rounded-md pl-0.5 sm:pl-12" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-7.5 w-18 bg-slate-200 dark:bg-slate-800 rounded-full" />
            <div className="h-7.5 w-18 bg-slate-200 dark:bg-slate-800 rounded-full" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4 sm:space-y-8">
            {/* Room info card skeleton */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-4 sm:p-6 space-y-4">
              <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded-md" />
              <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
                <div className="w-full md:w-56 h-36 sm:h-40 bg-slate-200 dark:bg-slate-800 rounded-xl shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded-md" />
                  <div className="h-4 w-32 bg-slate-150 dark:bg-slate-800/60 rounded-md" />
                  <div className="flex gap-2">
                    <div className="h-6 w-24 bg-slate-150 dark:bg-slate-800/65 rounded-full" />
                    <div className="h-6 w-20 bg-slate-150 dark:bg-slate-800/65 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Stay details info grids */}
            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-xl p-4 flex gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3 w-16 bg-slate-150 dark:bg-slate-800/60 rounded-md" />
                    <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded-md" />
                  </div>
                </div>
              ))}
            </div>

            {/* Payment summary skeleton */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-4 sm:p-6 space-y-4">
              <div className="h-6 w-36 bg-slate-200 dark:bg-slate-800 rounded-md" />
              <div className="h-20 bg-slate-100 dark:bg-slate-850 rounded-xl" />
            </div>
          </div>

          {/* Right side customer details */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-4 sm:p-6 space-y-4">
              <div className="h-6 w-40 bg-slate-200 dark:bg-slate-800 rounded-md" />
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded-md" />
                  <div className="h-3 w-32 bg-slate-150 dark:bg-slate-800/60 rounded-md" />
                </div>
              </div>
            </div>
          </div>
        </div>
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
      (parseAbsoluteDate(booking.checkOut).getTime() -
        parseAbsoluteDate(booking.checkIn).getTime()) /
        (1000 * 60 * 60 * 24),
    ),
  );

  const statusLabel = translateStatus(booking.status);
  const isRefunded = booking.status === "REFUNDED";

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-8 bg-[#f8fafc]">
      {/* 1. NEW PREMIUM HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-2">
        <div className="space-y-1 w-full lg:w-auto">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push("/admin/bookings")}
              className="h-9 w-9 rounded-xl border-gray-200 hover:border-primary hover:text-primary transition-all shadow-sm shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-850 dark:text-white tracking-tight flex items-center gap-2 flex-wrap">
              <span>Đơn đặt phòng #{booking.id}</span>
              <span
                className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider shadow-none border shrink-0 
                ${getStatusColorClasses(booking.status)}`}
              >
                {statusLabel}
              </span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium flex items-center gap-1.5 pl-0.5 sm:pl-12">
            Đã tạo vào lúc{" "}
            <span className="text-slate-800 dark:text-slate-200 font-bold">
              {format(new Date(booking.createdAt), "dd/MM/yyyy HH:mm", {
                locale: vi,
              })}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <BookingActionButtons
            id={Number(booking.id)}
            status={booking.status}
            booking={booking}
            onEdit={() => setIsEditing(true)}
            onCancel={(id) => setCancelBookingId(id)}
            onRefund={(bk) => setRefundBookingData(bk)}
          />
          <RefreshButton onRefresh={load} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4 sm:space-y-8">
          <Card className="p-0 overflow-hidden rounded-2xl sm:rounded-3xl shadow-xl border-none ring-1 ring-gray-100 bg-white group hover:ring-primary transition-all duration-300">
            <Link href={`/admin/rooms/${room?.id}`}>
              <div className="bg-gray-50 border-b p-4 sm:p-6 flex justify-between items-center group-hover:bg-primary/5 transition-colors">
                <h2 className="text-sm sm:text-lg font-bold text-gray-800 flex items-center gap-1.5 sm:gap-2">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-primary" />
                  Thông tin phòng
                </h2>
                <span className="text-[9px] sm:text-[10px] font-black text-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1">
                  Xem chi tiết phòng{" "}
                  <ArrowLeft className="w-3 h-3 rotate-180" />
                </span>
              </div>

              <div className="p-4 sm:p-6 flex flex-col md:flex-row gap-4 sm:gap-6">
                <div className="shrink-0 relative w-full md:w-56 h-36 sm:h-40">
                  {room?.images?.main ? (
                    <Image
                      src={room.images.main}
                      fill
                      sizes="(max-width: 768px) 100vw, 224px"
                      alt={room.name || "Room Image"}
                      className="rounded-xl sm:rounded-2xl border object-cover shadow-md group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full rounded-xl sm:rounded-2xl border flex items-center justify-center bg-gray-100 text-gray-400">
                      <ImageIcon className="w-8 h-8 opacity-60" />
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-between py-1 gap-3 sm:gap-1">
                  <div>
                    <h3 className="font-bold sm:font-black text-lg sm:text-2xl text-gray-900 mb-0.5 sm:mb-1 group-hover:text-primary transition-colors">
                      {room?.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 flex items-start gap-1 mb-2.5 sm:mb-4">
                      <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      {room?.location?.fullAddress}
                    </p>

                    <div className="flex flex-wrap gap-2 sm:gap-4">
                      <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                        <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        Tối đa {room?.adultCapacity} khách
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                        <StarRating value={room?.rating || 5} />
                        <span className="text-gray-400">
                          ({room?.reviewCount || 0})
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 sm:mt-6 flex items-baseline gap-1.5 sm:gap-2">
                    <span className="text-[9px] sm:text-[10px] font-bold text-gray-405 uppercase">
                      Giá mỗi đêm:
                    </span>
                    <span className="text-base sm:text-xl font-black text-gray-900">
                      {(room?.price || 0).toLocaleString()} ₫
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </Card>

          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
            <InfoItem
              label="Thời gian lưu trú"
              value={`${formatDate(booking.checkIn)} - ${formatDate(booking.checkOut)}`}
              icon={<Calendar />}
              valueClassName="text-xs sm:text-sm"
              className="sm:col-span-2"
            />
            <InfoItem label="Số đêm" value={`${nights} đêm`} icon={<Moon />} />
            <InfoItem
              label="Số khách"
              value={`${booking.adults} lớn, ${booking.children} bé`}
              icon={<Users />}
            />
          </div>

          {/* 3. PAYMENT SUMMARY - CLEANER TABLE STYLE */}
          <Card className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl border-none ring-1 ring-gray-100 bg-white">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-base sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                Bản kê thanh toán
              </h2>
              <div className="flex flex-col items-end">
                <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Phương thức
                </span>
                <span className="text-xs sm:text-sm font-bold text-gray-900">
                  {booking.paymentMethod || "CASH"}
                </span>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div className="bg-gray-50/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100">
                <table className="w-full text-xs sm:text-sm">
                  <tbody className="space-y-2 sm:space-y-3 block">
                    <tr className="flex justify-between items-center">
                      <td className="text-gray-500 font-medium">
                        Tiền phòng ({nights} đêm)
                      </td>
                      <td className="font-bold text-gray-900">
                        {(Number(booking.rawTotalPrice) || 0).toLocaleString()}{" "}
                        ₫
                      </td>
                    </tr>
                    {Number(booking.discountAmount) > 0 && (
                      <tr className="flex justify-between items-center">
                        <td className="text-orange-500 font-bold italic">
                          Giảm giá thành viên
                        </td>
                        <td className="font-bold text-orange-500">
                          -{" "}
                          {(
                            Number(booking.discountAmount) || 0
                          ).toLocaleString()}{" "}
                          ₫
                        </td>
                      </tr>
                    )}
                    {Number(booking.promotionDiscount) > 0 && (
                      <tr className="flex justify-between items-center">
                        <td className="text-rose-500 font-bold italic">
                          Giảm giá khuyến mãi
                        </td>
                        <td className="font-bold text-rose-500">
                          -{" "}
                          {(
                            Number(booking.promotionDiscount) || 0
                          ).toLocaleString()}{" "}
                          ₫
                        </td>
                      </tr>
                    )}
                    <tr className="block h-px bg-gray-200/50 my-2 sm:my-4" />
                    <tr className="flex justify-between items-center">
                      <td className="text-sm sm:text-base font-black text-gray-900 uppercase">
                        Tổng cộng
                      </td>
                      <td className="text-lg sm:text-2xl font-black text-primary tracking-tighter">
                        {booking.totalAmount.toLocaleString()} ₫
                      </td>
                    </tr>
                    <tr className="flex justify-between items-center mt-3 sm:mt-4 bg-green-600 text-white p-3 sm:p-4 rounded-xl shadow-lg shadow-green-100/50">
                      <td className="text-[10px] sm:text-xs font-black uppercase opacity-90">
                        Khách đã trả
                      </td>
                      <td className="text-base sm:text-xl font-black">
                        {booking.paidAmount.toLocaleString()} ₫
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* DYNAMIC STATUS BANNERS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Number(booking.refundAmount) > 0 && (
                  <div className="bg-amber-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-amber-200 flex flex-col justify-center">
                    <p className="text-[8px] sm:text-[9px] font-bold text-amber-600 uppercase mb-0.5">
                      Cần hoàn trả
                    </p>
                    <p className="text-lg sm:text-xl font-black text-amber-700 tracking-tight">
                      {Number(booking.refundAmount).toLocaleString()} ₫
                    </p>
                  </div>
                )}
                {isRefunded && (
                  <div className="bg-indigo-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-indigo-200 flex flex-col justify-center">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      <p className="text-[8px] sm:text-[9px] font-bold text-indigo-600 uppercase">
                        Đã hoàn tất
                      </p>
                    </div>
                    <p className="text-lg sm:text-xl font-black text-indigo-700 tracking-tight">
                      Đã hoàn {booking.paidAmount.toLocaleString()} ₫
                    </p>
                  </div>
                )}
                {booking.cancelReason && (
                  <div className="bg-red-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-red-100 sm:col-span-2">
                    <p className="text-[8px] sm:text-[9px] font-bold text-red-600 uppercase mb-0.5">
                      Lý do hủy đơn
                    </p>
                    <p className="text-xs font-semibold text-red-900 leading-relaxed italic">
                      "{booking.cancelReason}"
                    </p>
                  </div>
                )}
              </div>

              {/* BANK INFO - PROMINENT STYLE */}
              {booking.bankInfo?.bankAccountNumber && (
                <div className="pt-4 sm:pt-6 border-t border-dashed">
                  <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <div className="w-1 h-1 rounded-full bg-primary" />
                    <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest">
                      Thông tin hoàn tiền
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                    <div>
                      <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase mb-0.5">
                        Ngân hàng
                      </p>
                      <p className="text-xs sm:text-sm font-bold text-gray-900">
                        {booking.bankInfo.bankName}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase mb-0.5">
                        Số tài khoản
                      </p>
                      <p className="text-base sm:text-lg font-black text-primary tracking-tighter">
                        {booking.bankInfo.bankAccountNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase mb-0.5">
                        Chủ tài khoản
                      </p>
                      <p className="text-xs sm:text-sm font-bold text-gray-900 uppercase">
                        {booking.bankInfo.bankAccountName}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* 4. HISTORY LOGS - WITH COLLAPSIBLE FEATURE */}
          <Card className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl border-none ring-1 ring-gray-100 bg-white">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-base sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                Lịch sử vận hành
              </h2>
              <span className="text-[9px] sm:text-[10px] font-bold px-2.5 py-0.5 bg-gray-100 text-gray-500 rounded-full uppercase tracking-widest">
                {booking.logs?.length || 0} Logs
              </span>
            </div>

            {!booking.logs?.length ? (
              <p className="text-gray-400 italic text-xs sm:text-sm text-center py-6 sm:py-8">
                Chưa có bản ghi lịch sử.
              </p>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {(showAllLogs ? booking.logs : booking.logs.slice(0, 3)).map(
                  (log: any, idx: number) => (
                    <div
                      key={log.id || idx}
                      className="relative pl-5 sm:pl-6 pb-5 sm:pb-6 last:pb-0 border-l border-gray-100"
                    >
                      <div className="absolute -left-[4.5px] top-1 w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                      <div className="bg-gray-50/50 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border border-gray-100 hover:bg-white hover:shadow-lg transition-all duration-300 group">
                        <div className="flex items-center justify-between gap-4 mb-1.5 sm:mb-2">
                          <span className="text-[8px] sm:text-[9px] font-bold text-primary uppercase tracking-widest px-2 py-0.5 bg-primary/10 rounded-md">
                            {log.action}
                          </span>
                          <span className="text-[9px] sm:text-[10px] font-bold text-gray-400">
                            {format(new Date(log.createdAt), "HH:mm, dd/MM")}
                          </span>
                        </div>
                        <p className="text-[11px] sm:text-xs text-gray-600 font-bold leading-relaxed mb-2">
                          {log.note}
                        </p>
                        {(log.oldCheckIn || log.newCheckIn) && (
                          <div className="mt-2.5 p-2.5 bg-white rounded-lg sm:rounded-xl border border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                            <div>
                              <p className="text-[8px] font-bold text-gray-400 uppercase mb-0.5">
                                Ngày thay đổi
                              </p>
                              <p className="text-[9px] sm:text-[10px] font-bold text-gray-700">
                                {log.oldCheckIn &&
                                  format(
                                    new Date(log.oldCheckIn),
                                    "dd/MM",
                                  )}{" "}
                                →{" "}
                                {log.newCheckIn &&
                                  format(new Date(log.newCheckIn), "dd/MM")}
                              </p>
                            </div>
                            <div>
                              <p className="text-[8px] font-bold text-gray-400 uppercase mb-0.5">
                                Dòng tiền
                              </p>
                              <p className="text-[9px] sm:text-[10px] font-bold text-primary">
                                {log.oldTotal?.toLocaleString()} →{" "}
                                {log.newTotal?.toLocaleString()} ₫
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ),
                )}

                {booking.logs.length > 3 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs font-bold text-gray-400 hover:text-primary mt-2 flex items-center gap-2"
                    onClick={() => setShowAllLogs(!showAllLogs)}
                  >
                    {showAllLogs
                      ? "Thu gọn lịch sử ↑"
                      : `Xem thêm ${booking.logs.length - 3} bản ghi khác ↓`}
                  </Button>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          <Card className="p-0 overflow-hidden rounded-2xl sm:rounded-3xl shadow-xl border-none ring-1 ring-gray-100 bg-white">
            <div className="bg-gray-50 border-b p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-1.5 sm:gap-2">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                Hồ sơ khách hàng
              </h2>
            </div>

            <div className="p-4 sm:p-6 space-y-5 sm:space-y-8">
              {/* Người thanh toán */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-[8px] sm:text-[10px] font-bold text-primary uppercase tracking-widest px-2 py-0.5 bg-primary/10 rounded-md">
                    Chủ đơn hàng
                  </span>
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                  <UserAvatar
                    avatarUrl={user?.avatar}
                    fullName={user?.name}
                    className="w-12 h-12 sm:w-14 sm:h-14 border-2 border-white shadow-md ring-1 ring-gray-100"
                  />
                  <div>
                    <p className="font-bold sm:font-black text-base sm:text-lg text-gray-900 tracking-tighter">
                      {user?.name}
                    </p>
                    <p className="text-gray-400 text-[11px] sm:text-xs font-medium">
                      {user?.email}
                    </p>
                    <p className="text-primary font-bold sm:font-black text-[11px] sm:text-xs mt-0.5 sm:mt-1">
                      {user?.phoneNumber}
                    </p>
                  </div>
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              {/* Khách ở */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-[8px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 py-0.5 bg-gray-100 rounded-md">
                    Khách đại diện lưu trú
                  </span>
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <p className="text-sm sm:text-base font-bold text-gray-800">
                    {guest?.fullName || user?.name}
                  </p>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-medium">
                      Email: {guest?.email || "N/A"}
                    </p>
                    <p className="text-xs text-gray-500 font-medium">
                      SĐT: {guest?.phoneNumber || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Special Request */}
              <div className="bg-amber-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-amber-100/50">
                <div className="text-[8px] sm:text-[9px] font-bold text-amber-600 uppercase tracking-widest mb-1.5 sm:mb-2 flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-amber-400" />
                  Yêu cầu từ khách
                </div>
                <p className="text-xs sm:text-sm font-bold italic text-amber-900 leading-relaxed">
                  "
                  {booking.specialRequest ||
                    "Không có yêu cầu đặc biệt nào được ghi nhận."}
                  "
                </p>
              </div>
            </div>

            {user?.id && (
              <Link href={`/admin/users/${user.id}`}>
                <div className="bg-gray-900 p-4 text-center hover:bg-black transition-colors cursor-pointer">
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">
                    Quản lý hồ sơ người dùng →
                  </span>
                </div>
              </Link>
            )}
          </Card>

          {/* REVIEW (IF ANY) */}
          {booking.review && (
            <Card className="p-6 rounded-3xl shadow-xl border-none ring-1 ring-gray-100 bg-white">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">
                  Đánh giá của khách
                </h2>
                <StarRating value={Number(booking.review.rating)} />
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl border border-dashed italic text-sm text-gray-600">
                "{booking.review.comment}"
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* DIALOGS */}
      <RefundDialog
        open={refundBookingData !== null}
        booking={refundBookingData}
        onClose={() => setRefundBookingData(null)}
        onSuccess={load}
      />

      <SmartCancelDialog
        open={cancelBookingId !== null}
        bookingId={cancelBookingId}
        onClose={() => setCancelBookingId(null)}
        onSuccess={load}
      />

      <AdminBookingUpdateDialog
        open={isEditing}
        onClose={() => setIsEditing(false)}
        booking={booking}
        onConfirm={async (data) => {
          try {
            await api.patch(`/bookings/${booking.id}`, data);
            toast.success("Cập nhật thông tin thành công");
            setIsEditing(false);
            load();
          } catch (err: any) {
            toast.error(err.response?.data?.message || "Cập nhật thất bại");
          }
        }}
      />
    </div>
  );
}
