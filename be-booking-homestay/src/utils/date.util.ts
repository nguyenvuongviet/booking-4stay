import { BadRequestException } from '@nestjs/common';

export function ensureDateRange(checkIn: string, checkOut: string) {
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  if (!(inDate < outDate))
    throw new BadRequestException('Khoảng ngày không hợp lệ');
  return { inDate, outDate };
}

export function* eachDate(inDate: Date, outDate: Date) {
  const d = new Date(inDate);
  while (d < outDate) {
    yield new Date(d);
    d.setDate(d.getDate() + 1);
  }
}

export function nightsBetween(inDate: Date, outDate: Date) {
  return Math.ceil((+outDate - +inDate) / (1000 * 60 * 60 * 24));
}
