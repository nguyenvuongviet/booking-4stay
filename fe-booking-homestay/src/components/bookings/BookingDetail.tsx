import { BookingCancelSection } from "@/components/bookings/BookingCancelSection";
import { Booking } from "@/models/Booking";
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
import { BookingStatusBadge } from "./BookingStatusBadge";
import { ReviewSection } from "./ReviewSection";
import { post_review } from "@/services/bookingApi";
import toast from "react-hot-toast";

export const BookingDetail = ({
  booking: initialBooking,
}: {
  booking: Booking;
}) => {
  const [booking, setBooking] = useState(initialBooking);
  const [cancelInfo, setCancelInfo] = useState<{
    reason: string;
    refundAmount: number | null;
  } | null>(null);

  const handleCancel = (
    id: number | string,
    data: { reason: string; refundAmount: number | null }
  ) => {
    setBooking((prev) => ({
      ...prev,
      status: "CANCELLED",
      cancelReason: data.reason,
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

      // Sau khi submit thành công => đổi UI sang "Xem lại review"
      setBooking((prev) => ({
        ...prev,
        review: resp, // nếu API trả về review
      }));

      toast.success("Review submitted successfully!");
    } catch (error) {
      toast.error("Failed to submit review. Please try again.");
      console.error("Review submit error:", error);
    }
  };

  const totalNights = differenceInDays(
    new Date(booking.checkOut),
    new Date(booking.checkIn)
  );

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} VND`;
  };

  return (
    <div className="bg-white shadow-md rounded-2xl p-8 space-y-8">
      {/* Ảnh phòng */}
      <div className="relative">
        <div className="grid grid-cols-4 gap-2 h-[400px]">
          {" "}
          {/* cố định height */}
          <div className="col-span-2 row-span-2 overflow-hidden rounded-l-lg">
            <img
              src={booking.room?.images?.main || "/placeholder.svg"}
              alt="Hotel main"
              className="w-full h-full object-cover" // scale vừa container
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
            <h2 className="text-2xl font-bold">{booking.room?.name}</h2>
            <BookingStatusBadge status={booking.status} />
          </div>
          <div className="flex items-center gap-2 text-md text-gray-600 mt-1">
            <span>⭐ {booking.room?.rating}</span>
            {/* <span>({booking.room.reviewCount} đánh giá)</span> */}
          </div>
          <p className="text-lg font-semibold text-primary mt-2">
            {formatPrice(booking.room?.price)}/night
          </p>
        </div>

        {/* Thông tin đặt phòng */}
        {/* <div className="border-t pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-700">
              Guest Information:
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500">Guest name</p>
              <p className="font-medium">{booking.user?.name}</p>
            </div>
          </div>
        </div> */}
        <div className="border-t pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="elegant-sanserif text-lg text-gray-700">
              Booking Information:
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-gray-500" />
                <p className="text-gray-500 elegant-subheading">Check-in</p>
              </div>
              {booking?.checkIn ? (
                <p className="font-medium ml-6">
                  {format(new Date(booking.checkIn), "dd/MM/yyyy", {
                    locale: vi,
                  })}
                </p>
              ) : (
                <p className="text-gray-400 italic">Chưa có</p>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-gray-500" />
                <p className="text-gray-500 elegant-subheading">Check-out</p>
              </div>
              {booking?.checkOut ? (
                <p className="font-medium ml-6">
                  {format(new Date(booking.checkOut), "dd/MM/yyyy", {
                    locale: vi,
                  })}
                </p>
              ) : (
                <p className="text-gray-400 italic">Chưa có</p>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <p className="text-gray-500 elegant-subheading">Total nights</p>
              </div>
              <p className="font-medium ml-6">{totalNights} nights</p>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <p className="text-gray-500 elegant-subheading">Guests</p>
              </div>
              <p className="font-medium ml-6 ">
                {booking.adults} adults
                {booking.children ? `, ${booking.children} children` : ""}
              </p>
            </div>
          </div>

          {booking.status === "CANCELLED" && (
            <div className="border-t space-y-4">
              <div className="mt-4 p-4 bg-red-50 rounded-xl text-sm">
                <p className="elegant-sanserif text-lg text-red-600">
                  Booking canceled
                </p>
                <p className="mt-1 text-gray-700 elegant-subheading">
                  Reason: {booking.cancelReason}
                </p>
                {cancelInfo && (
                  <p className="mt-1">
                    Refund:{" "}
                    {cancelInfo?.refundAmount && cancelInfo.refundAmount > 0 ? (
                      <span className="text-green-600 font-medium">
                        {cancelInfo.refundAmount.toLocaleString()} VND
                      </span>
                    ) : (
                      <span className="text-red-500 font-medium"></span>
                    )}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Tổng tiền */}
          <div className="pt-4 border-t">
            {/* <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">Payment Method:</span>
              <span className="font-medium text-gray-900">
                {booking.paymentMethod}
              </span>
            </div> */}
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <p className="text-gray-500 elegant-subheading">Total Amount:</p>
            </div>
            <p className="text-green-600 text-lg font-semibold ml-6">
              {formatPrice(booking.room.price * totalNights) || "Chưa có"}
            </p>
          </div>
        </div>
        {/* Hủy booking */}
        {booking.status !== "CANCELLED" && booking.status !== "CHECKED_OUT" && (
          <div className="flex items-center justify-end">
            <BookingCancelSection booking={booking} onCancel={handleCancel} />
          </div>
        )}
        {/* Review  */}
        {booking.status === "CHECKED_OUT" && (
          <div className="flex items-center justify-end">

              <ReviewSection booking={booking} onReview={handleReview} />
          </div>
        )}
      </div>
    </div>
  );
};
