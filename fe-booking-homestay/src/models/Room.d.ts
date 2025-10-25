export interface RoomImage {
  id: number;
  url: string;
  isMain: boolean;
}

export interface Room {
  id: string;
  name: string;
  description?: string;
  price: number;
  adultCapacity: number;
  childCapacity?: number;
  location: {
    id: string;
    fullAddress?: string;
    province?: string;
  };
  rating?: number;
  images?: {
    main: string;
    gallery: RoomImage[];
  };
  amenities?: Amenity[];
}
