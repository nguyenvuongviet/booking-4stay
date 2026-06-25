export interface Destination {
  id: number;
  name: string;
  country: string;
  image: string;
}

export interface PopularDestination {
  id: number;
  name: string;
  imageUrl: string | null;
  roomCount: number;
  bookingCount: number;
  avgRating: number;
  popularityScore: number;
}