// types/calendar.ts
export type DayStatus = "available" | "booked" | "blocked";

export type RoomPrice = {
  date: string; // YYYY-MM-DD
  price?: number;
  status?: DayStatus;
  note?: string;
};

export type DayCell = {
  date: Date;
  currentMonth: boolean;
};