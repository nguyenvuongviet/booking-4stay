export interface IUser {
  id: number;
  email: string;
  fullName: string;
  password: string;
  avatar?: string;
  phoneNumber?: string;
  gender?: string;
  dateOfBirth?: string;
  country?: string;
  role?: number; // 0 - user, 1 - admin
  createdAt?: string;
  updatedAt?: string;
}
