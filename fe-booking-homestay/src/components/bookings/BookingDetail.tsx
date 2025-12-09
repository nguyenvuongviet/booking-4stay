import { BookingCancelSection } from "@/components/bookings/BookingCancelSection";
import { Booking } from "@/models/Booking";
import { cancel_booking, post_review } from "@/services/bookingApi";
import { differenceInDays, format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  CalendarDays,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { BookingStatusBadge } from "./BookingStatusBadge";
import { ReviewSection } from "./ReviewSection";
import { useLang } from "@/context/lang-context";
import { Button } from "../ui/button";
import PaymentModal from "../payment/PaymentModal";
import CountdownTimer from "../CountdownTimer";
import { usePayment } from "@/_hooks/usePayment";

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

  const totalNights = differenceInDays(
    new Date(booking.checkOut),
    new Date(booking.checkIn)
  );

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} VND`;
  };

  const remainingAmount =
    booking.totalAmount - (booking.paidAmount || booking.totalAmount);

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
    paymentMethod:
      booking.paymentMethod === "VNPAY"
        ? ("VNPAY" as const)
        : ("CASH" as const),
  });

  const confirmNow = () => handleDepositNow(buildPayload(), booking.id);
  const confirmLater = () => handleDepositLater(buildPayload(), booking.id);

  const handleCancel = (
    id: number | string,
    data: { reason: string; refundAmount: number | null }
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
    comment: string
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
        "Timeout: user did not complete payment"
      );

      setBooking((prev) => ({
        ...prev,
        status: "CANCELLED",
        cancelReason: "Timeout: user did not complete payment",
        refundAmount: 0,
      }));

      toast.error("Booking đã bị hủy do quá thời gian thanh toán!");
    } catch (error) {
      console.error("Auto cancel booking failed:", error);
      toast.error("Không thể hủy booking tự động!");
    }
  };

  return (
    <div className="bg-white shadow-md rounded-2xl p-8 space-y-6">
      {/* Ảnh phòng */}
      <div className="relative">
        <div className="grid grid-cols-4 gap-2 h-[400px]">
          <div className="col-span-2 row-span-2 overflow-hidden rounded-l-lg">
            <img
              src={booking.room?.images?.main || "/placeholder.svg"}
              alt="Hotel main"
              className="w-full h-full object-cover"
            />
          </div>
          {booking.room?.images?.gallery
            .filter((img) => !img.isMain)
            .slice(0, 4)
            .map((img) => (
              <div key={img.id} className="overflow-hidden rounded">
                <img
                  src={img.url || "/placeholder.svg"}
                  alt={`Room ${img.id}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
        </div>
      </div>

      <div className="flex flex-col justify-between space-y-6">
        {/* Thông tin phòng */}
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl elegant-sans">{booking.room?.name}</h2>
            <BookingStatusBadge status={booking.status} />
          </div>
          <div className="flex items-center gap-2 text-md text-muted-foreground mt-1">
            <span>⭐ {booking.room?.rating}</span>
            {/* <span>({booking.room.reviewCount} đánh giá)</span> */}
          </div>
          <p className="text-lg elegant-sans text-foreground mt-2">
            {formatPrice(booking.room?.price)}
            <span className="text-muted-foreground elegant-subheading text-sm">
              /{t("night")}
            </span>
          </p>
        </div>

        {/* Thông tin đặt phòng */}
        <div className="border-t pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-700">Thông tin khách</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Tên</p>
              <p className="elegant-sans text-foreground">
                {booking.user?.name}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="elegant-sans text-foreground">
                {booking.user?.email}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Số điện thoại</p>
              <p className="elegant-sans text-foreground">
                {booking.user?.phoneNumber}
              </p>
            </div>
          </div>
        </div>
        <div className="border-t pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="elegant-sans text-lg">Thông tin đặt phòng</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-muted-foreground" />
                <p className="text-muted-foreground elegant-subheading">
                  {t("checkIn")}
                </p>
              </div>
              {booking?.checkIn ? (
                <p className="elegant-sans text-foreground ml-6">
                  {format(new Date(booking.checkIn), "dd/MM/yyyy", {
                    locale: vi,
                  })}
                </p>
              ) : (
                <p className="text-muted italic">None</p>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-muted-foreground" />
                <p className="text-muted-foreground elegant-subheading">
                  {t("checkOut")}
                </p>
              </div>
              {booking?.checkOut ? (
                <p className="elegant-sans text-foreground ml-6">
                  {format(new Date(booking.checkOut), "dd/MM/yyyy", {
                    locale: vi,
                  })}
                </p>
              ) : (
                <p className="text-muted italic">None</p>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <p className="text-muted-foreground elegant-subheading">
                  {t("total")} {t("nights")}
                </p>
              </div>
              <p className="elegant-sans text-foreground ml-6">
                {totalNights} {t("nights")}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <p className="text-muted-foreground elegant-subheading">
                  {t("guests")}
                </p>
              </div>
              <p className="elegant-sans text-foreground ml-6 ">
                {booking.adults} {t("adults")}
                {booking.children
                  ? `, ${booking.children} ${t("children")}`
                  : ""}
              </p>
            </div>
          </div>

          {booking.status === "CANCELLED" && (
            <div className="border-t space-y-4">
              <div className="mt-4 p-4 gap-2 bg-red-50 rounded-xl text-sm">
                <p className="elegant-sans text-lg">{t("Booking cancelled")}</p>
                <p className="mt-1 elegant-subheading">
                  {t("Reason")}:{" "}
                  <span className="text-muted-foreground">
                    {booking.cancelReason}
                  </span>
                </p>
                {cancelInfo && (
                  <p className="mt-1">
                    {t("Refund")}:{" "}
                    {cancelInfo?.refundAmount && cancelInfo.refundAmount > 0 ? (
                      <span className="text-green-600 elegant-sans ">
                        {cancelInfo.refundAmount.toLocaleString()} VND
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        Không hoàn tiền
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-4 h-4 text-muted-foreground" />
              <span className="text-gray-600">Phương thức thanh toán:</span>
              <span className="elegant-sans text-foreground text-sm">
                {booking.paymentMethod === "CASH" ? "Tiền mặt" : "VNPay"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <p className="text-muted-foreground elegant-subheading">
                {t("total")} {t("amount")}:
              </p>
            </div>
            <p className="text-primary text-lg font-semibold ml-6">
              {formatPrice(booking.room.price * totalNights) || "None"}
            </p>
          </div>

          {booking.status === "REFUNDED" && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-700 font-semibold text-lg">
                Hoàn tiền thành công
              </p>

              <p className="text-blue-900 text-md font-bold mt-1">
                Số tiền hoàn: {booking.paidAmount.toLocaleString()} VND
              </p>

              <p className="text-blue-800 text-sm mt-1">
                Thời gian hoàn:&nbsp;
                {booking.updatedAt
                  ? format(new Date(booking.updatedAt), "dd/MM/yyyy HH:mm", {
                      locale: vi,
                    })
                  : "N/A"}
              </p>
            </div>
          )}

          {booking.status === "PENDING" && (
            <div className="bg-yellow-100 p-2 text-center font-medium text-yellow-700 rounded-lg">
              <CountdownTimer
                createdAt={booking.createdAt}
                onFinish={() => handleAutoCancelBooking()}
              />
            </div>
          )}

          {booking.status === "CONFIRMED" &&
            (booking.paymentMethod === "CASH" ? (
              <div className="bg-green-100 p-2 text-center text-sm text-green-700 rounded-lg">
                Bạn đã cọc để giữ phòng, bạn cần thanh toán&nbsp;
                <span className="elegant-sans text-red-600">
                  {remainingAmount.toLocaleString()}
                </span>
                &nbsp;VND khi đến nhận phòng.
              </div>
            ) : (
              <div className="bg-green-100 p-2 text-center text-sm text-green-700 rounded-lg">
                Bạn đã thanh toán thành công,&nbsp;
                <span className="eleagant-sans text-primary">4Stay</span> xin
                cảm ơn !!
              </div>
            ))}
        </div>
        <div className="flex flex-row-reverse gap-4">
          {booking.status !== "CANCELLED" &&
            booking.status !== "CHECKED_OUT" && (
              <div className="flex items-center justify-end">
                <BookingCancelSection
                  booking={booking}
                  onCancel={handleCancel}
                />
              </div>
            )}

          {booking.status === "PENDING" && (
            <div className="flex items-center justify-end">
              <Button
                onClick={() =>
                  handleConfirmBooking(
                    booking.paymentMethod === "VNPAY" ? "VNPAY" : "CASH"
                  )
                }
                className="rounded-xl flex items-center gap-2"
              >
                {booking.paymentMethod === "CASH"
                  ? t("Deposit Now")
                  : t("Payment")}
              </Button>
            </div>
          )}
        </div>

        {booking.status === "CHECKED_OUT" && (
          <div className="flex items-center justify-end">
            <ReviewSection booking={booking} onReview={handleReview} />
          </div>
        )}

        <PaymentModal
          open={openPopupPayment}
          onClose={() => setOpenPopupPayment(false)}
          type={modalType!}
          onDepositNow={confirmNow}
          onDepositLater={confirmLater}
        />
      </div>
    </div>
  );
};
