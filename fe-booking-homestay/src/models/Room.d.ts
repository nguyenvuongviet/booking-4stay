export interface RoomImage {
  id: number;
  url: string;
  isMain: boolean;
}

export interface Room {
  id: number;
  name: string;
  description?: string;
  price: number;
  adultCapacity: number;
  childCapacity?: number;
  location: {
    id?: string;
    fullAddress?: string;
    province?: string;
    latitude?: string | number;
    longitude?: string | number;
  };
  rating?: number;
  reviewCount: number;
  images?: {
    main: string;
    gallery: RoomImage[];
  };
  room_images?: {
    id: number;
    imageUrl: string;
    isMain: boolean;
  }[];
  amenities?: Amenity[];
  status?: "Available" | "Sold out";
  host?: {
    name: string;
    avatar: string;
    email: string;
    phoneNumber: string;
  };
}
