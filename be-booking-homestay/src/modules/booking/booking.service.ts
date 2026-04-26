import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { bookings_status } from '@prisma/client';
import { eachDayOfInterval, format, startOfDay, subDays } from 'date-fns';
import { ADMIN_EMAIL } from 'src/common/constant/app.constant';
import { AvailabilityHelper } from 'src/helpers/availability.helper';
import { LoyaltyProgram } from 'src/helpers/loyalty.helper';
import { PricingHelper } from 'src/helpers/pricing.helper';
import { ensureDateRange, nightsBetween } from 'src/utils/date.util';
import { sanitizeBooking } from 'src/utils/sanitize/booking.sanitize';
import { AppConfigsService } from '../app-configs/app-configs.service';
import { AppConfigKey } from '../app-configs/constants/app-config.constant';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../user/dto/enum.dto';
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
    private readonly appConfigsService: AppConfigsService,
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
        [bookings_status.PENDING]: [
          bookings_status.PARTIALLY_PAID,
          bookings_status.CONFIRMED,
          bookings_status.CANCELLED,
        ],
        [bookings_status.PARTIALLY_PAID]: [
          bookings_status.CONFIRMED,
          bookings_status.CANCELLED,
          bookings_status.WAITING_REFUND,
        ],
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

  private async calculateRefundAmount(booking: any) {
    const today = startOfDay(new Date());
    const checkInDate = startOfDay(new Date(booking.checkIn));

    const diffTime = checkInDate.getTime() - today.getTime();
    const daysUntilCheckIn = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    let policy = booking.cancellationPolicy;

    if (!policy || (Array.isArray(policy) && (policy as any[]).length === 0)) {
      const config = await this.prisma.app_configs.findUnique({
        where: { key: AppConfigKey.CANCELLATION_POLICY },
      });
      policy = (config?.value as any[]) || [
        { daysBefore: 0, refundPercent: 0 },
      ];
    }

    const policyArray = Array.isArray(policy) ? [...policy] : [];
    const sortedPolicy = policyArray.sort(
      (a, b) => b.daysBefore - a.daysBefore,
    );

    let refundPercent = 0;
    for (const rule of sortedPolicy) {
      if (daysUntilCheckIn >= rule.daysBefore) {
        refundPercent = Number(rule.refundPercent);
        break;
      }
    }

    const paidAmount = Number(booking.paidAmount);
    const totalPrice = Number(booking.totalPrice);

    const penaltyPercent = 1 - refundPercent;
    const rawPenalty = totalPrice * penaltyPercent;
    const cancellationFee = Math.round(Math.min(rawPenalty, paidAmount));

    const refundAmount = Math.max(0, Math.round(paidAmount - cancellationFee));

    return {
      refundAmount,
      cancellationFee,
      appliedDaysBefore: daysUntilCheckIn,
      refundPercent,
    };
  }

  private determineCancelFinalStatus(paidAmount: number, refundAmount: number) {
    if (refundAmount > 0) {
      return {
        finalStatus: 'WAITING_REFUND' as const,
        message: `Yêu cầu hủy đã được ghi nhận. Số tiền cần hoàn trả: ${refundAmount.toLocaleString()} VNĐ.`,
      };
    }
    return {
      finalStatus: 'CANCELLED' as const,
      message:
        'Đơn hàng đã được hủy thành công. Không có tiền hoàn trả theo chính sách.',
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

    const policyConfig = await this.prisma.app_configs.findUnique({
      where: { key: AppConfigKey.CANCELLATION_POLICY },
    });

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
      cancellationPolicy: policyConfig?.value || [],
      policyUpdatedAt: policyConfig?.updatedAt || null,
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

    const [room, policyConfig, expiryMinutes] = await Promise.all([
      this.prisma.rooms.findFirst({
        where: { id: roomId, isDeleted: false },
        select: {
          id: true,
          price: true,
          adultCapacity: true,
          childCapacity: true,
        },
      }),
      this.prisma.app_configs.findUnique({
        where: { key: AppConfigKey.CANCELLATION_POLICY },
      }),
      this.getExpiryMinutes(),
    ]);

    if (!room) throw new BadRequestException('Phòng không tồn tại');
    if (adults > room.adultCapacity || children > room.childCapacity)
      throw new BadRequestException('Vượt quá sức chứa phòng');

    // 2. KIỂM TRA PHIÊN BẢN CHÍNH SÁCH (Đảm bảo khách hàng đồng ý với chính sách mới nhất)
    if (dto.policyUpdatedAt && policyConfig) {
      const clientDate = new Date(dto.policyUpdatedAt).getTime();
      const serverDate = new Date(policyConfig.updatedAt).getTime();
      if (Math.abs(clientDate - serverDate) > 1000) {
        throw new BadRequestException(
          'Chính sách hủy phòng đã được cập nhật. Vui lòng kiểm tra lại thông tin trước khi xác nhận đặt phòng.',
        );
      }
    }

    // 3. TÍNH TOÁN GIÁ (Tính toán phức tạp nên để ngoài Transaction)
    const rawTotal = await this.pricing.priceForRange(
      roomId,
      Number(room.price),
      inDate,
      outDate,
    );
    const { totalPrice, discountAmount } =
      await this.pricing.applyLoyaltyDiscount(userId, rawTotal);

    // 4. THỰC HIỆN TRANSACTION (Chỉ chứa các thao tác ghi và check trùng)
    const booking = await this.prisma.$transaction(async (tx) => {
      // 4.1. Lock room để chống Race Condition
      await tx.$queryRaw`SELECT id FROM rooms WHERE id = ${roomId} FOR UPDATE`;

      // 4.2. Check Overlap
      const activeStatuses: bookings_status[] = [
        bookings_status.PENDING,
        bookings_status.PARTIALLY_PAID,
        bookings_status.CONFIRMED,
        bookings_status.CHECKED_IN,
        bookings_status.WAITING_REFUND,
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
        // Xử lý Double Submit
        if (overlap.userId === userId) {
          const timeDiff =
            new Date().getTime() - new Date(overlap.createdAt).getTime();
          if (timeDiff < 5 * 60 * 1000) return overlap;
        }
        throw new BadRequestException(
          'Khoảng ngày đã có người giữ hoặc bị khóa',
        );
      }

      // 4.3. Check ngày bị Host khóa thủ công
      const blockedDate = await tx.room_availability.findFirst({
        where: {
          roomId,
          isAvailable: false,
          date: { gte: inDate, lt: outDate },
        },
      });
      if (blockedDate)
        throw new BadRequestException('Khoảng ngày này đã bị khóa bởi Host');

      // 4.4. Tạo Booking
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
          status: bookings_status.PENDING,
          paymentMethod,
          paidAmount: 0,
          cancellationPolicy: policyConfig?.value || [],
          policyUpdatedAt: policyConfig?.updatedAt || new Date(),
        },
        include: { rooms: { include: { room_images: true } } },
      });
    });

    // 4. PHẢN HỒI VÀ CHẠY NGẦM CÁC TÁC VỤ PHỤ
    // Gửi mail không dùng await
    this.mailService
      .sendBookingMail(booking.guestEmail, 'BOOKING_PENDING', booking)
      .catch((e) => console.error('Mail Error:', e));
    this.mailService
      .sendBookingMail(ADMIN_EMAIL, 'BOOKING_PENDING', booking)
      .catch((e) => console.error('Admin Mail Error:', e));

    return {
      message: 'Tạo đơn đặt thành công',
      booking: sanitizeBooking({ ...booking, expiryMinutes }),
    };
  }

  private async getExpiryMinutes() {
    return (
      (await this.appConfigsService.getConfigValue<number>(
        AppConfigKey.BOOKING_EXPIRY_MINUTES,
      )) || 15
    );
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

    const expiryMinutes = await this.getExpiryMinutes();
    return {
      page,
      pageSize,
      total,
      items: sanitizeBooking(items.map((i) => ({ ...i, expiryMinutes }))),
    };
  }

  async detail(id: number, requesterId?: number | null, role?: string | null) {
    const booking = await this.prisma.bookings.findUnique({
      where: { id },
      include: {
        rooms: { include: { room_images: true, users: true } },
        users: true,
        reviews: true,
        logs: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!booking) throw new NotFoundException('Không tìm thấy booking');
    if (role !== Role.ADMIN && requesterId && booking.userId !== requesterId) {
      throw new ForbiddenException('Bạn không có quyền xem booking này');
    }
    const expiryMinutes = await this.getExpiryMinutes();
    return sanitizeBooking({ ...booking, expiryMinutes });
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

  async getUnavailableDays(roomId: number, excludeBookingId?: number) {
    if (!roomId) throw new BadRequestException('Thiếu roomId');

    const today = startOfDay(new Date());
    const activeStatuses: bookings_status[] = [
      bookings_status.PENDING,
      bookings_status.PARTIALLY_PAID,
      bookings_status.CONFIRMED,
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
          ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
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
    return await this.prisma.$transaction(async (tx) => {
      const booking = await tx.bookings.findUnique({
        where: { id },
        include: { rooms: true },
      });
      if (!booking) throw new NotFoundException('Không tìm thấy booking');

      // 1. Kiểm tra quyền
      if (role !== Role.ADMIN && booking.userId !== requesterId)
        throw new ForbiddenException('Bạn không có quyền hủy booking này');

      // 2. Kiểm tra trạng thái có được phép hủy không
      if (
        !(
          [
            bookings_status.PENDING,
            bookings_status.PARTIALLY_PAID,
            bookings_status.CONFIRMED,
          ] as bookings_status[]
        ).includes(booking.status as bookings_status)
      )
        throw new BadRequestException(
          'Chỉ được hủy khi booking đang PENDING, PARTIALLY_PAID hoặc CONFIRMED',
        );

      // 3. Logic mới: Cho phép huỷ phút chót nhưng không hoàn tiền nếu đã đến ngày check-in
      const now = new Date();
      const checkInDate = new Date(booking.checkIn);
      const isLastMinute = now >= checkInDate;

      // 4. Tính toán tiền hoàn & phí phạt
      let { refundAmount, cancellationFee } =
        await this.calculateRefundAmount(booking);

      if (isLastMinute) {
        refundAmount = 0;
        cancellationFee = Number(booking.paidAmount); // Phí phạt chính bằng số tiền đã đóng
      }

      const { finalStatus, message } = this.determineCancelFinalStatus(
        booking.paidAmount.toNumber(),
        refundAmount,
      );

      // 5. Cập nhật Đơn hàng (ATOMIC UPDATE)
      const updated = await tx.bookings.update({
        where: { id },
        data: {
          status: finalStatus,
          cancelReason: dto.reason || 'Khách hàng chủ động hủy',
          refundAmount: refundAmount,
          cancellationFee: cancellationFee,
          bankName: dto.bankName || null,
          bankAccountNumber: dto.bankAccountNumber || null,
          bankAccountName: dto.bankAccountName || null,
          updatedAt: new Date(),
        } as any,
        include: { rooms: true },
      });

      // 6. Ghi Log lịch sử hủy
      await (tx as any).booking_logs.create({
        data: {
          bookingId: id,
          action: 'CANCEL',
          note: `Hủy đơn: Phí phạt ${cancellationFee.toLocaleString()}đ. Hoàn trả ${refundAmount.toLocaleString()}đ. Trạng thái: ${finalStatus}.`,
          performedBy: requesterId,
        },
      });

      // 7. Gửi Mail (Non-blocking)
      this.sendStatusMail(updated, finalStatus).catch(() => {});

      return {
        message,
        booking: sanitizeBooking(updated),
      };
    });
  }

  private async sendStatusMail(booking: any, status: bookings_status) {
    const mailMap: any = {
      [bookings_status.PENDING]: 'BOOKING_PENDING',
      [bookings_status.PARTIALLY_PAID]: 'BOOKING_PARTIALLY_PAID',
      [bookings_status.CONFIRMED]: 'BOOKING_CONFIRMED',
      [bookings_status.CANCELLED]: 'BOOKING_CANCELLED',
      [bookings_status.WAITING_REFUND]: 'BOOKING_WAITING_REFUND',
      [bookings_status.REFUNDED]: 'BOOKING_REFUNDED',
      [bookings_status.CHECKED_IN]: 'BOOKING_CHECKED_IN',
      [bookings_status.CHECKED_OUT]: 'BOOKING_CHECKED_OUT',
    };
    const mailType = mailMap[status];
    if (mailType) {
      await this.mailService
        .sendBookingMail(booking.guestEmail, mailType, booking)
        .catch((err) => console.error('Email error:', err));
      await this.mailService
        .sendBookingMail(ADMIN_EMAIL, mailType, booking)
        .catch((err) => console.error('Admin Email error:', err));
    }
  }

  async updateStatus(orderId: number, paidAmount: number) {
    return await this.prisma.$transaction(async (tx) => {
      const booking = await tx.bookings.findUnique({
        where: { id: orderId },
      });

      if (!booking) throw new NotFoundException();

      const newPaidAmount = Number(booking.paidAmount) + paidAmount;
      const total = Number(booking.totalPrice);
      let newStatus: bookings_status = booking.status as bookings_status;

      if (newPaidAmount > 0 && newPaidAmount < total) {
        newStatus = bookings_status.PARTIALLY_PAID;
      } else if (newPaidAmount >= total) {
        newStatus = bookings_status.CONFIRMED;
      }

      const latestPolicy = await tx.app_configs.findUnique({
        where: { key: AppConfigKey.CANCELLATION_POLICY },
      });

      const updated = await tx.bookings.update({
        where: { id: orderId },
        data: {
          status: newStatus,
          paidAmount: newPaidAmount,
          cancellationPolicy: latestPolicy?.value || booking.cancellationPolicy,
          policyUpdatedAt: latestPolicy?.updatedAt || booking.policyUpdatedAt,
          updatedAt: new Date(),
        } as any,
        include: { rooms: true },
      });

      this.sendStatusMail(updated, newStatus).catch(() => {});

      return updated;
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
    const updated = await this.changeBookingStatus(
      bookingId,
      bookings_status.CONFIRMED,
      {
        allowOverride: true,
        paidAmount: dto.paidAmount,
      },
    );
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

    const { refundAmount } = await this.calculateRefundAmount(booking);

    const { finalStatus, message } = this.determineCancelFinalStatus(
      booking.paidAmount.toNumber(),
      refundAmount,
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

    const { refundAmount } = await this.calculateRefundAmount(booking);

    const { finalStatus } = this.determineCancelFinalStatus(
      booking.paidAmount.toNumber(),
      refundAmount,
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

  async adminConfirmRefund(
    id: number,
    refundAmount: number,
    evidenceUrl?: string,
  ) {
    return await this.prisma.$transaction(async (tx) => {
      const booking = await tx.bookings.findUnique({
        where: { id },
      });

      if (!booking) throw new NotFoundException('Không tìm thấy đơn hàng');
      if (booking.status !== 'WAITING_REFUND') {
        throw new BadRequestException(
          'Đơn hàng không ở trạng thái chờ hoàn tiền',
        );
      }

      const updated = await tx.bookings.update({
        where: { id },
        data: {
          status: 'REFUNDED',
          refundAmount: refundAmount,
          refundEvidence: evidenceUrl || null,
          refundedAt: new Date(),
          updatedAt: new Date(),
        } as any,
      });

      await (tx as any).booking_logs.create({
        data: {
          bookingId: id,
          action: 'REFUND_CONFIRMED',
          note: `Admin xác nhận đã hoàn tiền: ${refundAmount.toLocaleString()}đ.`,
        },
      });

      this.sendStatusMail(updated, 'REFUNDED').catch(() => {});

      return updated;
    });
  }
}
