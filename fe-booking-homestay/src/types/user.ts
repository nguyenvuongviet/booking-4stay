export type Role = "USER" | "ADMIN" | "HOST" | string;

export interface User {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
  phoneNumber: string | null;
  country: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  roles: Role[];
  loyaltyLevel: string | null;
  provider: "LOCAL" | string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
}

export type CreateUserDto = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  country: string;
  roleName?: Role;
};

export type UpdateUserDto = {
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  country?: string | null;
  roleName?: Role;
  dateOfBirth?: string | null;
  gender?: "MALE" | "FEMALE" | "OTHER" | string;
  isActive?: boolean;
};
