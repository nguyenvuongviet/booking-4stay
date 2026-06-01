export enum NotificationType {
  BOOKING_CREATED = 'BOOKING_CREATED',
  BOOKING_CONFIRMED = 'BOOKING_CONFIRMED',
  BOOKING_CANCELLED = 'BOOKING_CANCELLED',
  BOOKING_REFUNDED = 'BOOKING_REFUNDED',
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  CHECKIN_REMINDER = 'CHECKIN_REMINDER',
  NEW_MESSAGE = 'NEW_MESSAGE',
  ADMIN_BOOKING_CREATED = 'ADMIN_BOOKING_CREATED',
  ADMIN_PAYMENT_SUCCESS = 'ADMIN_PAYMENT_SUCCESS',
  ADMIN_BOOKING_CANCELLED = 'ADMIN_BOOKING_CANCELLED',
  ADMIN_BOOKING_WAITING_REFUND = 'ADMIN_BOOKING_WAITING_REFUND',
}

export type NotificationTargetType = 'booking' | 'conversation';

export type NotificationData = {
  actionUrl?: string;
  targetType?: NotificationTargetType;
  targetId?: number;
  bookingId?: number;
  conversationId?: number;
  fromUserId?: number;
  status?: string;
  paidAmount?: number;
  refundAmount?: number;
  guestName?: string;
  checkIn?: Date | string;
};
