export interface LoyaltyLevel {
  id: string | number;
  name: string;
  minPoints: number;
  description: string;
  isActive: boolean;
}