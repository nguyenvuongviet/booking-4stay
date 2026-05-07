import { Room } from "./room";

export interface PaginatedBookings {
  page: number;
  pageSize: number;
  total: number;
  items: Booking[];
}

export interface UserBooking {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  avatar: string | null;
}

export interface GuestInfo {
  fullName: string;
  email: string;
  phoneNumber: string;
  specialRequest: string;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
    avatar?: string | null;
  };
  bookingId: number;
}

export enum BookingStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  CANCELLED_BY_ADMIN = "CANCELLED_BY_ADMIN",
  CHECKED_IN = "CHECKED_IN",
  CHECKED_OUT = "CHECKED_OUT",
  PARTIALLY_PAID = "PARTIALLY_PAID",
  WAITING_REFUND = "WAITING_REFUND",
  REFUNDED = "REFUNDED",
}

export interface Booking {
  id: number;
  user: UserBooking;
  guestInfo: GuestInfo;
  adults: number;
  children: number;
  checkIn: string;
  checkOut: string;
  status: BookingStatus;
  totalAmount?: number;
  cancelReason?: string | null;
  paymentMethod?: string;
  paidAmount?: number;
  refundAmount?: number;
  cancellationFee?: number;
  createdAt: string;
  updatedAt: string;
  review: Review;
  room: Room;
}
