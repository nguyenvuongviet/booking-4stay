import { loyalty_program } from "@prisma/client";
export interface IUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  avatar?: string;
  phoneNumber: string;
  gender?: string;
  dateOfBirth?: string;
  country?: string;
  role?: number; // 0 - user, 1 - admin
  createdAt?: string;
  updatedAt?: string;
  loyalty_program: {
    totalBooking: number;
    totalPoint: number;
    levels: {
      description: string;
      name: string;
    };
  };
}
