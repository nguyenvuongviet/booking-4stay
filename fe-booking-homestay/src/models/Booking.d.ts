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
  expiryMinutes?: number;
  paidAmount: number | 0;
  createdAt: string;
  updatedAt: string;
  cancelReason: string | null;
  guestFullName: string;
  guestEmail: string;
  guestPhoneNumber: string;
  specialRequest?: string | null;
  paymentMethod: PaymentMethod;
  review: {
    id: number | string;
    rating: number;
    comment: string;
    createdAt: string;
  } | null;
  isReview: boolean;
  refundAmount?: number;
  cancellationPolicy?: any;
  bankInfo?: {
    bankName: string;
    bankAccountNumber: string;
    bankAccountName: string;
  };
  refundInfo?: {
    refundEvidence: string;
    refundedAt: string;
  };
  user: User;
  room: Room;
}
