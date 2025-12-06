import { is } from 'date-fns/locale';
import { Room } from "./Room";

interface User {
  id: string | number;
  name: string;
  email: string;  
  phoneNumber: string;
  avatar: string;
}

export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "CHECKED_IN"
  | "CHECKED_OUT"
  | "PARTIALLY_PAID"
  | "WAITING_REFUND"
  | "REFUNDED";

export interface Booking {
  id: number | string;
  status: BookingStatus;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  totalAmount: number | 0;
  paidAmount: number | 0;
  createdAt: string;
  updatedAt: string;
  cancelReason: string | null;
  guestFullName: string;
  guestEmail: string;
  guestPhoneNumber: string;
  specialRequest?: string | null;
  paymentMethod: string;
  review: {
    id: number | string;
    rating: number;
    comment: string;
    createdAt: string;
  } | null;
  isReview: boolean;
  user: User;
  room: Room;
}
