import {useState} from "react";
import { Booking } from "@/models/Booking";
import { BookingCancelSection } from "@/components/bookings/BookingCancelSection";
import { format, differenceInDays } from "date-fns";
import { vi } from "date-fns/locale";
import { BookingStatusBadge } from "./BookingStatusBadge";
import {
  ArrowLeft,
  CalendarDays,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

export const  BookingDetail = ({
  booking: initialBooking,
}: {
  booking: Booking;
}) => {
  const [booking, setBooking] = useState(initialBooking);

  const handleCancel = (id: number) => {
    setBooking((prev) => ({
      ...prev,
      status: "CANCELLED",
      cancelReason: "User canceled the booking.",
    }));
    // toast.success(`Booking #${id} status updated to CANCELLED.`);
  };

  const mainImage = booking.room?.images?.find((img) => img.isMain)?.url;

  const totalNights = differenceInDays(
    new Date(booking.checkOut),
    new Date(booking.checkIn)
  );

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} VND`;
  };

  return (
    <div className="bg-white shadow-md rounded-2xl p-6 space-y-6">
      {/* Ảnh phòng */}
      <div>
        <img
          src={mainImage}
          alt={booking?.room?.name}
          className="w-full h-64 object-cover rounded-xl"
        />
        {/* <div className="mt-3 flex gap-2 overflow-x-auto">
          {booking.room?.images.find((img) => img.isMain)?.url => (
              <img
                key={img.id}
                src={img.url}
                alt="Room"
                className="w-24 h-16 object-cover rounded-lg"
              />
            ))}
        </div> */}
      </div>

      {/* Thông tin phòng */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{booking.room?.name}</h2>
          <BookingStatusBadge status={booking.status} />
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
          <span>⭐ {booking.room?.rating}</span>
          {/* <span>({booking.room.reviewCount} đánh giá)</span> */}
        </div>
        <p className="text-lg font-semibold text-primary mt-2">
          {formatPrice(booking.room?.price)}/night
        </p>
      </div>

      {/* Thông tin đặt phòng */}
      <div className="border-t pt-4 space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-700">
            Guest Information:
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-500">Guest name</p>
            <p className="font-medium">{}</p>
          </div>
        </div>
      </div>
      <div className="border-t pt-4 space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-700">
            Booking Information:
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-gray-500" />
              <p className="text-gray-500">Check-in</p>
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
              <p className="text-gray-500">Check-out</p>
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
              <p className="text-gray-500">Total nights</p>
            </div>
            <p className="font-medium ml-6">{totalNights} nights</p>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <p className="text-gray-500">Guests</p>
            </div>
            <p className="font-medium ml-6">
              {booking.adults} adults
              {booking.children ? `, ${booking.children} children` : ""}
            </p>
          </div>
        </div>

        {/* Tổng tiền */}
        <div className="pt-2 border-t">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">Payment Method:</span>
            <span className="font-medium text-gray-900">
              {/* {booking.paymentMethod} */}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-500" />
            <p className="text-gray-500">Total Amount:</p>
          </div>
          <p className="text-green-600 text-lg font-semibold ml-6">
            {formatPrice(booking.room.price * totalNights) || "Chưa có"}
          </p>
        </div>
      </div>

      {/* Hủy booking */}
      {booking.status !== "CANCELLED" && (
        <div className="flex items-center justify-end">
          <BookingCancelSection booking={booking} onCancel={handleCancel} />
        </div>
      )}
    </div>
  );
};
