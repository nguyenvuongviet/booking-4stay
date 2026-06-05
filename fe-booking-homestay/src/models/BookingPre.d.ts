export interface BookingPre {
  available: boolean;
  message: string;
  priceSummary: {
    averagePricePerNight: number;
    discountAmount: number;
    discountPercent: number;
    rawTotal: number;
    totalPrice: number;
    couponDiscount?: number;
    couponCode?: string | null;
    couponValid?: boolean;
    couponMessage?: string;
    loyaltyDiscount?: number;
    tierName?: string;
  };
  roomName: string;
  stayDetails: {
    checkIn: Date;
    checkOut: Date;
    nights: number;
  };
}
