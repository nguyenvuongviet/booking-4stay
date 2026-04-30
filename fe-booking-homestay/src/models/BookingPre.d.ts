export interface BookingPre {
  available: boolean;
  message: string;
  priceSummary: {
    averagePricePerNight: number;
    discountAmount: number;
    discountPercent: number;
    rawTotal: number;
    totalPrice: number;
  };
  roomName: string;
  stayDetails: {
    checkIn: Date;
    checkOut: Date;
    nights: number;
  };
}
