import { Room } from "./Room";

interface User {
  id: string | number;
  name: string;
  email: string;  
  avatar: string;
}

export interface Booking {
  id: number | string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "CHECKED_OUT" ;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  totalAmount: number | 0;
  createdAt: string;
  updatedAt: string;
  cancelReason: string | null;
  user: User;
  room: Room;
}
