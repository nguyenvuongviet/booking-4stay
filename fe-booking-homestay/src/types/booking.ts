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

export interface Booking {
  id: number;
  user: UserBooking;
  guestInfo: GuestInfo;
  adults: number;
  children: number;
  checkIn: string;
  checkOut: string;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "CHECKED_IN"
    | "CHECKED_OUT"
    | "CANCELLED"
    | "REFUNDED";
  totalAmount?: number;
  cancelReason?: string | null;
  createdAt: string;
  updatedAt: string;
  review: Review;
  room: Room;
}
