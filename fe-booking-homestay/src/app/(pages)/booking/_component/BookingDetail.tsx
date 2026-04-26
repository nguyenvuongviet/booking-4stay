import { usePayment } from "@/_hooks/usePayment";
import { BookingCancelSection } from "@/app/(pages)/booking/_component/BookingCancelSection";
import { useLang } from "@/context/lang-context";
import { Booking } from "@/models/Booking";
import { cancel_booking, post_review } from "@/services/bookingApi";
import { differenceInDays, format } from "date-fns";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle,
  Clock,
  CreditCard,
  History,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import CountdownTimer from "../../../../_components/CountdownTimer";
import { Button } from "../../../../_components/ui/button";
import PaymentModal from "../../checkout/_component/PaymentModal";
import { BookingStatusBadge } from "./BookingStatusBadge";
import { ReviewSection } from "./ReviewSection";

export const BookingDetail = ({
  booking: initialBooking,
}: {
  booking: Booking;
}) => {
  const { t } = useLang();
  const [booking, setBooking] = useState(initialBooking);
  const [cancelInfo, setCancelInfo] = useState<{
    reason: string;
    refundAmount: number | null;
  } | null>(null);

  if (!booking || !booking.checkIn || !booking.checkOut) {
    return null;
  }

  const totalNights = differenceInDays(
    new Date(booking.checkOut),
    new Date(booking.checkIn),
  );

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} VND`;
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
    specialRequest: booking.specialRequest ?? "",
    paymentMethod: booking.paymentMethod,
  });

  const confirmNow = () => handleDepositNow(buildPayload(), booking.id);
  const confirmLater = () => handleDepositLater(buildPayload(), booking.id);

  const handleCancel = (
    id: number | string,
    data: { reason: string; refundAmount: number | null },
  ) => {
    setBooking((prev) => ({
      ...prev,
      status: "CANCELLED",
      cancelReason: data.reason,
      refundAmount: booking.paidAmount,
    }));
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

      toast.success("Review submitted successfully!");
    } catch (error) {
      toast.error("Failed to submit review. Please try again.");
      console.error("Review submit error:", error);
    }
  };

  const handleAutoCancelBooking = async () => {
    try {
      await cancel_booking(
        booking.id,
        "Timeout: user did not complete payment",
      );

      setBooking((prev) => ({
        ...prev,
        status: "CANCELLED",
        cancelReason: "Booking đã bị hủy do quá thời gian thanh toán!",
        refundAmount: 0,
      }));

      toast.error("Booking đã bị hủy do quá thời gian thanh toán!");
    } catch (error) {
      console.error("Auto cancel booking failed:", error);
      toast.error("Không thể hủy booking tự động!");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Card Chính */}
      <div className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] overflow-hidden border border-gray-100">
        {/* Gallery Ảnh cao cấp */}
        <div className="relative group">
          <div className="grid grid-cols-4 gap-3 h-[350px] md:h-[450px] p-6">
            <div className="col-span-2 row-span-2 overflow-hidden rounded-3xl relative shadow-lg">
              <img
                src={booking.room?.images?.main || "/placeholder.svg"}
                alt="Main"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute top-6 left-6 scale-110">
                <BookingStatusBadge status={booking.status} />
              </div>
            </div>
            {booking.room?.images?.gallery?.length
              ? booking.room.images.gallery.slice(0, 2).map((img, idx) => (
                  <div
                    key={img.id || idx}
                    className={`col-span-2 overflow-hidden rounded-3xl shadow-md ${idx === 1 ? "hidden md:block" : ""}`}
                  >
                    <img
                      src={img.url || "/placeholder.svg"}
                      alt="Gallery"
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                  </div>
                ))
              : // Fallback if gallery is empty
                [1, 2].map((i) => (
                  <div
                    key={i}
                    className="col-span-2 overflow-hidden rounded-3xl shadow-md bg-gray-100 animate-pulse"
                  />
                ))}
          </div>
        </div>

        <div className="p-8 md:p-12 space-y-12">
          {/* Header Thông tin phòng */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-50 pb-10">
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <Link
                  href={`/room/${booking.room?.id}`}
                  className="group flex items-center gap-2"
                >
                  <h2 className="text-3xl md:text-5xl font-bold elegant-sans text-gray-900 leading-tight group-hover:text-primary transition-colors">
                    {booking.room?.name}
                  </h2>
                  <ArrowRight className="w-6 h-6 text-primary opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </Link>

                <div className="flex items-center gap-1.5 bg-yellow-50 px-5 py-2 rounded-full shadow-sm border border-yellow-100/50 self-start md:self-center">
                  <span className="text-yellow-500 font-bold text-xl">★</span>
                  <span className="text-yellow-800 font-bold text-lg">
                    {booking.room?.rating || 5.0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* HIỂN THỊ TRẠNG THÁI QUAN TRỌNG NGAY TRÊN ĐẦU (CANCELLED / REFUND) */}
          {(booking.status === "WAITING_REFUND" ||
            booking.status === "REFUNDED" ||
            booking.status === "CANCELLED") && (
            <div
              className={`p-6 md:p-8 rounded-[2.5rem] border-2 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500 ${
                booking.status === "CANCELLED"
                  ? "bg-red-50/80 border-red-100/50"
                  : booking.status === "WAITING_REFUND"
                    ? "bg-blue-50/80 border-blue-100/50"
                    : "bg-green-50/80 border-green-100/50"
              }`}
            >
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div
                  className={`p-4 rounded-3xl shadow-sm ${
                    booking.status === "CANCELLED"
                      ? "bg-white text-red-500"
                      : booking.status === "WAITING_REFUND"
                        ? "bg-white text-blue-500 animate-pulse"
                        : "bg-white text-green-500"
                  }`}
                >
                  {booking.status === "CANCELLED" ? (
                    <XCircle className="w-8 h-8" />
                  ) : booking.status === "WAITING_REFUND" ? (
                    <Clock className="w-8 h-8" />
                  ) : (
                    <ShieldCheck className="w-8 h-8" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <h4
                    className={`text-lg font-black uppercase tracking-widest ${
                      booking.status === "CANCELLED"
                        ? "text-red-800"
                        : booking.status === "WAITING_REFUND"
                          ? "text-blue-800"
                          : "text-green-800"
                    }`}
                  >
                    {booking.status === "CANCELLED"
                      ? "Đơn hàng đã hủy"
                      : booking.status === "WAITING_REFUND"
                        ? "Đang xử lý hoàn tiền"
                        : "Đã hoàn tiền thành công"}
                  </h4>
                  <p className="text-gray-600 font-medium leading-relaxed">
                    {booking.status === "CANCELLED"
                      ? "Đơn hàng của bạn đã được hủy theo yêu cầu hoặc do quá hạn."
                      : booking.status === "WAITING_REFUND"
                        ? `Chúng tôi đã ghi nhận và đang chuẩn bị hoàn lại ${formatPrice(booking.refundAmount || 0)} cho bạn.`
                        : `Admin đã hoàn tất việc chuyển khoản ${formatPrice(booking.refundAmount || 0)} vào tài khoản của bạn.`}
                  </p>
                </div>

                {booking.status === "REFUNDED" &&
                  booking.refundInfo?.refundEvidence && (
                    <Link
                      href={booking.refundInfo.refundEvidence}
                      target="_blank"
                      className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-green-600 font-black text-xs uppercase tracking-widest rounded-2xl shadow-sm border border-green-100 transition-all active:scale-95"
                    >
                      <CreditCard className="w-4 h-4" /> Xem biên lai
                    </Link>
                  )}
              </div>
            </div>
          )}

          {/* Grid Thông tin Chi tiết */}
          <div className="grid md:grid-cols-2 gap-10">
            {/* Cột trái: Thông tin khách */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                <h3 className="font-black text-gray-900 uppercase tracking-[0.15em] text-xs">
                  Thông tin khách hàng
                </h3>
              </div>
              <div className="bg-gray-50/70 rounded-4xl p-8 space-y-5 border border-gray-100 shadow-inner">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                    Họ và tên
                  </span>
                  <span className="font-bold text-gray-900">
                    {booking.user?.name}
                  </span>
                </div>
                <div className="h-px bg-gray-100 w-full" />
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                    Email
                  </span>
                  <span className="font-medium text-gray-800">
                    {booking.user?.email}
                  </span>
                </div>
                <div className="h-px bg-gray-100 w-full" />
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                    Điện thoại
                  </span>
                  <span className="font-medium text-gray-800 tracking-wider">
                    {booking.user?.phoneNumber}
                  </span>
                </div>
              </div>
            </div>

            {/* Cột phải: Thông tin đặt phòng */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                <h3 className="font-black text-gray-900 uppercase tracking-[0.15em] text-xs">
                  Chi tiết lịch trình
                </h3>
              </div>
              <div className="bg-gray-50/70 rounded-4xl p-8 space-y-5 border border-gray-100 shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-white rounded-2xl shadow-sm border border-gray-100">
                      <CalendarDays className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                        Thời gian
                      </span>
                      <p className="font-bold text-gray-900 text-sm">
                        {format(new Date(booking.checkIn), "dd/MM/yyyy")} —{" "}
                        {format(new Date(booking.checkOut), "dd/MM/yyyy")}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="h-px bg-gray-100 w-full" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-white rounded-2xl shadow-sm border border-gray-100">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                        Số khách & Đêm
                      </span>
                      <p className="font-bold text-gray-900 text-sm">
                        {totalNights} đêm • {booking.adults} người lớn{" "}
                        {booking.children ? `, ${booking.children} trẻ em` : ""}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl border border-white/5">
            <div className="absolute top-[-20%] right-[-10%] p-8 opacity-[0.03]">
              <CreditCard className="w-80 h-80 rotate-12" />
            </div>

            <div className="relative z-10 space-y-10">
              <div className="grid md:grid-cols-2 gap-10 items-start">
                {/* Cột trái: Tổng quan tiền */}
                <div className="space-y-6">
                  <div>
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em] mb-3">
                      Tổng cộng (Total)
                    </p>
                    <h3 className="text-5xl md:text-6xl font-black text-white tracking-tighter flex items-baseline gap-3 italic">
                      {formatPrice(total).replace("VND", "")}
                      <span className="text-xl text-gray-500 font-normal not-italic uppercase tracking-widest">
                        VND
                      </span>
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <div className="bg-white/5 px-5 py-3 rounded-2xl flex items-center gap-3 border border-white/10 backdrop-blur-md">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <div className="flex flex-col">
                        <span className="text-[9px] text-gray-500 font-bold uppercase">
                          Đã thanh toán
                        </span>
                        <span className="text-sm font-black text-white">
                          {formatPrice(paid)}
                        </span>
                      </div>
                    </div>

                    {remaining > 0 &&
                      !["CANCELLED", "WAITING_REFUND", "REFUNDED"].includes(
                        booking.status,
                      ) && (
                        <div className="bg-amber-500/10 px-5 py-3 rounded-2xl flex items-center gap-3 border border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
                          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                          <div className="flex flex-col">
                            <span className="text-[9px] text-amber-500 font-bold uppercase">
                              Còn lại
                            </span>
                            <span className="text-sm font-black text-amber-400">
                              {formatPrice(remaining)}
                            </span>
                          </div>
                        </div>
                      )}
                  </div>
                </div>

                {/* Cột phải: Trạng thái dòng tiền & Hoàn tiền */}
                <div className="space-y-4">
                  {/* Nếu đang chờ hoàn tiền */}
                  {booking.status === "WAITING_REFUND" && (
                    <div className="bg-blue-500/10 border border-blue-400/20 p-6 rounded-4xl shadow-lg">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-500/20 rounded-2xl">
                          <Clock className="w-6 h-6 text-blue-400 animate-pulse" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-blue-400 uppercase tracking-widest mb-1">
                            Chờ hoàn tiền
                          </p>
                          <p className="text-xs text-gray-400 leading-relaxed">
                            Số tiền{" "}
                            <span className="text-white font-bold">
                              {formatPrice(booking.refundAmount || 0)}
                            </span>{" "}
                            sẽ được chuyển khoản cho bạn qua STK:{" "}
                            <span className="text-white font-bold">
                              {booking.bankInfo?.bankAccountNumber}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Nếu đã hoàn tiền */}
                  {booking.status === "REFUNDED" && (
                    <div className="bg-green-500/10 border border-green-400/20 p-6 rounded-4xl shadow-lg">
                      <div className="flex items-start gap-4">
                        <div
                          className={`p-3 rounded-2xl ${booking.refundInfo?.refundEvidence ? "bg-green-500/20" : "bg-gray-500/20"}`}
                        >
                          <ShieldCheck className="w-6 h-6 text-green-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-black text-green-400 uppercase tracking-widest mb-1">
                            Đã hoàn tiền
                          </p>
                          <p className="text-xs text-gray-400 leading-relaxed mb-4">
                            Admin đã hoàn tất việc chuyển khoản{" "}
                            <span className="text-white font-bold">
                              {formatPrice(booking.refundAmount || 0)}
                            </span>{" "}
                            vào lúc{" "}
                            <span className="text-white font-bold">
                              {booking.refundInfo?.refundedAt
                                ? format(
                                    new Date(booking.refundInfo.refundedAt),
                                    "HH:mm, dd/MM/yyyy",
                                  )
                                : "N/A"}
                            </span>
                          </p>

                          {booking.refundInfo?.refundEvidence && (
                            <Link
                              href={booking.refundInfo.refundEvidence}
                              target="_blank"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-[10px] font-bold uppercase tracking-wider border border-white/5"
                            >
                              <CreditCard className="w-3 h-3" /> Xem biên lai
                              chuyển khoản
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Nếu là đơn PENDING */}
                  {booking.status === "PENDING" && (
                    <div className="bg-amber-500/10 border border-amber-400/20 p-6 rounded-4xl">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-amber-500/20 rounded-2xl">
                          <Clock className="w-6 h-6 text-amber-500 animate-pulse" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-amber-400 uppercase tracking-widest mb-1">
                            Chờ thanh toán
                          </p>
                          <p className="text-xs text-gray-400 leading-relaxed">
                            Đơn hàng sẽ tự động hủy nếu không hoàn tất thanh
                            toán.
                          </p>
                          <div className="mt-2 text-white font-black tabular-nums text-2xl tracking-tighter">
                            <CountdownTimer
                              createdAt={booking.createdAt}
                              expiryMinutes={booking.expiryMinutes}
                              onFinish={() => handleAutoCancelBooking()}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Nếu đã thanh toán thành công (CONFIRMED) */}
                  {booking.status === "CONFIRMED" && (
                    <div className="bg-green-500/10 border border-green-400/20 p-6 rounded-4xl">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-green-500/20 rounded-2xl">
                          <ShieldCheck className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-green-400 uppercase tracking-widest mb-1">
                            Thanh toán an toàn
                          </p>
                          <p className="text-xs text-gray-400 leading-relaxed">
                            {booking.paymentMethod === "CASH"
                              ? "Đã đặt cọc 30%. Vui lòng chuẩn bị tiền mặt cho phần còn lại khi nhận phòng."
                              : "Đã thanh toán 100% giá trị đơn hàng. Hệ thống đã xác nhận thành công."}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Nút bấm Hành động */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-4 md:gap-6 pt-10 border-t border-gray-50">
            {/* 1. NÚT HỦY (Trái cùng - Tinh tế hơn) */}
            {["PENDING", "PARTIALLY_PAID", "CONFIRMED"].includes(
              booking.status,
            ) && (
              <BookingCancelSection booking={booking} onCancel={handleCancel} />
            )}

            {/* 3. NÚT THANH TOÁN (Phải cùng - Nổi bật nhất) */}
            {booking.status === "PENDING" && (
              <Button
                onClick={() =>
                  handleConfirmBooking(
                    booking.paymentMethod === "BANK_TRANSFER"
                      ? "BANK_TRANSFER"
                      : "CASH",
                  )
                }
                className="h-16 px-12 rounded-3xl bg-primary hover:bg-primary/90 text-white font-black text-lg shadow-[0_10px_30px_rgba(var(--primary),0.3)] transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-3"
              >
                <CreditCard className="w-6 h-6" />
                {booking.paymentMethod === "CASH"
                  ? "Cọc tiền ngay"
                  : "Thanh toán ngay"}
              </Button>
            )}

            {booking.status === "CHECKED_OUT" && (
              <ReviewSection booking={booking} onReview={handleReview} />
            )}
          </div>
        </div>
      </div>

      <PaymentModal
        open={openPopupPayment}
        onClose={() => setOpenPopupPayment(false)}
        type={modalType!}
        onDepositNow={confirmNow}
        onDepositLater={confirmLater}
      />
    </div>
  );
};
