import { buildImageUrl, sanitizeCollection } from 'src/utils/object.util';

function sanitize(room: any) {
  if (!room) return null;

  return {
    id: room.id,
    host: room.users
      ? {
          id: room.users.id,
          name: `${room.users.firstName} ${room.users.lastName}`,
          email: room.users.email,
          phoneNumber: room.users.phoneNumber,
          avatar: buildImageUrl(room.users.avatar),
        }
      : null,
    name: room.name,
    description: room.description,
    price: Number(room.price),
    adultCapacity: room.adultCapacity,
    childCapacity: room.childCapacity,
    status: room.status,
    rating: Number(room.rating),
    reviewCount: room.reviewCount,
    location: room.locations
      ? {
          province: room.locations.province,
          district: room.locations.district,
          ward: room.locations.ward,
          street: room.locations.street,
          fullAddress: `${room.locations.street}, ${room.locations.ward}, ${room.locations.district}, ${room.locations.province}`,
          latitude: room.locations.latitude,
          longitude: room.locations.longitude,
        }
      : null,
    images: {
      main: room.room_images?.length
        ? buildImageUrl(
            room.room_images.find((img: any) => img.isMain)?.imageUrl ||
              room.room_images.sort(
                (a: any, b: any) => (a.position || 0) - (b.position || 0),
              )?.[0]?.imageUrl ||
              null,
          )
        : null,
      gallery: room.room_images?.length
        ? [
            ...room.room_images.filter((img: any) => img.isMain),
            ...room.room_images
              .filter((img: any) => !img.isMain)
              .sort((a: any, b: any) => (a.position || 0) - (b.position || 0)),
          ].map((img: any) => ({
            id: img.id,
            url: buildImageUrl(img.imageUrl),
            position: img.position,
            isMain: !!img.isMain,
          }))
        : [],
    },
    amenities: Array.isArray(room.room_amenities)
      ? room.room_amenities.map((ra: any) => ({
          id: ra.amenities?.id,
          name: ra.amenities?.name,
          category: ra.amenities?.category,
        }))
      : [],
    beds: Array.isArray(room.room_beds)
      ? room.room_beds.map((rb: any) => ({
          type: rb.type,
          quantity: rb.quantity,
        }))
      : [],
  };
}

export function sanitizeRoom(data: any) {
  return sanitizeCollection(data, sanitize);
}
