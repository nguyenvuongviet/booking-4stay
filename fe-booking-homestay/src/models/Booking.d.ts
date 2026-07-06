import { BookingStatus } from "@/constants/booking-status";
import { Room } from "./Room";

interface User {
  id: string | number;
  name: string;
  email: string;
  phoneNumber: string;
  avatar: string;
}

export interface Booking {
  id: number | string;
  status: BookingStatus;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  totalAmount: number | 0;
  rawTotalPrice?: number;
  discountAmount?: number;
  promotionDiscount?: number;
  expiryMinutes?: number;
  paidAmount: number | 0;
  createdAt: string;
  updatedAt: string;
  cancelReason: string | null;
  guestInfo: {
    fullName: string;
    email: string;
    phoneNumber: string;
    specialRequest?: string | null;
  };
  paymentMethod: PaymentMethod;
  review: {
    id: number | string;
    rating: number;
    comment: string;
    createdAt: string;
  } | null;
  isReview: boolean;
  modifiedCount?: number;
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
  logs?: {
    id: number;
    action: string;
    oldCheckIn: string;
    oldCheckOut: string;
    newCheckIn: string;
    newCheckOut: string;
    oldTotal: number;
    newTotal: number;
    note: string;
    createdAt: string;
  }[];
}
