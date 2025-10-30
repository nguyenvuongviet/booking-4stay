type Role = "USER" | "ADMIN" | "HOST" | string;

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
