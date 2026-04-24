import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { bookings_status } from '@prisma/client';
import {
  eachDayOfInterval,
  endOfDay,
  format,
  startOfDay,
  subDays,
} from 'date-fns';
import { ADMIN_EMAIL } from 'src/common/constant/app.constant';
import { AvailabilityHelper } from 'src/helpers/availability.helper';
import { LoyaltyProgram } from 'src/helpers/loyalty.helper';
import { PricingHelper } from 'src/helpers/pricing.helper';
import { ensureDateRange, nightsBetween } from 'src/utils/date.util';
import { sanitizeBooking } from 'src/utils/sanitize/booking.sanitize';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ListBookingQuery } from './dto/list-booking.query';
import { PreCheckDto } from './dto/preCheck-booking.dto';
import { RoomAvailabilityDto } from './dto/room-availability.dto';

@Injectable()
export class BookingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pricing: PricingHelper,
    private readonly availability: AvailabilityHelper,
    private readonly loyaltyProgram: LoyaltyProgram,
    private readonly mailService: MailService,
  ) {}

  async changeBookingStatus(
    bookingId: number,
    newStatus: bookings_status,
    options?: {
      reason?: string;
      allowOverride?: boolean;
      notifyUser?: boolean;
      notifyAdmin?: boolean;
      paidAmount?: number;
    },
  ) {
    const booking = await this.prisma.bookings.findUnique({
      where: { id: bookingId },
      include: { rooms: true },
    });

    if (!booking) throw new NotFoundException('Không tìm thấy booking');

    const current = booking.status;
    const allowOverride = options?.allowOverride ?? false;

    if (!allowOverride) {
      const validTransitions: Record<bookings_status, bookings_status[]> = {
        PENDING: ['PARTIALLY_PAID', 'CONFIRMED', 'CANCELLED'],
        PARTIALLY_PAID: ['CONFIRMED', 'CANCELLED', 'WAITING_REFUND'],
        CONFIRMED: ['CHECKED_IN', 'CANCELLED', 'WAITING_REFUND'],
        CHECKED_IN: ['CHECKED_OUT', 'CANCELLED'],
        CHECKED_OUT: [],
        CANCELLED: [],
        WAITING_REFUND: ['REFUNDED'],
        REFUNDED: [],
      };

      if (!validTransitions[current].includes(newStatus)) {
        throw new BadRequestException(
          `Không thể chuyển trạng thái từ ${current} sang ${newStatus}`,
        );
      }
    }

    const updated = await this.prisma.bookings.update({
      where: { id: bookingId },
      data: {
        status: newStatus,
        cancelReason: options?.reason ?? null,
        paidAmount:
          newStatus === 'CHECKED_OUT'
            ? booking.totalPrice
            : (options?.paidAmount ?? booking.paidAmount),
        updatedAt: new Date(),
      },
      include: { rooms: true },
    });

    if (newStatus === 'CHECKED_OUT') {
      await this.loyaltyProgram.recalculateLoyaltyLevel(updated.userId);
    }

    type BookingMailType =
      | 'BOOKING_PENDING'
      | 'BOOKING_CONFIRMED'
      | 'BOOKING_CANCELLED'
      | 'BOOKING_PARTIALLY_PAID'
      | 'BOOKING_REFUNDED'
      | 'BOOKING_CHECKED_IN'
      | 'BOOKING_CHECKED_OUT'
      | 'BOOKING_WAITING_REFUND';

    const mailMap: Partial<Record<bookings_status, BookingMailType>> = {
      PENDING: 'BOOKING_PENDING',
      PARTIALLY_PAID: 'BOOKING_PARTIALLY_PAID',
      CONFIRMED: 'BOOKING_CONFIRMED',
      CANCELLED: 'BOOKING_CANCELLED',
      WAITING_REFUND: 'BOOKING_WAITING_REFUND',
      REFUNDED: 'BOOKING_REFUNDED',
      CHECKED_IN: 'BOOKING_CHECKED_IN',
      CHECKED_OUT: 'BOOKING_CHECKED_OUT',
    };

    const mailType = mailMap[newStatus];
    const notifyUser = options?.notifyUser ?? true;
    const notifyAdmin = options?.notifyAdmin ?? true;

    const isWaitingRefund = newStatus === 'WAITING_REFUND';

    if (mailType) {
      if (notifyUser && !isWaitingRefund) {
        this.mailService
          .sendBookingMail(
            updated.guestEmail,
            mailType as BookingMailType,
            updated,
          )
          .catch((err) => console.error('Email user error:', err));
      }
    }

    if (mailType && notifyAdmin) {
      this.mailService
        .sendBookingMail(ADMIN_EMAIL, mailType as BookingMailType, updated)
        .catch((err) => console.error('Email admin error:', err));
    }

    return updated;
  }

  private determineCancelFinalStatus(paidAmount: number) {
    const isPaid = paidAmount > 0;

    return isPaid
      ? {
          finalStatus: bookings_status.WAITING_REFUND,
          message:
            'Booking đã được chuyển sang WAITING_REFUND. Vui lòng hoàn tiền cho khách.',
        }
      : {
          finalStatus: bookings_status.CANCELLED,
          message: 'Booking hủy thành công. Không có khoản thanh toán nào.',
        };
  }

  async previewBooking(userId: number, dto: PreCheckDto) {
    const { roomId, checkIn, checkOut } = dto;
    const { inDate, outDate } = ensureDateRange(checkIn, checkOut);

    const room = await this.prisma.rooms.findFirst({
      where: { id: roomId, isDeleted: false },
      select: { id: true, price: true, name: true },
    });
    if (!room) throw new NotFoundException('Phòng không tồn tại');

    const isOccupied = await this.availability.hasOverlap(
      roomId,
      inDate,
      outDate,
    );

    const rawTotal = await this.pricing.priceForRange(
      roomId,
      Number(room.price),
      inDate,
      outDate,
    );

    const loyaltyInfo = await this.pricing.applyLoyaltyDiscount(
      userId,
      rawTotal,
    );

    const nights = nightsBetween(inDate, outDate);

    return {
      available: !isOccupied,
      roomName: room.name,
      stayDetails: {
        checkIn: inDate,
        checkOut: outDate,
        nights,
      },
      priceSummary: {
        averagePricePerNight: Math.round(rawTotal / nights),
        rawTotal,
        discountAmount: loyaltyInfo.discountAmount,
        totalPrice: loyaltyInfo.totalPrice,
        tierName: loyaltyInfo.tierName,
        discountPercent: loyaltyInfo.discountPercent,
      },
      message: isOccupied
        ? 'Phòng đã có người đặt trong khoảng thời gian này'
        : 'Phòng trống, bạn có thể tiếp tục đặt phòng',
    };
  }

  async create(userId: number, dto: CreateBookingDto) {
    const {
      roomId,
      checkIn,
      checkOut,
      adults = 1,
      children = 0,
      guestFullName,
      guestEmail,
      guestPhoneNumber,
      specialRequest,
      paymentMethod,
    } = dto;

    const { inDate, outDate } = ensureDateRange(checkIn, checkOut);

    const room = await this.prisma.rooms.findFirst({
      where: { id: roomId, isDeleted: false },
      select: {
        id: true,
        price: true,
        adultCapacity: true,
        childCapacity: true,
      },
    });
    if (!room) throw new BadRequestException('Phòng không tồn tại');
    if (adults > room.adultCapacity || children > room.childCapacity)
      throw new BadRequestException('Vượt quá sức chứa phòng');

    /* =========================================================================================
     * [GIẢI PHÁP TỐI ƯU CHO 2 KỊCH BẢN RỦI RO CAO]
     * Thay vì phải thay đổi Database Schema để thêm Cột (như `idempotencyKey`), giải pháp này
     * tận dụng tối đa Database Transaction và cơ chế Khóa bi quan (Pessimistic Locking) của DB
     * để xử lý gọn gàng và toàn vẹn cả 2 kịch bản cùng một lúc. Phù hợp nhất cho hệ thống này
     * vì nó dễ maintain, không sinh ra chi phí truy vấn thừa và không làm thay đổi core tables.
     * ========================================================================================= */
    const booking = await this.prisma.$transaction(async (tx) => {
      /*
       * KỊCH BẢN 1: RACE CONDITION (2 người cùng click đặt 1 phòng ở cùng 1 phần nghìn giây)
       * - BIỆN PHÁP: Pessimistic Locking qua câu lệnh `SELECT ... FOR UPDATE` chặn trực tiếp.
       * - CÁCH HOẠT ĐỘNG: Nó sẽ khoá ĐÚNG 1 ROW (1 phòng) duy nhất đang được truy vấn.
       *   Nếu khách A và khách B cùng ấn đặt, DB sẽ ép RQ của B chờ RQ của A chạy hết transaction này.
       *   Khi A commit xong (nhả khóa), B mới được vào và quét xem còn phòng không.
       *   -> Tránh 100% việc đặt trùng đè lên nhau, trong khi mọi phòng khác vẫn book song song bình thường!
       */
      await tx.$queryRaw`SELECT id FROM rooms WHERE id = ${roomId} FOR UPDATE`;

      // Sau khi vào được khoá ưu tiên độc quyền, mới quét kiểm tra xem bị lấp lịch chưa
      const activeStatuses: any[] = [
        'PENDING',
        'PARTIALLY_PAID',
        'CONFIRMED',
        'CHECKED_IN',
        'WAITING_REFUND',
      ];
      const overlap = await tx.bookings.findFirst({
        where: {
          roomId,
          isDeleted: false,
          status: { in: activeStatuses },
          checkIn: { lt: outDate },
          checkOut: { gt: inDate },
        },
      });

      if (overlap) {
        /*
         * KỊCH BẢN 2: CLIENT RETRY / DOUBLE SUBMIT (Mạng lag giật, ng dùng ấn nút Đặt quá 2 lần)
         * - BIỆN PHÁP: Bẫy suy luận thời gian (Time-based Deduction Setup) bên trong khu vực Lock.
         * - CÁCH HOẠT ĐỘNG: Khi network nghẽn, app gửi đi 2 request giống y hệt nhau.
         *   Nhờ có FOR UPDATE ở trên, RQ1 và RQ2 bị bắt xếp hàng. RQ1 chạy mượt và tạo Booking.
         *   Khi RQ2 chạy, nó sẽ thấy "overlap" có tồn tại (vì RQ1 vừa tạo ngay trước đó).
         *   Thay vì báo lỗi văng app, ta check xem overlap này có phải của ĐÚNG USER ĐÓ
         *   và mới vừa tạo trong dạo gần đây không (5 phút). Nếu đúng -> Đây là request dư thừa do lag.
         *   => Server êm đẹp TRẢ VỀ CÁI OVERLAP ĐÓ luôn (Coi như success mà k tạo dư CSDL).
         */
        if (overlap.userId === userId) {
          const timeDiff =
            new Date().getTime() - new Date(overlap.createdAt).getTime();
          if (timeDiff < 5 * 60 * 1000) {
            // 5 phút
            return overlap;
          }
        }

        // Nếu trùng nhưng khác user (hoặc do tạo quá lâu rồi) -> Đây rành rành là bị cướp lịch -> Từ chối hợp lệ!
        throw new BadRequestException(
          'Khoảng ngày đã có người giữ hoặc bị khóa',
        );
      }

      // 3. Kiểm tra ngày bị khóa thủ công (Room Availability)
      const blockedDate = await tx.room_availability.findFirst({
        where: {
          roomId,
          isAvailable: false,
          date: { gte: inDate, lt: outDate },
        },
      });
      if (blockedDate) {
        throw new BadRequestException('Khoảng ngày này đã bị khóa bởi Host');
      }

      // 4. Tính toán giá
      const rawTotal = await this.pricing.priceForRange(
        roomId,
        Number(room.price),
        inDate,
        outDate,
      );
      const { totalPrice, discountAmount } =
        await this.pricing.applyLoyaltyDiscount(userId, rawTotal);

      // 5. Tạo booking
      return tx.bookings.create({
        data: {
          userId,
          roomId,
          guestFullName,
          guestEmail,
          guestPhoneNumber,
          specialRequest: specialRequest ?? null,
          checkIn: inDate,
          checkOut: outDate,
          adults,
          children,
          rawTotalPrice: rawTotal,
          discountAmount,
          totalPrice,
          status: 'PENDING',
          paymentMethod,
          paidAmount: 0,
        },
        include: { rooms: { include: { room_images: true } } },
      });
    });

    // Nếu đây là Double Submit trả về booking cũ, bỏ qua gửi mail lại
    if (booking.createdAt.getTime() < new Date().getTime() - 10000) {
      return {
        message: 'Đơn đặt đã tồn tại',
        booking: sanitizeBooking(booking),
      };
    }

    await this.mailService.sendBookingMail(
      booking.guestEmail,
      'BOOKING_PENDING',
      booking,
    );
    await this.mailService.sendBookingMail(
      ADMIN_EMAIL,
      'BOOKING_PENDING',
      booking,
    );

    return {
      message: 'Tạo đơn đặt thành công',
      booking: sanitizeBooking(booking),
    };
  }

  async listMine(userId: number, q: ListBookingQuery) {
    const { page = 1, pageSize = 12, sortOrder = 'desc' } = q;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.bookings.findMany({
        where: { userId },
        orderBy: { createdAt: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          rooms: {
            include: {
              location_provinces: true,
              location_wards: true,
              room_images: true,
              room_amenities: { include: { amenities: true } },
              room_beds: true,
              users: true,
            },
          },
          users: true,
          reviews: true,
        },
      }),
      this.prisma.bookings.count({ where: { userId } }),
    ]);

    return {
      page,
      pageSize,
      total,
      items: sanitizeBooking(items),
    };
  }

  async detail(id: number, requesterId?: number | null, role?: string | null) {
    const booking = await this.prisma.bookings.findUnique({
      where: { id },
      include: {
        rooms: { include: { room_images: true, users: true } },
        users: true,
        reviews: true,
      },
    });
    if (!booking) throw new NotFoundException('Không tìm thấy booking');
    if (role !== 'ADMIN' && requesterId && booking.userId !== requesterId) {
      throw new ForbiddenException('Bạn không có quyền xem booking này');
    }
    return sanitizeBooking(booking);
  }

  async listAll(q: ListBookingQuery) {
    const { page = 1, pageSize = 12, sortOrder = 'desc' } = q;
    const skip = (page - 1) * pageSize;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.bookings.findMany({
        where: {},
        orderBy: { updatedAt: sortOrder },
        skip,
        take: pageSize,
        include: {
          rooms: { include: { room_images: true, users: true } },
          users: true,
        },
      }),
      this.prisma.bookings.count(),
    ]);

    return {
      page,
      pageSize,
      total,
      items: sanitizeBooking(items),
    };
  }

  async roomAvailability(roomId: number, q: RoomAvailabilityDto) {
    const { inDate, outDate } = ensureDateRange(q.checkIn, q.checkOut);

    const room = await this.prisma.rooms.findFirst({
      where: { id: roomId, isDeleted: false },
      select: { id: true, price: true },
    });
    if (!room)
      throw new NotFoundException('Phòng không tồn tại hoặc đã bị xóa');

    const isOccupied = await this.availability.hasOverlap(
      roomId,
      inDate,
      outDate,
    );

    let totalAmount: number | null = null;
    if (!isOccupied) {
      totalAmount = await this.pricing.priceForRange(
        roomId,
        Number(room.price),
        inDate,
        outDate,
      );
    }

    return {
      roomId,
      available: !isOccupied,
      totalAmount,
    };
  }

  async listByRoom(roomId: number) {
    const items = await this.prisma.bookings.findMany({
      where: { roomId },
      // include: { rooms: { include: { room_images: true } }, users: true },
      orderBy: { createdAt: 'desc' },
      include: { users: true },
    });
    return sanitizeBooking(items);
  }

  async getUnavailableDays(roomId: number) {
    if (!roomId) throw new BadRequestException('Thiếu roomId');

    const today = startOfDay(new Date());
    const activeStatuses: bookings_status[] = [
      'PENDING',
      'PARTIALLY_PAID',
      'CONFIRMED',
      'CHECKED_IN',
      'WAITING_REFUND',
    ];

    const [bookings, blocked] = await Promise.all([
      this.prisma.bookings.findMany({
        where: {
          roomId,
          isDeleted: false,
          status: { in: activeStatuses },
          checkOut: { gt: today },
        },
        select: { checkIn: true, checkOut: true },
      }),
      this.prisma.room_availability.findMany({
        where: {
          roomId,
          isAvailable: false,
          date: { gte: today },
        },
        select: { date: true },
      }),
    ]);

    const unavailableSet = new Set<string>();

    for (const b of bookings) {
      const start = b.checkIn < today ? today : startOfDay(b.checkIn);
      const end = startOfDay(subDays(b.checkOut, 1));

      if (start <= end) {
        const range = eachDayOfInterval({ start, end });
        range.forEach((d) => {
          unavailableSet.add(format(d, 'yyyy-MM-dd'));
        });
      }
    }

    blocked.forEach((b) => {
      unavailableSet.add(format(b.date, 'yyyy-MM-dd'));
    });

    const sortedDays = Array.from(unavailableSet).sort();

    return {
      message: 'Danh sách ngày không khả dụng của phòng',
      roomId,
      total: sortedDays.length,
      days: sortedDays,
    };
  }

  async cancel(
    id: number,
    requesterId: number,
    role: string,
    dto: CancelBookingDto,
  ) {
    const booking = await this.prisma.bookings.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('Không tìm thấy booking');

    if (role !== 'ADMIN' && booking.userId !== requesterId)
      throw new ForbiddenException('Bạn không có quyền hủy booking này');

    if (!['PENDING', 'PARTIALLY_PAID', 'CONFIRMED'].includes(booking.status))
      throw new BadRequestException(
        'Chỉ được hủy khi booking đang PENDING, PARTIALLY_PAID hoặc CONFIRMED',
      );

    if (new Date() >= booking.checkIn)
      throw new BadRequestException('Không thể hủy khi đã đến ngày check-in');

    const { finalStatus, message } = this.determineCancelFinalStatus(
      booking.paidAmount.toNumber(),
    );

    const updated = await this.changeBookingStatus(id, finalStatus, {
      reason: dto.reason,
    });

    return {
      message,
      booking: sanitizeBooking(updated),
    };
  }

  async updateStatus(orderId: number, paidAmount: number) {
    const booking = await this.prisma.bookings.findUnique({
      where: { id: orderId },
    });

    if (!booking) throw new NotFoundException();

    const newPaidAmount = Number(booking.paidAmount) + paidAmount;
    const total = Number(booking.totalPrice);
    let newStatus: bookings_status = booking.status;

    if (newPaidAmount > 0 && newPaidAmount < total) {
      newStatus = bookings_status.PARTIALLY_PAID;
    } else if (newPaidAmount >= total) {
      newStatus = bookings_status.CONFIRMED;
    }

    return this.changeBookingStatus(orderId, newStatus, {
      allowOverride: true,
      paidAmount: newPaidAmount,
    });
  }

  async listByUser(userId: number) {
    const items = await this.prisma.bookings.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: { rooms: { include: { room_images: true } }, users: true },
    });
    return sanitizeBooking(items);
  }

  async adminAcceptBooking(bookingId: number, dto: { paidAmount: number }) {
    const updated = await this.changeBookingStatus(bookingId, 'CONFIRMED', {
      allowOverride: true,
      paidAmount: dto.paidAmount,
    });
    return {
      message: 'Admin đã duyệt đơn',
      booking: sanitizeBooking(updated),
    };
  }

  async adminRejectBooking(bookingId: number, dto: CancelBookingDto) {
    const booking = await this.prisma.bookings.findUnique({
      where: { id: bookingId },
    });
    if (!booking) throw new NotFoundException('Không tìm thấy booking');

    const { finalStatus, message } = this.determineCancelFinalStatus(
      booking.paidAmount.toNumber(),
    );

    const updated = await this.changeBookingStatus(bookingId, finalStatus, {
      reason: dto.reason,
    });

    return {
      message,
      booking: sanitizeBooking(updated),
    };
  }

  async adminCancelBooking(bookingId: number, dto: CancelBookingDto) {
    const booking = await this.prisma.bookings.findUnique({
      where: { id: bookingId },
    });
    if (!booking) throw new NotFoundException('Không tìm thấy booking');

    const { finalStatus } = this.determineCancelFinalStatus(
      booking.paidAmount.toNumber(),
    );

    const updated = await this.changeBookingStatus(bookingId, finalStatus, {
      reason: dto.reason || 'Admin chủ động huỷ đơn',
      allowOverride: true,
    });

    return {
      message: 'Đã huỷ đơn thành công',
      booking: sanitizeBooking(updated),
    };
  }
}
