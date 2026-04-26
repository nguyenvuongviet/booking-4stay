import { bookings_status } from '@prisma/client';

export const ACTIVE_BOOKING_STATUSES: bookings_status[] = [
  bookings_status.PENDING,
  bookings_status.PARTIALLY_PAID,
  bookings_status.CONFIRMED,
  bookings_status.CHECKED_IN,
  bookings_status.WAITING_REFUND,
];

export const CANCELLABLE_STATUSES: bookings_status[] = [
  bookings_status.PENDING,
  bookings_status.PARTIALLY_PAID,
  bookings_status.CONFIRMED,
];

export const VALID_STATUS_TRANSITIONS: Record<
  bookings_status,
  bookings_status[]
> = {
  [bookings_status.PENDING]: [
    bookings_status.PARTIALLY_PAID,
    bookings_status.CONFIRMED,
    bookings_status.CANCELLED,
  ],
  [bookings_status.PARTIALLY_PAID]: [
    bookings_status.CONFIRMED,
    bookings_status.CANCELLED,
    bookings_status.WAITING_REFUND,
  ],
  [bookings_status.CONFIRMED]: [
    bookings_status.CHECKED_IN,
    bookings_status.CANCELLED,
    bookings_status.WAITING_REFUND,
  ],
  [bookings_status.CHECKED_IN]: [
    bookings_status.CHECKED_OUT,
    bookings_status.CANCELLED,
  ],
  [bookings_status.CHECKED_OUT]: [],
  [bookings_status.CANCELLED]: [],
  [bookings_status.WAITING_REFUND]: [bookings_status.REFUNDED],
  [bookings_status.REFUNDED]: [],
};

export type BookingMailType =
  | 'BOOKING_PENDING'
  | 'BOOKING_CONFIRMED'
  | 'BOOKING_CANCELLED'
  | 'BOOKING_PARTIALLY_PAID'
  | 'BOOKING_REFUNDED'
  | 'BOOKING_CHECKED_IN'
  | 'BOOKING_CHECKED_OUT'
  | 'BOOKING_WAITING_REFUND';

export const STATUS_TO_MAIL_TYPE: Record<bookings_status, BookingMailType> = {
  [bookings_status.PENDING]: 'BOOKING_PENDING',
  [bookings_status.PARTIALLY_PAID]: 'BOOKING_PARTIALLY_PAID',
  [bookings_status.CONFIRMED]: 'BOOKING_CONFIRMED',
  [bookings_status.CANCELLED]: 'BOOKING_CANCELLED',
  [bookings_status.WAITING_REFUND]: 'BOOKING_WAITING_REFUND',
  [bookings_status.REFUNDED]: 'BOOKING_REFUNDED',
  [bookings_status.CHECKED_IN]: 'BOOKING_CHECKED_IN',
  [bookings_status.CHECKED_OUT]: 'BOOKING_CHECKED_OUT',
};

export function daysUntilDate(target: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const t = new Date(target);
  t.setHours(0, 0, 0, 0);
  return Math.floor((t.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function sortPolicyDesc(
  policy: any[] | null | undefined,
): { daysBefore: number; refundPercent: number }[] {
  if (!policy || !Array.isArray(policy) || policy.length === 0) return [];
  return [...policy].sort((a, b) => b.daysBefore - a.daysBefore);
}

export function resolveRefundPercent(
  sortedPolicy: { daysBefore: number; refundPercent: number }[],
  daysUntilCheckIn: number,
): number {
  for (const rule of sortedPolicy) {
    if (daysUntilCheckIn >= rule.daysBefore) {
      return Number(rule.refundPercent);
    }
  }
  return 0;
}
