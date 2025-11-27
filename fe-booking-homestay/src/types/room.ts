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
  isMain: boolean;
  position: number;
}

export interface RoomImages {
  main?: string | null;
  gallery: RoomImage[];
}

export interface RoomLocation {
  country: string;
  countryId: number;
  province: string;
  provinceId: number;
  district: string;
  districtId: number;
  ward: string;
  wardId: number;
  street: string;
  fullAddress: string;
}

export interface UserRoom {
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
  host: UserRoom;
  images: RoomImages;
  beds: Bed[];
  amenities: Amenity[];
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
  provinceId: number;
  districtId: number;
  wardId: number;
  street: string;
}

export interface UpdateRoomDto extends Partial<CreateRoomDto> {}

export interface Amenity {
  id: number;
  name: string;
  description: string;
  category: string;
}

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
