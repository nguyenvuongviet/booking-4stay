import { BadRequestException } from '@nestjs/common';
import { differenceInDays, startOfDay } from 'date-fns';

export function ensureDateRange(checkIn: string, checkOut: string) {
  const inDate = startOfDay(new Date(checkIn));
  const outDate = startOfDay(new Date(checkOut));

  if (inDate >= outDate) {
    throw new BadRequestException('Ngày nhận phòng phải trước ngày trả phòng');
  }
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
  return differenceInDays(outDate, inDate);
}
