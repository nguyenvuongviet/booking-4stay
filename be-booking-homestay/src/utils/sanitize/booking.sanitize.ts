import { buildImageUrl, sanitizeCollection } from '../object.util';
import { toUTCISOString } from '../timezone.util';
import { sanitizeRoom } from './room.sanitize';

function sanitize(booking: any) {
  if (!booking) return null;

  const room = booking.rooms;
  const user = booking.users;

  return {
    id: booking.id,
    status: booking.status,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    adults: booking.adults,
    children: booking.children,
    rawTotalPrice: Number(booking.rawTotalPrice || 0),
    discountAmount: Number(booking.discountAmount || 0),
    paidAmount: Number(booking.paidAmount),
    refundAmount: Number(booking.refundAmount || 0),
    cancellationFee: Number(booking.cancellationFee || 0),
    modifiedCount: Number(booking.modifiedCount || 0),
    totalAmount: Number(booking.totalPrice),
    promotionDiscount: Number(booking.promotionDiscount || 0),
    promotionId: booking.promotionId ?? null,
    createdAt: toUTCISOString(booking.createdAt),
    updatedAt: toUTCISOString(booking.updatedAt),
    expiryMinutes: booking.expiryMinutes || 15,
    cancelReason: booking.cancelReason ?? null,
    isReview: booking.isReview,
    paymentMethod: booking.paymentMethod,
    cancellationPolicy: booking.cancellationPolicy,
    bankInfo: {
      bankName: booking.bankName,
      bankAccountNumber: booking.bankAccountNumber,
      bankAccountName: booking.bankAccountName,
    },
    refundInfo: {
      refundEvidence: buildImageUrl(booking.refundEvidence),
      refundedAt: booking.refundedAt,
    },
    guestInfo: {
      fullName: booking.guestFullName,
      email: booking.guestEmail,
      phoneNumber: booking.guestPhoneNumber,
      specialRequest: booking.specialRequest ?? null,
    },
    review: booking.reviews
      ? {
          id: booking.reviews.id,
          rating: Number(booking.reviews.rating),
          comment: booking.reviews.comment,
          createdAt: booking.reviews.createdAt,
        }
      : null,
    user: user
      ? {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`.trim(),
          email: user.email,
          phoneNumber: user.phoneNumber,
          avatar: buildImageUrl(user.avatar),
        }
      : undefined,
    room: sanitizeRoom(room),
    logs: Array.isArray(booking.logs)
      ? booking.logs.map((log: any) => ({
          id: log.id,
          action: log.action,
          oldCheckIn: log.oldCheckIn,
          oldCheckOut: log.oldCheckOut,
          newCheckIn: log.newCheckIn,
          newCheckOut: log.newCheckOut,
          oldTotal: Number(log.oldTotal || 0),
          newTotal: Number(log.newTotal || 0),
          note: log.note,
          createdAt: log.createdAt,
        }))
      : [],
  };
}

export function sanitizeBooking(data: any) {
  return sanitizeCollection(data, sanitize);
}
