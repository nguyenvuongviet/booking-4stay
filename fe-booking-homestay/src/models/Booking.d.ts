export interface RoomImage {
  id: number;
  isMain: boolean;
  url: string;
}

export interface Room {
  id: number;
  name: string;
  price: number;
  rating: number;
  reviewCount: number;
  images: RoomImage[];
}

export interface Booking {
  id: number | string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED"; 
  checkIn: string;   
  checkOut: string;  
  adults: number;
  children: number;
  totalAmount: number | 0;
  createdAt: string;
  updatedAt: string;
  cancelReason: string | null;
  room: Room;
}
