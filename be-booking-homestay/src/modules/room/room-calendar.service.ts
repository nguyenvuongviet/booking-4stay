import { Injectable, NotFoundException } from '@nestjs/common';
import { bookings_status } from '@prisma/client';
import { eachDayOfInterval, endOfMonth, format, startOfMonth } from 'date-fns';
import { ACTIVE_BOOKING_STATUSES } from '../booking/booking.constants';
import { PrismaService } from '../prisma/prisma.service';
import { RoomHelper } from './room.helpers';
import {
  RoomCalendarQueryDto,
  UpdateCalendarItemDto,
} from './dto/room-calendar.dto';

@Injectable()
export class RoomCalendarService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly roomHelper: RoomHelper,
  ) {}

  async getCalendar(roomId: number, query: RoomCalendarQueryDto) {
    const room = await this.prisma.rooms.findFirst({
      where: { id: roomId, isDeleted: false },
      select: { price: true, name: true },
    });
    if (!room) throw new NotFoundException('Phòng không tồn tại');

    const now = new Date();
    const m = query.month ? query.month - 1 : now.getMonth();
    const y = query.year || now.getFullYear();

    const startDate = startOfMonth(new Date(y, m, 1));
    const endDate = endOfMonth(startDate);

    const [prices, availability, bookings] = await Promise.all([
      this.prisma.room_prices.findMany({
        where: { roomId, date: { gte: startDate, lte: endDate } },
      }),
      this.prisma.room_availability.findMany({
        where: { roomId, date: { gte: startDate, lte: endDate } },
      }),
      this.prisma.bookings.findMany({
        where: {
          roomId,
          isDeleted: false,
          status: {
            in: [...ACTIVE_BOOKING_STATUSES, bookings_status.CHECKED_OUT],
          },
          checkOut: { gt: startDate },
          checkIn: { lte: endDate },
        },
        select: { checkIn: true, checkOut: true, guestFullName: true },
      }),
    ]);

    const priceMap = new Map<string, number>();
    prices.forEach((p) =>
      priceMap.set(format(p.date, 'yyyy-MM-dd'), Number(p.price)),
    );

    const availMap = new Map<string, boolean>();
    availability.forEach((a) =>
      availMap.set(format(a.date, 'yyyy-MM-dd'), a.isAvailable),
    );

    const calendar: any[] = [];
    const interval = eachDayOfInterval({ start: startDate, end: endDate });

    for (const day of interval) {
      const dateStr = format(day, 'yyyy-MM-dd');

      let status = 'AVAILABLE';
      let bookingDetails: { guestName: string } | null = null;

      if (availMap.has(dateStr) && availMap.get(dateStr) === false) {
        status = 'BLOCKED';
      }
      const overlappingBooking = bookings.find((b) => {
        const inStr = format(b.checkIn, 'yyyy-MM-dd');
        const outStr = format(b.checkOut, 'yyyy-MM-dd');
        return dateStr >= inStr && dateStr < outStr;
      });

      if (overlappingBooking) {
        status = 'BOOKED';
        bookingDetails = { guestName: overlappingBooking.guestFullName };
      }

      calendar.push({
        date: dateStr,
        price: priceMap.get(dateStr) ?? Number(room.price),
        status,
        bookingDetails,
      });
    }

    return {
      roomId,
      roomName: room.name,
      month: m + 1,
      year: y,
      calendar,
    };
  }

  async updateCalendar(roomId: number, updates: UpdateCalendarItemDto[]) {
    await this.roomHelper.ensureRoomExists(roomId);

    if (!updates || updates.length === 0)
      return { message: 'Không có dữ liệu cập nhật' };

    const priceUpdates = updates.filter((u) => u.price !== undefined);
    const availUpdates = updates.filter((u) => u.isAvailable !== undefined);

    await this.prisma.$transaction(async (tx) => {
      if (priceUpdates.length > 0) {
        const priceDates = priceUpdates.map((u) => new Date(u.date));
        await tx.room_prices.deleteMany({
          where: { roomId, date: { in: priceDates } },
        });
        await tx.room_prices.createMany({
          data: priceUpdates.map((u) => ({
            roomId,
            date: new Date(u.date),
            price: u.price!,
          })),
        });
      }

      if (availUpdates.length > 0) {
        const availDates = availUpdates.map((u) => new Date(u.date));
        await tx.room_availability.deleteMany({
          where: { roomId, date: { in: availDates } },
        });
        await tx.room_availability.createMany({
          data: availUpdates.map((u) => ({
            roomId,
            date: new Date(u.date),
            isAvailable: u.isAvailable!,
          })),
        });
      }
    });

    return {
      message: 'Cập nhật lịch phòng thành công',
      updatedPrices: priceUpdates.length,
      updatedAvailability: availUpdates.length,
    };
  }
}
