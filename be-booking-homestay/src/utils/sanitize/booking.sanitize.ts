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
    totalAmount: Number(booking.totalAmount),
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
    cancelReason: booking.cancelReason ?? null,

    user: user
      ? {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          avatar: buildImageUrl(user.avatar),
        }
      : undefined,

    room: sanitizeRoom(room),
  };
}

export function sanitizeBooking(data: any) {
  return sanitizeCollection(data, sanitize);
}
