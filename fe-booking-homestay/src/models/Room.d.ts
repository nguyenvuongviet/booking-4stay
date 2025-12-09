export interface RoomImage {
  id: number;
  url: string;
  isMain: boolean;
}

export interface Room {
  id: string | number;
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
  amenities?: Amenity[];
  status?: "Available" | "Sold out";
}
