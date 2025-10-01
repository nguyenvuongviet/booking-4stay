import { CLOUDINARY_BASE_URL } from 'src/common/constant/app.constant';
import { omitFields } from 'src/utils/object';

const ROOM_SENSITIVE_FIELDS = [
  'deletedBy',
  'isDeleted',
  'deletedAt',
  'createdAt',
  'updatedAt',
  'hostId',
];

function buildRoomImageUrl(image: string): string {
  if (!image) return '';

  return `${CLOUDINARY_BASE_URL}/${image}.jpg`;
}

function sanitizeRoom(room: any) {
  if (!room) return null;

  const clone = omitFields(room, ROOM_SENSITIVE_FIELDS);

  clone.location = {
    lat: room.locationLat,
    lng: room.locationLng,
  };

  if (room.room_amenities) {
    clone.amenities = room.room_amenities.map((r: any) => ({
      id: r.amenities.id,
      name: r.amenities.name,
      description: r.amenities.description,
    }));
    delete clone.room_amenities;
  }

  if (room.room_images) {
    clone.images = {
      main:
        room.room_images.find((img: any) => img.isMain)?.imageUrl &&
        buildRoomImageUrl(
          room.room_images.find((img: any) => img.isMain).imageUrl,
        ),
      others: room.room_images
        .filter((img: any) => !img.isMain)
        .map((img: any) => buildRoomImageUrl(img.imageUrl)),
    };
    delete clone.room_images;
  }

  return clone;
}

export function sanitizeRoomData(data: any): any {
  if (!data) return null;
  return Array.isArray(data) ? data.map(sanitizeRoom) : sanitizeRoom(data);
}

