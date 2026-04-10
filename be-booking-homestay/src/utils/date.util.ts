import { BadRequestException } from '@nestjs/common';
import { differenceInDays, format } from 'date-fns';

export function toISODate(input: Date | string): string {
  if (typeof input === 'string') {
    return input.split('T')[0];
  }
  return format(input, 'yyyy-MM-dd');
}

export function getStartOfDayUTC(input: string | Date): Date {
  const str = toISODate(input);
  return new Date(`${str}T00:00:00.000Z`);
}

export function getEndOfDayUTC(input: string | Date): Date {
  const str = toISODate(input);
  return new Date(`${str}T23:59:59.999Z`);
}

export function ensureDateRange(
  checkIn: string | Date,
  checkOut: string | Date,
) {
  const inDate = getStartOfDayUTC(checkIn);
  const outDate = getStartOfDayUTC(checkOut);

  if (inDate >= outDate) {
    throw new BadRequestException('Ngày nhận phòng phải trước ngày trả phòng');
  }
  return { inDate, outDate };
}

export function nightsBetween(inDate: Date | string, outDate: Date | string) {
  return differenceInDays(getStartOfDayUTC(outDate), getStartOfDayUTC(inDate));
}
