import { BadRequestException } from '@nestjs/common';
import { differenceInDays } from 'date-fns';
import { toUTCMidnight } from './timezone.util';

export function toISODate(input: Date | string): string {
  if (typeof input === 'string') {
    return input.split('T')[0];
  }
  return toUTCMidnight(input).toISOString().split('T')[0];
}

export function getStartOfDayUTC(input: string | Date): Date {
  return toUTCMidnight(input);
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
