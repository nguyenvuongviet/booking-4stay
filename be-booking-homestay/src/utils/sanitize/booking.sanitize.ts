import { buildImageUrl, sanitizeCollection } from '../object.util';
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
    totalAmount: Number(booking.totalPrice),
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
    cancelReason: booking.cancelReason ?? null,
    isReview: booking.isReview,
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
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          phoneNumber: user.phoneNumber,
          avatar: buildImageUrl(user.avatar),
        }
      : undefined,
    room: sanitizeRoom(room),
  };
}

export function sanitizeBooking(data: any) {
  return sanitizeCollection(data, sanitize);
}
