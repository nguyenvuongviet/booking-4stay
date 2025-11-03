export enum BedType {
  SINGLE = "SINGLE",
  DOUBLE = "DOUBLE",
  QUEEN = "QUEEN",
  KING = "KING",
  SOFA_BED = "SOFA_BED",
  BUNK_BED = "BUNK_BED",
}

export interface Amenity {
  id: number;
  name: string;
  category: string;
}

export interface Bed {
  type: BedType;
  quantity: number;
}

export interface RoomImage {
  id: number;
  url: string;
}

export interface RoomImages {
  main?: string | null;
  gallery: RoomImage[];
}

export interface RoomLocation {
  province: string;
  district: string;
  ward: string;
  street: string;
  fullAddress: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  avatar: string | null;
}

export interface Room {
  id: number;
  name: string;
  description: string;
  price: number;
  adultCapacity: number;
  childCapacity?: number | null;
  rating?: number;
  reviewCount?: number;
  status: "AVAILABLE" | "BOOKED" | "MAINTENANCE" | string;

  location: RoomLocation;
  host: User;
  images: RoomImages;
  beds: Bed[];
  amenities: Amenity[];
}

export interface Booking {
  id: number;
  user: User;
  adults: number;
  children: number;
  checkIn: string;
  checkOut: string;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "CHECKED_IN"
    | "CHECKED_OUT"
    | "CANCELLED"
    | "REFUNDED";
  totalAmount?: number | null;
  cancelReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
    avatar?: string | null;
  };
}

export interface PaginatedRooms {
  message: string;
  page: number;
  pageSize: number;
  total: number;
  items: Room[];
}

export interface CreateRoomDto {
  name: string;
  description?: string;
  price: number;
  adultCapacity: number;
  childCapacity?: number;
  locationId: number;
}

export interface UpdateRoomDto extends Partial<CreateRoomDto> {}

export interface SetRoomAmenitiesDto {
  amenityIds: number[];
}

export interface BedItemDto {
  type: BedType;
  quantity: number;
}

export interface SetRoomBedsDto {
  beds: BedItemDto[];
}

// export interface ImageItemDto {
//   isMain?: boolean;
// }

// export interface DeleteRoomImagesDto {
//   imageIds: number[];
// }
