import { buildImageUrl, sanitizeCollection } from '../object.util';

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

    room: room
      ? {
          id: room.id,
          name: room.name,
          price: Number(room.price),
          rating: Number(room.rating ?? 0),
          reviewCount: room.reviewCount ?? 0,
          location: room.locations
            ? {
                province: room.locations.province,
                district: room.locations.district,
                ward: room.locations.ward,
                street: room.locations.street,
              }
            : undefined,
          images: Array.isArray(room.room_images)
            ? room.room_images
                .sort((a: any, b: any) => (a.position || 0) - (b.position || 0))
                .map((img: any) => ({
                  id: img.id,
                  isMain: !!img.isMain,
                  url: buildImageUrl(img.imageUrl),
                }))
            : [],
        }
      : undefined,
  };
}

export function sanitizeBooking(data: any) {
  return sanitizeCollection(data, sanitize);
}
