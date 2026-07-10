"use client";

import { usePayment } from "@/_hooks/usePayment";
import { BookingCancelSection } from "@/app/(pages)/booking/_component/BookingCancelSection";
import { useRealtimeChat } from "@/context/ChatContext";
import { useLang } from "@/context/lang-context";
import { parseAbsoluteDate } from "@/lib/utils";
import { Booking } from "@/models/Booking";
import { cancel_booking, post_review } from "@/services/bookingApi";
import { BookingStatus } from "@/types/booking";
import { differenceInDays, format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  ArrowRight,
  Calendar,
  History,
  Info,
  MapPin,
  MessageSquare,
  Pencil,
  Star,
  StarHalf,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import CountdownTimer from "../../../../_components/CountdownTimer";
import { Button } from "../../../../_components/ui/button";
import { translateStatus } from "../../admin/_utils/bookingStatus";
import PaymentModal from "../../checkout/_component/PaymentModal";
import { BookingStatusBadge } from "./BookingStatusBadge";
import { ReviewSection } from "./ReviewSection";
import { UnifiedUpdateDialog } from "./UnifiedUpdateDialog";

export const BookingDetail = ({
  booking: initialBooking,
}: {
  booking: Booking;
}) => {
  const { t } = useLang();
  const router = useRouter();
  const { createOrGetConversation } = useRealtimeChat();
  const [chatLoading, setChatLoading] = useState(false);
  const [booking, setBooking] = useState(initialBooking);
  const [cancelInfo, setCancelInfo] = useState<{
    reason: string;
    refundAmount: number | null;
  } | null>(null);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [updateModalStep, setUpdateModalStep] = useState<"edit" | "bank-info">(
    "edit",
  );

  const handleChatWithHost = async () => {
    if (!booking.room?.host?.id) {
      toast.error("Không tìm thấy thông tin Host");
      return;
    }
    setChatLoading(true);
    try {
      const convId = await createOrGetConversation(
        booking.room.host.id,
        booking.room.id,
      );
      if (convId) {
        router.push("/inbox");
      } else {
        toast.error("Không thể tạo cuộc hội thoại lúc này");
      }
    } catch (err) {
      toast.error("Lỗi khi kết nối trò chuyện");
    } finally {
      setChatLoading(false);
    }
  };

  if (!booking || !booking.checkIn || !booking.checkOut) {
    return null;
  }

  const totalNights = differenceInDays(
    parseAbsoluteDate(booking.checkOut),
    parseAbsoluteDate(booking.checkIn),
  );

  const formatPrice = (price: number) => {
    return price.toLocaleString();
  };

  const paid = Number(booking.paidAmount || 0);
  const total = Number(booking.totalAmount || 0);
  const remaining = total - paid;
  const refund = Number(booking.refundAmount || 0);

  const {
    modalType,
    openPopupPayment,
    setOpenPopupPayment,
    handleConfirmBooking,
    handleDepositNow,
    handleDepositLater,
  } = usePayment(booking.room, booking);

  const buildPayload = () => ({
    roomId: booking.room.id,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    adults: Number(booking.adults),
    children: Number(booking.children),
    guestFullName: booking.user?.name,
    guestEmail: booking.user?.email,
    guestPhoneNumber: booking.user?.phoneNumber,
    specialRequest: booking.guestInfo?.specialRequest ?? "",
    paymentMethod: modalType || booking.paymentMethod,
  });

  const confirmNow = () => handleDepositNow(buildPayload(), booking.id);
  const confirmLater = () => handleDepositLater(buildPayload(), booking.id);

  const handleCancel = (
    id: number | string,
    data: { reason: string; refundAmount: number | null },
    newBooking?: Booking,
  ) => {
    setBooking((prev) => {
      const updatedStatus = newBooking
        ? newBooking.status
        : data.refundAmount && data.refundAmount > 0
          ? BookingStatus.WAITING_REFUND
          : BookingStatus.CANCELLED;

      const updatedRefund = newBooking
        ? newBooking.refundAmount
        : data.refundAmount || 0;

      const newLog = {
        id: Date.now(),
        action: "CANCEL",
        note: `Đơn hàng đã hủy. Lý do: ${data.reason}.`,
        createdAt: new Date().toISOString(),
        oldTotal: prev.totalAmount || 0,
        newTotal: prev.totalAmount || 0,
        oldCheckIn: prev.checkIn || "",
        oldCheckOut: prev.checkOut || "",
        newCheckIn: prev.checkIn || "",
        newCheckOut: prev.checkOut || "",
      };

      return {
        ...prev,
        ...(newBooking || {}),
        room: prev.room,
        user: prev.user,
        logs:
          newBooking?.logs && newBooking.logs.length > 0
            ? newBooking.logs
            : [newLog, ...(prev.logs || [])],
        status: updatedStatus as any,
        cancelReason: data.reason,
        refundAmount: updatedRefund,
      };
    });
    setCancelInfo(data);
  };

  const handleReview = async (
    bookingId: number | string,
    rating: number,
    comment: string,
  ) => {
    try {
      const resp = await post_review(bookingId, rating, comment);
      setBooking((prev) => ({
        ...prev,
        review: resp,
      }));

      toast.success("Đánh giá của bạn đã được gửi!");
    } catch (error) {
      toast.error("Không thể gửi đánh giá. Vui lòng thử lại.");
    }
  };

  const handleAutoCancelBooking = async () => {
    try {
      await cancel_booking(
        booking.id,
        "Đặt phòng đã bị hủy do quá thời gian thanh toán!",
      );

      setBooking((prev) => ({
        ...prev,
        status: "CANCELLED",
        cancelReason: "Booking đã bị hủy do quá thời gian thanh toán!",
        refundAmount: 0,
      }));

      toast.error("Booking đã bị hủy do quá thời gian thanh toán!");
    } catch (error) {
      toast.error("Không thể hủy booking tự động!");
    }
  };

  const handleUpdateBooking = (newBooking: any, message: string) => {
    if (newBooking) {
      setBooking(newBooking);
      toast.success(message);
    }
  };

  const modifiedCount = Number(booking.modifiedCount || 0);
  const showActions = [
    BookingStatus.PENDING,
    BookingStatus.CONFIRMED,
    BookingStatus.PARTIALLY_PAID,
    BookingStatus.CHECKED_IN,
  ].includes(booking.status as BookingStatus);

  const canEdit = modifiedCount < 3;
  const canCancel = true; // Luôn cho phép huỷ nếu đơn đang active

  let freeCancelDays = 3;
  if (booking.cancellationPolicy && booking.cancellationPolicy.length > 0) {
    const sorted = [...booking.cancellationPolicy].sort(
      (a, b) => b.refundPercent - a.refundPercent,
    );
    if (sorted[0].refundPercent >= 1) {
      freeCancelDays = sorted[0].daysBefore;
    }
  }
  const daysLeft = differenceInDays(
    parseAbsoluteDate(booking.checkIn),
    new Date(),
  );
  const canReschedule =
    daysLeft >= freeCancelDays && (booking.modifiedCount || 0) < 3;
  const disableEdit = !showActions || !canReschedule;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* CỘT TRÁI (Nội dung chính) */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. Card: Mã đặt phòng */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                Mã đặt phòng: BK-{booking.id}
              </h2>
              <div className="flex items-center gap-2 mt-1.5 text-gray-500 text-sm">
                <Calendar className="w-4 h-4" />
                <span>
                  Đặt ngày{" "}
                  {format(new Date(booking.createdAt), "dd 'tháng' MM, yyyy", {
                    locale: vi,
                  })}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="shrink-0 flex justify-end">
                <BookingStatusBadge status={booking.status} />
              </div>
            </div>
          </div>

          {/* 2. Card: Thông tin Khách sạn / Phòng */}
          <Link
            href={`/room/${booking.room?.id}`}
            className="bg-white rounded-3xl p-4 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_15px_rgba(0,0,0,0.05)] transition-shadow flex flex-col sm:flex-row gap-6"
          >
            <div className="shrink-0 w-full sm:w-55 h-40 rounded-2xl overflow-hidden relative">
              <img
                src={booking.room?.images?.main || "/placeholder.svg"}
                alt="Room"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col justify-center flex-1 py-2 pr-4">
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {booking.room?.name}
              </h3>
              <div className="flex items-start gap-1.5 text-gray-500 text-sm mb-4">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <p className="line-clamp-2 leading-relaxed">
                  {booking.room?.location?.fullAddress}
                </p>
              </div>

              <div className="mt-auto flex justify-end">
                <div className="flex items-center gap-1">
                  <div className="flex items-center text-yellow-400">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const rating = Number(booking.room?.rating || 0);
                      if (rating >= i + 1) {
                        return (
                          <Star
                            key={i}
                            className="w-4 h-4 fill-current text-yellow-400"
                          />
                        );
                      } else if (rating > i) {
                        return (
                          <div key={i} className="relative w-4 h-4">
                            <Star className="absolute inset-0 w-4 h-4 text-gray-300" />
                            <StarHalf className="absolute inset-0 w-4 h-4 fill-current text-yellow-400" />
                          </div>
                        );
                      } else {
                        return (
                          <Star key={i} className="w-4 h-4 text-gray-300" />
                        );
                      }
                    })}
                  </div>
                  <span className="font-bold text-gray-900 text-sm ml-1">
                    {Number(booking.room?.rating || 0).toFixed(1)}
                  </span>
                  <span className="text-gray-500 text-xs ml-1">
                    ({booking.room?.reviewCount || 0} đánh giá)
                  </span>
                </div>
              </div>
            </div>
          </Link>

          {/* 3. Grid 2 cột: Lịch trình & Khách hàng */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* 3.1 Chi tiết lưu trú */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-6 flex flex-col">
              <h4 className="font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-400" /> Chi tiết lưu trú
              </h4>

              <div className="flex items-center justify-between border-b border-gray-100 pb-5">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    Check-in
                  </p>
                  <p className="font-bold text-gray-900">
                    {format(parseAbsoluteDate(booking.checkIn), "dd MMM yyyy", {
                      locale: vi,
                    })}
                  </p>
                  <p className="text-sm text-gray-500">14:00</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-300" />
                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    Check-out
                  </p>
                  <p className="font-bold text-gray-900">
                    {format(
                      parseAbsoluteDate(booking.checkOut),
                      "dd MMM yyyy",
                      {
                        locale: vi,
                      },
                    )}
                  </p>
                  <p className="text-sm text-gray-500">12:00</p>
                </div>
              </div>

              <div className="space-y-4 pt-1 flex-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Thời gian:</span>
                  <span className="font-medium text-gray-900">
                    {totalNights} Đêm
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Số lượng khách:</span>
                  <div className="text-right">
                    <span className="font-medium text-gray-900 block">
                      {booking.adults} Người lớn
                      {booking.children ? `, ${booking.children} Trẻ em` : ""}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium italic">
                      (Tối đa: {booking.room?.adultCapacity} người lớn,{" "}
                      {booking.room?.childCapacity || 0} trẻ em)
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-start text-sm gap-4">
                  <span className="text-gray-500 shrink-0">Hạng phòng:</span>
                  <span className="font-medium text-gray-900 text-right line-clamp-2">
                    {booking.room?.name}
                  </span>
                </div>
              </div>
            </div>

            {/* 3.2 Thông tin khách hàng & Quản lý */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-gray-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-gray-400" /> Thông tin khách
                    hàng
                  </h4>
                </div>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-gray-500 shrink-0">Tên khách:</span>
                    <span className="font-medium text-gray-900 text-right line-clamp-1">
                      {booking.guestInfo?.fullName || booking.user?.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-gray-500 shrink-0">
                      Số điện thoại:
                    </span>
                    <span className="font-medium text-gray-900 text-right">
                      {booking.guestInfo?.phoneNumber ||
                        booking.user?.phoneNumber}
                    </span>
                  </div>
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-gray-500 shrink-0">Email:</span>
                    <span className="font-medium text-gray-900 text-right break-all">
                      {booking.guestInfo?.email || booking.user?.email}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {showActions && (
                <div className="mt-6 pt-5 border-t border-gray-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Quản lý đặt phòng
                    </p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                      {booking.modifiedCount || 0}/3 lần đổi
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    disabled={disableEdit}
                    onClick={() => {
                      setUpdateModalStep("edit");
                      setIsUpdateOpen(true);
                    }}
                    className="w-full justify-center h-16 px-6 sm:px-8 rounded-3xl border-2 border-gray-100 shadow-sm hover:shadow-md hover:border-primary/20 hover:bg-primary/5 flex items-center gap-4 group transition-all duration-300"
                  >
                    <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-primary/10 transition-colors">
                      <Pencil className="w-5 h-5 text-gray-600 group-hover:text-primary transition-colors" />
                    </div>
                    <div className="flex flex-col items-start leading-tight">
                      <span className="font-black text-gray-800 group-hover:text-primary transition-colors text-sm">
                        Chỉnh sửa đơn đặt
                      </span>
                      <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                        Ngày, khách, thông tin
                      </span>
                    </div>
                  </Button>

                  <BookingCancelSection
                    booking={booking}
                    onCancel={handleCancel}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Yêu cầu Nhận phòng dự kiến (nếu có) */}
          {booking.expectedCheckInReq &&
            (() => {
              const isEarlyCheckIn =
                booking.expectedCheckInTime &&
                booking.expectedCheckInTime.split("-")[0].trim() < "14:00";
              return (
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-gray-900 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-gray-400" /> Giờ nhận
                      phòng dự kiến
                    </h4>
                    {booking.expectedCheckInStatus === "PENDING" && (
                      <span className="text-[10px] font-bold px-3 py-1 bg-amber-50 text-amber-600 rounded-full border border-amber-200">
                        Đang chờ xác nhận
                      </span>
                    )}
                    {booking.expectedCheckInStatus === "APPROVED" && (
                      <span className="text-[10px] font-bold px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-200">
                        {isEarlyCheckIn ? "Đã xác nhận" : "Đã ghi nhận"}
                      </span>
                    )}
                    {booking.expectedCheckInStatus === "REJECTED" && (
                      <span className="text-[10px] font-bold px-3 py-1 bg-red-50 text-red-600 rounded-full border border-red-200">
                        Từ chối
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50/80 p-4 rounded-xl text-sm border border-gray-100">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase block mb-0.5">
                        Giờ nhận phòng dự kiến
                      </span>
                      <span className="font-bold text-gray-800">
                        {booking.expectedCheckInTime || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase block mb-0.5">
                        Lời nhắn của bạn
                      </span>
                      <span className="text-gray-600 italic">
                        "
                        {booking.expectedCheckInReason ||
                          "Không có ghi chú thêm"}
                        "
                      </span>
                    </div>
                  </div>

                  {booking.expectedCheckInStatus !== "PENDING" &&
                    isEarlyCheckIn && (
                      <div
                        className={`p-4 rounded-xl text-xs border ${
                          booking.expectedCheckInStatus === "APPROVED"
                            ? "bg-emerald-50/50 text-emerald-950 border-emerald-100/50"
                            : "bg-red-50/50 text-red-950 border-red-100/50"
                        }`}
                      >
                        <span className="font-bold block mb-1">
                          {booking.expectedCheckInStatus === "APPROVED"
                            ? "✓ Phản hồi từ Admin (Chấp thuận):"
                            : "✗ Phản hồi từ Admin (Từ chối):"}
                        </span>
                        <p className="italic">
                          "
                          {booking.expectedCheckInReason ||
                            "Không có lời nhắn chi tiết"}
                          "
                        </p>
                      </div>
                    )}
                </div>
              );
            })()}

          {/* 4. Yêu cầu đặc biệt */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-gray-400" /> Yêu cầu đặc
                biệt
              </h4>
            </div>
            <div className="bg-gray-50/80 border border-gray-100 p-4 rounded-xl text-sm text-gray-600 leading-relaxed min-h-20">
              {booking.guestInfo?.specialRequest ||
                "Không có yêu cầu đặc biệt nào được ghi chú."}
            </div>
          </div>

          {/* 5. Đánh giá (nếu đã trả phòng) */}
          {booking.status === BookingStatus.CHECKED_OUT && (
            <ReviewSection booking={booking} onReview={handleReview} />
          )}

          {/* 6. Lịch sử thay đổi (Collapsible) */}
          {booking.logs && booking.logs.length > 0 && (
            <details className="bg-white rounded-3xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] group overflow-hidden">
              <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-gray-400" />
                  <h4 className="font-bold text-gray-900">Lịch sử thay đổi</h4>
                  <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-full ml-2">
                    {booking.logs.length}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-open:rotate-180 transition-transform duration-300">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </summary>
              <div className="px-6 pb-6 pt-2 space-y-4 border-t border-gray-50">
                {booking.logs.map((log, idx) => (
                  <div
                    key={log.id}
                    className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50"
                  >
                    <div className="sm:w-[30%] shrink-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            log.action === "RESCHEDULE"
                              ? "bg-blue-500"
                              : log.action === "UPDATE_OCCUPANCY"
                                ? "bg-orange-500"
                                : log.action === "CANCEL"
                                  ? "bg-red-500"
                                  : "bg-gray-400"
                          }`}
                        />
                        <p className="text-xs font-black text-gray-700 uppercase tracking-tight wrap-break-word">
                          {log.action === "RESCHEDULE"
                            ? "Đổi ngày lưu trú"
                            : log.action === "REFUND_DIFFERENCE_CONFIRMED"
                              ? "Xác nhận hoàn tiền chênh lệch"
                              : log.action === "UPDATE_OCCUPANCY"
                                ? "Cập nhật số khách"
                                : log.action === "UPDATE_INFO"
                                  ? "Cập nhật thông tin"
                                  : log.action === "CANCEL"
                                    ? "Hủy đặt phòng"
                                    : log.action === "REFUND_CONFIRMED"
                                      ? "Xác nhận hoàn tiền"
                                      : log.action === "CREATE"
                                        ? "Tạo đơn đặt"
                                        : log.action ===
                                            "UPDATE_EXPECTED_CHECKIN"
                                          ? "Đổi giờ nhận phòng"
                                          : log.action === "UPDATE_BANK_INFO"
                                            ? "Cập nhật TK hoàn tiền"
                                            : log.action}
                        </p>
                      </div>
                      <time className="text-[10px] text-gray-400 font-medium">
                        {format(new Date(log.createdAt), "HH:mm, dd/MM/yyyy")}
                      </time>
                    </div>
                    <div className="flex-1 text-sm">
                      <p className="text-gray-600 leading-relaxed mb-3 font-medium">
                        {Object.keys(BookingStatus).reduce(
                          (note, key) =>
                            note?.replace(
                              new RegExp(key, "g"),
                              translateStatus(key),
                            ),
                          log.note,
                        )}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Hiển thị thay đổi giá nếu có */}
                        {log.oldTotal !== log.newTotal && (
                          <div className="bg-white/60 p-2 rounded-lg border border-gray-100">
                            <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">
                              Biến động giá
                            </p>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="line-through text-gray-400">
                                {formatPrice(log.oldTotal)} ₫
                              </span>
                              <ArrowRight className="w-3 h-3 text-gray-300" />
                              <span className="text-primary font-bold">
                                {formatPrice(log.newTotal)} ₫
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Hiển thị thay đổi ngày nếu là RESCHEDULE */}
                        {log.action === "RESCHEDULE" && log.oldCheckIn && (
                          <div className="bg-white/60 p-2 rounded-lg border border-gray-100">
                            <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">
                              Thời gian lưu trú
                            </p>
                            <div className="flex flex-col gap-0.5 text-xs">
                              <div className="flex items-center gap-1.5 line-through text-gray-400">
                                <span>
                                  {format(new Date(log.oldCheckIn), "dd/MM")}
                                </span>
                                <span>-</span>
                                <span>
                                  {format(new Date(log.oldCheckOut), "dd/MM")}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 text-gray-900 font-bold">
                                <span>
                                  {format(new Date(log.newCheckIn), "dd/MM")}
                                </span>
                                <span>-</span>
                                <span>
                                  {format(new Date(log.newCheckOut), "dd/MM")}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>

        {/* CỘT PHẢI (Thanh toán Tóm tắt - Sticky) */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] lg:sticky lg:top-24 space-y-6">
            <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">
              Tóm tắt thanh toán
            </h3>

            <div className="space-y-4 text-sm border-b border-gray-100 pb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">
                  Giá phòng ({totalNights} đêm)
                </span>
                <span className="font-medium text-gray-900">
                  {formatPrice(Number(booking.rawTotalPrice || total))} VND
                </span>
              </div>

              {Number(booking.discountAmount || 0) > 0 && (
                <div className="flex justify-between items-center text-amber-600 font-medium">
                  <span>Giảm giá thành viên</span>
                  <span>
                    -{formatPrice(Number(booking.discountAmount))} VND
                  </span>
                </div>
              )}

              {Number(booking.promotionDiscount || 0) > 0 && (
                <div className="flex justify-between items-center text-rose-600 font-medium">
                  <span>Giảm giá mã khuyến mãi</span>
                  <span>
                    -{formatPrice(Number(booking.promotionDiscount))} VND
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-gray-500">Phí dịch vụ</span>
                <span className="font-medium text-gray-900">Miễn phí</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Thuế (10%)</span>
                <span className="font-medium text-gray-900">Đã bao gồm</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="bg-primary/5 rounded-2xl p-5 border border-primary/10">
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-gray-600 uppercase tracking-widest text-[10px]">
                    Tổng cộng
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-primary font-black text-3xl tracking-tight">
                      {formatPrice(total)}
                    </span>
                    <span className="text-primary font-bold text-sm">VND</span>
                  </div>
                </div>
              </div>

              {paid > 0 && (
                <div className="flex justify-between items-center text-sm px-2 mt-2">
                  <span className="text-gray-500 font-medium">
                    Đã thanh toán
                  </span>
                  <span className="font-bold text-green-600">
                    -{formatPrice(paid)} VND
                  </span>
                </div>
              )}

              {booking.logs?.some(
                (l: any) => l.action === "REFUND_DIFFERENCE_CONFIRMED",
              ) && (
                <div className="flex justify-between items-center text-sm px-2 mt-1">
                  <span className="text-amber-600 font-medium">
                    Đã hoàn trả chênh lệch
                  </span>
                  <span className="font-bold text-amber-600">
                    +{formatPrice(paid - total)} VND
                  </span>
                </div>
              )}

              {remaining > 0 &&
                ![
                  BookingStatus.CANCELLED,
                  BookingStatus.WAITING_REFUND,
                  BookingStatus.REFUNDED,
                ].includes(booking.status) && (
                  <div className="bg-red-50/80 rounded-2xl p-4 border border-red-100 mt-2">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-red-500 text-[10px] uppercase tracking-widest">
                        Còn lại cần thanh toán
                      </span>
                      <span className="font-black text-red-600 text-xl">
                        {formatPrice(remaining)} VND
                      </span>
                    </div>
                  </div>
                )}

              {/* Thông báo hoàn tiền chênh lệch */}
              {refund > 0 &&
                remaining <= 0 &&
                ![
                  BookingStatus.CANCELLED,
                  BookingStatus.WAITING_REFUND,
                  BookingStatus.REFUNDED,
                ].includes(booking.status) && (
                  <div className="bg-amber-50/80 rounded-2xl p-4 border border-amber-200 mt-2 space-y-2">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-amber-600 text-[10px] uppercase tracking-widest">
                        Hoàn tiền chênh lệch
                      </span>
                      <span className="font-black text-amber-700 text-xl">
                        {formatPrice(refund)} VND
                      </span>
                    </div>
                    {booking.bankInfo?.bankAccountNumber ? (
                      <div className="text-xs text-amber-700 bg-amber-100/50 rounded-lg p-2 space-y-0.5">
                        <p className="font-bold">Thông tin nhận tiền:</p>
                        <p>
                          {booking.bankInfo.bankName} —{" "}
                          {booking.bankInfo.bankAccountNumber}
                        </p>
                        <p>CTK: {booking.bankInfo.bankAccountName}</p>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => {
                          setUpdateModalStep("bank-info");
                          setIsUpdateOpen(true);
                        }}
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold"
                      >
                        Cung cấp thông tin ngân hàng
                      </Button>
                    )}
                    <p className="text-[10px] text-amber-600 italic">
                      Quản trị viên sẽ hoàn tiền sau khi xác nhận thông tin.
                    </p>
                  </div>
                )}
            </div>

            {/* Thông báo thanh toán pending */}
            {booking.status === BookingStatus.PENDING && (
              <div className="bg-blue-50/80 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-800 leading-relaxed">
                  Vui lòng thanh toán cọc hoặc toàn bộ để giữ phòng. Đặt phòng
                  có thể bị hủy nếu không thanh toán trong{" "}
                  <span className="font-bold">
                    <CountdownTimer
                      createdAt={booking.createdAt}
                      expiryMinutes={booking.expiryMinutes}
                      onFinish={handleAutoCancelBooking}
                    />
                  </span>
                  .
                </div>
              </div>
            )}

            {/* Thông báo Refund */}
            {[BookingStatus.WAITING_REFUND, BookingStatus.REFUNDED].includes(
              booking.status,
            ) && (
              <div
                className={`p-4 rounded-2xl border space-y-3 mt-2 ${
                  booking.status === BookingStatus.REFUNDED
                    ? "bg-green-50/80 border-green-200 text-green-800"
                    : "bg-amber-50/80 border-amber-200 text-amber-800"
                }`}
              >
                <div className="flex flex-col gap-1">
                  <span
                    className={`font-bold text-[10px] uppercase tracking-widest ${
                      booking.status === BookingStatus.REFUNDED
                        ? "text-green-600"
                        : "text-amber-600"
                    }`}
                  >
                    {booking.status === BookingStatus.REFUNDED
                      ? "Đã hoàn tất"
                      : "Hoàn tiền cho khách"}
                  </span>
                  <span
                    className={`font-black text-xl tracking-tight ${
                      booking.status === BookingStatus.REFUNDED
                        ? "text-green-700"
                        : "text-amber-700"
                    }`}
                  >
                    {formatPrice(refund || paid)} VND
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <Info
                    className={`w-4 h-4 shrink-0 mt-0.5 ${
                      booking.status === BookingStatus.REFUNDED
                        ? "text-green-600"
                        : "text-amber-600"
                    }`}
                  />
                  <div className="text-[11px] leading-relaxed font-medium">
                    {booking.status === BookingStatus.REFUNDED
                      ? `Đã hoàn tiền vào ngày ${format(new Date(booking.refundInfo?.refundedAt || new Date()), "dd/MM/yyyy")}.`
                      : `Hệ thống đang chuẩn bị hoàn lại số tiền này cho bạn.`}
                  </div>
                </div>

                {booking.status === BookingStatus.WAITING_REFUND && (
                  <div className="pt-1">
                    {booking.bankInfo?.bankAccountNumber ? (
                      <div className="bg-white/60 rounded-xl p-3.5 text-xs space-y-2.5 border border-amber-200/50 shadow-sm">
                        <div className="flex items-center justify-between">
                          <p className="font-black text-amber-900 uppercase tracking-tighter">
                            Thông tin nhận tiền
                          </p>
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        </div>
                        <div className="space-y-1.5 text-[11px]">
                          <div className="flex justify-between items-center">
                            <span className="text-amber-600/70 font-medium">
                              Ngân hàng:
                            </span>
                            <span className="font-bold text-amber-900">
                              {booking.bankInfo.bankName}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-amber-600/70 font-medium">
                              Số tài khoản:
                            </span>
                            <span className="font-bold text-amber-900 tracking-wider">
                              {booking.bankInfo.bankAccountNumber}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-amber-600/70 font-medium">
                              Chủ tài khoản:
                            </span>
                            <span className="font-bold text-amber-900 uppercase">
                              {booking.bankInfo.bankAccountName}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setUpdateModalStep("bank-info");
                            setIsUpdateOpen(true);
                          }}
                          className="w-full h-8 mt-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-amber-600 hover:bg-amber-100 hover:text-amber-700 transition-all border border-amber-100"
                        >
                          Thay đổi thông tin →
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => {
                          setUpdateModalStep("bank-info");
                          setIsUpdateOpen(true);
                        }}
                        className="w-full h-11 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-lg shadow-amber-200/50 transition-all flex items-center justify-center gap-2"
                      >
                        Cung cấp thông tin ngân hàng
                      </Button>
                    )}
                    <p className="text-[10px] text-amber-600 italic mt-3 text-center leading-tight">
                      Quản trị viên sẽ hoàn tiền sau khi xác nhận thông tin.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Thông báo Hủy */}
            {booking.status === BookingStatus.CANCELLED && (
              <div className="bg-red-50/80 border border-red-100 p-4 rounded-xl flex items-start gap-3">
                <Info className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="text-xs text-red-800 leading-relaxed">
                  Đơn hàng đã hủy. Lý do:{" "}
                  <span className="font-semibold">
                    {booking.cancelReason?.includes("Timeout") ||
                    booking.cancelReason?.includes("payment")
                      ? "Hết thời gian giữ chỗ"
                      : booking.cancelReason}
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons Thanh toán */}
            {(booking.status === BookingStatus.PENDING ||
              ((booking.status === BookingStatus.PARTIALLY_PAID ||
                booking.status === BookingStatus.CONFIRMED ||
                booking.status === BookingStatus.CHECKED_IN) &&
                remaining > 0)) && (
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <Button
                  onClick={() => handleConfirmBooking("BANK_TRANSFER")}
                  className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 text-[15px] transition-all"
                >
                  {remaining === total
                    ? "Thanh toán ngay"
                    : "Thanh toán số tiền còn lại"}
                </Button>
                {booking.status === BookingStatus.PENDING && (
                  <Button
                    variant="outline"
                    onClick={() => handleConfirmBooking("CASH")}
                    className="w-full h-14 rounded-2xl font-bold border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 text-[15px] transition-all"
                  >
                    Thanh toán tại chỗ
                  </Button>
                )}
              </div>
            )}

            {/* Trò chuyện với Host */}
            <div className="pt-4 border-t border-gray-100">
              <Button
                onClick={handleChatWithHost}
                disabled={chatLoading}
                className="w-full h-12 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-sky-100"
              >
                <MessageSquare className="w-4 h-4" />
                {chatLoading ? "Đang kết nối..." : "Trò chuyện với Host"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <UnifiedUpdateDialog
        open={isUpdateOpen}
        initialStep={updateModalStep}
        onClose={() => setIsUpdateOpen(false)}
        booking={booking}
        onUpdated={handleUpdateBooking}
      />

      <PaymentModal
        open={openPopupPayment}
        onClose={() => setOpenPopupPayment(false)}
        type={modalType!}
        onDepositNow={confirmNow}
        onDepositLater={confirmLater}
        isRemaining={remaining > 0 && booking.status !== BookingStatus.PENDING}
      />
    </div>
  );
};
