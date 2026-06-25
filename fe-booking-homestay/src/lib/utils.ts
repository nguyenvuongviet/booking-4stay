import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function parseAbsoluteDate(dateStr: string | Date | null | undefined): Date {
  if (!dateStr) return new Date();
  if (dateStr instanceof Date) return dateStr;
  
  const cleanStr = dateStr.split("T")[0];
  const parts = cleanStr.split("-").map(Number);
  
  if (parts.length !== 3 || parts.some(isNaN)) {
    return new Date(dateStr);
  }
  
  const [year, month, day] = parts;
  return new Date(year, month - 1, day);
}
