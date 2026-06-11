import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { bookings_status } from '@prisma/client';
import { eachDayOfInterval, subDays } from 'date-fns';
import {
  ADMIN_EMAIL,
  WALK_IN_GUEST_ID,
} from 'src/common/constant/app.constant';
import { AvailabilityHelper } from 'src/helpers/availability.helper';
import { LoyaltyProgram } from 'src/helpers/loyalty.helper';
import { PricingHelper } from 'src/helpers/pricing.helper';
import { ensureDateRange, nightsBetween } from 'src/utils/date.util';
import { sanitizeBooking } from 'src/utils/sanitize/booking.sanitize';
import { AppConfigsService } from '../app-configs/app-configs.service';
import { AppConfigKey } from '../app-configs/constants/app-config.constant';
import { MailService } from '../mail/mail.service';
import { BookingNotificationDispatcher } from '../notification/booking-notification.dispatcher';
import { PrismaService } from '../prisma/prisma.service';
import { PromotionHelper } from '../promotion/promotion.helper';
import { Role } from '../user/dto/enum.dto';
import { BookingLifecycleService } from './booking-lifecycle.service';
import {
  CANCELLABLE_STATUSES,
  daysUntilDate,
  sortPolicyDesc,
} from './booking.constants';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CreateManualBookingDto } from './dto/create-manual-booking.dto';
import { PreCheckDto } from './dto/preCheck-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Injectable()
export class BookingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pricing: PricingHelper,
    private readonly availability: AvailabilityHelper,
    private readonly mailService: MailService,
    private readonly appConfigsService: AppConfigsService,
    private readonly lifecycleService: BookingLifecycleService,
    private readonly loyalty: LoyaltyProgram,
    private readonly notificationService: BookingNotificationDispatcher,
    private readonly promotionHelper: PromotionHelper,
  ) {}

  /**˚
   * Xem trước thông tin đặt phòng (Pre-check).
   * Kiểm tra phòng trống, tính toán giá tiền, áp dụng ưu đãi hạng thành viên (Loyalty).
   */
  async previewBooking(userId: number, dto: PreCheckDto) {
    const { roomId, checkIn, checkOut, promotionCode } = dto;
    const { inDate, outDate } = ensureDateRange(checkIn, checkOut);

    const [room, isOccupied, policyConfig] = await Promise.all([
      this.prisma.rooms.findFirst({
        where: { id: roomId, isDeleted: false },
        select: { id: true, price: true, name: true, provinceId: true },
      }),
      this.availability.hasOverlap(roomId, inDate, outDate),
      this.prisma.app_configs.findUnique({
        where: { key: AppConfigKey.CANCELLATION_POLICY },
      }),
    ]);
    if (!room) throw new NotFoundException('Phòng không tồn tại');

    const rawTotal = await this.pricing.priceForRange(
      roomId,
      Number(room.price),
      inDate,
      outDate,
    );

    // Sử dụng Waterfall Discount (Coupon → Loyalty)
    const waterfallResult = await this.pricing.applyWaterfallDiscount(
      userId,
      rawTotal,
      promotionCode,
      room.provinceId,
    );

    const nights = nightsBetween(inDate, outDate);

    return {
      available: !isOccupied,
      roomName: room.name,
      stayDetails: { checkIn: inDate, checkOut: outDate, nights },
      priceSummary: {
        averagePricePerNight: Math.round(rawTotal / nights),
        rawTotal,
        // Tầng 1: Coupon
        couponDiscount: waterfallResult.couponDiscount,
        couponCode: waterfallResult.couponCode,
        couponValid: waterfallResult.couponValid,
        couponMessage: waterfallResult.couponMessage,
        // Tầng 2: Loyalty
        loyaltyDiscount: waterfallResult.loyaltyDiscount,
        tierName: waterfallResult.tierName,
        discountPercent: waterfallResult.discountPercent,
        // Tổng
        totalDiscount: waterfallResult.totalDiscount,
        discountAmount: waterfallResult.loyaltyDiscount, // backward compat
        totalPrice: waterfallResult.totalPrice,
      },
      cancellationPolicy: policyConfig?.value || [],
      policyUpdatedAt: policyConfig?.updatedAt || null,
      message: isOccupied
        ? 'Phòng đã có người đặt trong khoảng thời gian này'
        : 'Phòng trống, bạn có thể tiếp tục đặt phòng',
    };
  }

  /**
   * Tạo mới một đơn đặt phòng.
   * Xử lý lock dữ liệu đồng thời (Transaction), kiểm tra điều kiện, tính giá và gửi email xác nhận.
   */
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
      promotionCode,
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
          provinceId: true,
        },
      }),
      this.prisma.app_configs.findUnique({
        where: { key: AppConfigKey.CANCELLATION_POLICY },
      }),
      this.appConfigsService.getConfigValue<number>(
        AppConfigKey.BOOKING_EXPIRY_MINUTES,
        15,
      ),
    ]);
    if (!room) throw new BadRequestException('Phòng không tồn tại');

    this.validateCapacity(room, adults, children);
    this.validatePolicyVersion(dto.policyUpdatedAt, policyConfig);

    const rawTotal = await this.pricing.priceForRange(
      roomId,
      Number(room.price),
      inDate,
      outDate,
    );

    // Sử dụng Waterfall Discount (Coupon → Loyalty)
    const waterfallResult = await this.pricing.applyWaterfallDiscount(
      userId,
      rawTotal,
      promotionCode,
      room.provinceId,
    );

    const booking = await this.prisma.$transaction(async (tx) => {
      // Lock timeout: fail-fast nếu row bị lock quá 3 giây (tránh chờ vô hạn)
      await tx.$queryRaw`SET innodb_lock_wait_timeout = 3`;
      await tx.$queryRaw`SELECT id FROM rooms WHERE id = ${roomId} FOR UPDATE`;

      await this.availability.assertAvailability(roomId, inDate, outDate, {
        tx,
        userId,
      });

      // Re-validate coupon trong transaction để tránh race condition
      let finalWaterfall = waterfallResult;
      if (promotionCode && waterfallResult.couponValid) {
        finalWaterfall = await this.pricing.applyWaterfallDiscount(
          userId,
          rawTotal,
          promotionCode,
          room.provinceId,
          { tx },
        );
        if (!finalWaterfall.couponValid) {
          throw new BadRequestException(finalWaterfall.couponMessage);
        }
      }

      const created = await tx.bookings.create({
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
          discountAmount: finalWaterfall.loyaltyDiscount,
          promotionId: finalWaterfall.promotionId,
          promotionDiscount: finalWaterfall.couponDiscount,
          totalPrice: finalWaterfall.totalPrice,
          status: bookings_status.PENDING,
          paymentMethod,
          paidAmount: 0,
          cancellationPolicy: policyConfig?.value || [],
          policyUpdatedAt: policyConfig?.updatedAt || new Date(),
        },
        include: { rooms: { include: { room_images: true } } },
      });

      // Ghi nhận coupon usage trong transaction
      if (finalWaterfall.promotionId && finalWaterfall.couponDiscount > 0) {
        await this.promotionHelper.recordCouponUsage(
          finalWaterfall.promotionId,
          userId,
          created.id,
          finalWaterfall.couponDiscount,
          { tx },
        );
      }

      // INSERT booking_date_locks — DB-level unique constraint chống overbooking
      const stayDates = eachDayOfInterval({
        start: inDate,
        end: subDays(outDate, 1),
      });
      if (stayDates.length > 0) {
        await tx.booking_date_locks.createMany({
          data: stayDates.map((date) => ({
            roomId,
            date,
            bookingId: created.id,
          })),
        });
      }

      return created;
    });

    this.mailService
      .sendBookingMail(booking.guestEmail, 'BOOKING_PENDING', booking)
      .catch((e) => console.error('Mail Error:', e));
    this.mailService
      .sendBookingMail(ADMIN_EMAIL, 'BOOKING_PENDING', booking)
      .catch((e) => console.error('Admin Mail Error:', e));

    // create notification for user
    try {
      await this.notificationService.notifyBookingCreated(userId, booking.id);
      // Notify admin about new booking
      this.notificationService
        .notifyAdminNewBooking(booking.id, guestFullName)
        .catch((err) => console.error('Admin notification error:', err));
    } catch (err) {
      console.error('Notification error:', err);
    }

    return {
      message: 'Tạo đơn đặt thành công',
      booking: sanitizeBooking({ ...booking, expiryMinutes }),
    };
  }

  /**
   * Admin tạo đơn đặt phòng thủ công (Manual Booking).
   * Dùng cho khách đã chốt đơn qua điện thoại, email, Zalo...
   * - createAccount = true -> Tạo tài khoản mới cho khách (tích điểm Loyalty ngay)
   * - createAccount = false -> Gán userId = WALK_IN_GUEST_ID (khách vãng lai)
   * - Vẫn đi qua Pessimistic Lock + assertNoOverlap + assertNotBlocked
   */
  async adminCreateManualBooking(adminId: number, dto: CreateManualBookingDto) {
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
      paymentMethod = 'CASH' as any,
      paidAmount = 0,
      note,
      createAccount = false,
    } = dto;

    const { inDate, outDate } = ensureDateRange(checkIn, checkOut);

    const [room, policyConfig] = await Promise.all([
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
    ]);
    if (!room) throw new BadRequestException('Phòng không tồn tại');

    this.validateCapacity(room, adults, children);

    const rawTotal = await this.pricing.priceForRange(
      roomId,
      Number(room.price),
      inDate,
      outDate,
    );

    const status = this.resolveManualStatus(paidAmount, rawTotal);

    const booking = await this.prisma.$transaction(async (tx) => {
      // --- Bước 1: Xác định userId ---
      let userId = WALK_IN_GUEST_ID;
      let accountCreated = false;
      let accountReused = false;

      if (createAccount) {
        const result = await this.findOrCreateGuestAccount(tx, {
          guestFullName,
          guestEmail,
          guestPhoneNumber,
        });
        userId = result.userId;
        if (userId !== WALK_IN_GUEST_ID) {
          if (result.isNew) accountCreated = true;
          else accountReused = true;
        }
      }

      // --- Bước 2: Pessimistic Lock + Kiểm tra trùng lặp ---
      await tx.$queryRaw`SET innodb_lock_wait_timeout = 3`;
      await tx.$queryRaw`SELECT id FROM rooms WHERE id = ${roomId} FOR UPDATE`;
      await this.availability.assertAvailability(roomId, inDate, outDate, {
        tx,
        userId,
      });

      // --- Bước 3: Tính toán giảm giá Loyalty ---
      const { totalPrice, discountAmount } =
        userId !== WALK_IN_GUEST_ID
          ? await this.pricing.applyLoyaltyDiscount(userId, rawTotal, { tx })
          : { totalPrice: rawTotal, discountAmount: 0 };

      // --- Bước 4: Tạo booking ---
      const created = await tx.bookings.create({
        data: {
          userId,
          roomId,
          guestFullName,
          guestEmail: guestEmail || '',
          guestPhoneNumber,
          specialRequest: specialRequest ?? null,
          checkIn: inDate,
          checkOut: outDate,
          adults,
          children,
          rawTotalPrice: rawTotal,
          discountAmount,
          totalPrice,
          status,
          paymentMethod,
          paidAmount,
          cancellationPolicy: policyConfig?.value || [],
          policyUpdatedAt: policyConfig?.updatedAt || new Date(),
        },
        include: { rooms: { include: { room_images: true } } },
      });

      // --- Bước 4: Ghi log ---
      const logParts = [
        `[Manual] Admin tạo đơn thủ công cho ${guestFullName} (${guestPhoneNumber})`,
      ];
      if (accountCreated)
        logParts.push(`[Đã tạo tài khoản mới userId=${userId}]`);
      else if (accountReused)
        logParts.push(`[Sử dụng tài khoản có sẵn userId=${userId}]`);
      if (note) logParts.unshift(`[Manual] ${note}`);

      await (tx as any).booking_logs.create({
        data: {
          bookingId: created.id,
          action: 'MANUAL_CREATE',
          newCheckIn: inDate,
          newCheckOut: outDate,
          newTotal: rawTotal,
          performedBy: adminId,
          note: note ? `[Manual] ${note}` : logParts.join(' | '),
        },
      });

      // --- Bước 5: Insert booking_date_locks ---
      const stayDates = eachDayOfInterval({
        start: inDate,
        end: subDays(outDate, 1),
      });
      if (stayDates.length > 0) {
        await tx.booking_date_locks.createMany({
          data: stayDates.map((date) => ({
            roomId,
            date,
            bookingId: created.id,
          })),
        });
      }

      return { ...created, accountCreated, guestUserId: userId };
    });

    // Gửi email thông báo
    const mailType = 'BOOKING_CONFIRMED';
    if (guestEmail) {
      this.mailService
        .sendBookingMail(guestEmail, mailType, booking)
        .catch((e) => console.error('Mail Error:', e));
    }
    this.mailService
      .sendBookingMail(ADMIN_EMAIL, mailType, booking)
      .catch((e) => console.error('Admin Mail Error:', e));

    // notify guest user if account exists
    try {
      if (booking.guestUserId && booking.guestUserId !== WALK_IN_GUEST_ID) {
        await this.notificationService.notifyBookingConfirmed(
          booking.guestUserId,
          booking.id,
        );
      }
    } catch (err) {
      console.error('Notification Error:', err);
    }

    return {
      message: booking.accountCreated
        ? 'Tạo đơn đặt phòng thành công & đã tạo tài khoản cho khách'
        : 'Tạo đơn đặt phòng thủ công thành công',
      accountCreated: booking.accountCreated,
      guestUserId: booking.guestUserId,
      booking: sanitizeBooking(booking),
    };
  }

  /**
   * Tìm hoặc tạo tài khoản cho khách vãng lai.
   * - Ưu tiên tìm theo SĐT (luôn có) hoặc Email (nếu có), bao gồm cả khách đã bị xóa.
   * - Nếu tìm thấy khách cũ bị xóa -> Khôi phục lại (undelete).
   * - Mật khẩu mặc định = SĐT.
   */
  private async findOrCreateGuestAccount(
    tx: any,
    guest: {
      guestFullName: string;
      guestEmail?: string;
      guestPhoneNumber: string;
    },
  ): Promise<{ userId: number; isNew: boolean }> {
    const email = guest.guestEmail || `${guest.guestPhoneNumber}@4stay.local`;

    // 1. Tìm user hiện có (theo SĐT hoặc Email)
    const existingUser = await tx.users.findFirst({
      where: {
        OR: [{ phoneNumber: guest.guestPhoneNumber }, { email: email }],
      },
      select: { id: true, isDeleted: true },
    });

    let userId: number;
    let isNew = false;

    if (existingUser) {
      userId = existingUser.id;
      // Nếu user đã bị xóa -> Khôi phục lại
      if (existingUser.isDeleted) {
        await tx.users.update({
          where: { id: userId },
          data: { isDeleted: false, deletedAt: null, isActive: true },
        });
      }
    } else {
      // 2. Chưa có -> Tạo mới
      isNew = true;
      const nameParts = guest.guestFullName.trim().split(/\s+/);
      const lastName = nameParts.pop() || '';
      const firstName = nameParts.join(' ') || lastName;

      const bcrypt = await import('bcrypt');
      const hashedPassword = await bcrypt.hash(guest.guestPhoneNumber, 10);

      const userRole = await tx.roles.findUnique({ where: { name: 'USER' } });
      if (!userRole) return { userId: WALK_IN_GUEST_ID, isNew: false };

      const newUser = await tx.users.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          phoneNumber: guest.guestPhoneNumber,
          country: 'Việt Nam',
          isVerified: true,
          isActive: true,
          user_roles: { create: { roleId: userRole.id } },
        },
      });
      userId = newUser.id;
    }

    // 3. Đảm bảo có Loyalty Program (Dùng helper đã có)
    await this.loyalty.createLoyaltyProgram(userId, { tx });

    return { userId, isNew };
  }

  /**
   * Xác định trạng thái booking dựa trên số tiền Admin đã thu.
   */
  private resolveManualStatus(
    paidAmount: number,
    totalPrice: number,
  ): bookings_status {
    if (paidAmount >= totalPrice) return bookings_status.CONFIRMED;
    if (paidAmount > 0) return bookings_status.PARTIALLY_PAID;
    return bookings_status.PENDING;
  }

  /**
   * Cập nhật thông tin đặt phòng (Unified Update).
   * Hỗ trợ đổi ngày, đổi số lượng khách hoặc cả hai trong một lần gọi API.
   */
  async update(
    id: number,
    userId: number,
    role: string,
    dto: UpdateBookingDto,
  ) {
    const {
      checkIn,
      checkOut,
      adults,
      children,
      guestFullName,
      guestEmail,
      guestPhoneNumber,
      specialRequest,
      waiveFee,
      bankName,
      bankAccountNumber,
      bankAccountName,
    } = dto;

    return await this.prisma.$transaction(async (tx) => {
      const booking = await tx.bookings.findUnique({
        where: { id },
        include: { rooms: true },
      });
      if (!booking) throw new NotFoundException('Không tìm thấy booking');

      this.assertOwnerOrAdmin(booking.userId, userId, role, 'chỉnh sửa');

      const oldTotal = Number(booking.totalPrice);

      // 1. Xác định các thay đổi
      const isDateChanged =
        (checkIn && checkIn !== booking.checkIn.toISOString().split('T')[0]) ||
        (checkOut && checkOut !== booking.checkOut.toISOString().split('T')[0]);

      const isOccupancyChanged =
        (adults !== undefined && adults !== booking.adults) ||
        (children !== undefined && children !== (booking.children || 0));

      const isInfoChanged =
        (guestFullName !== undefined &&
          guestFullName !== booking.guestFullName) ||
        (guestEmail !== undefined && guestEmail !== booking.guestEmail) ||
        (guestPhoneNumber !== undefined &&
          guestPhoneNumber !== booking.guestPhoneNumber) ||
        (specialRequest !== undefined &&
          specialRequest !== booking.specialRequest);

      const isBankInfoChanged =
        (bankName !== undefined && bankName !== booking.bankName) ||
        (bankAccountNumber !== undefined &&
          bankAccountNumber !== booking.bankAccountNumber) ||
        (bankAccountName !== undefined &&
          bankAccountName !== booking.bankAccountName);

      if (
        !isDateChanged &&
        !isOccupancyChanged &&
        !isInfoChanged &&
        !isBankInfoChanged
      ) {
        return {
          message: 'Không có thay đổi nào được thực hiện',
          booking: sanitizeBooking(booking),
        };
      }

      const updateData: any = { updatedAt: new Date() };
      let logNote = '';
      let logAction = 'UPDATE';

      // 2. Xử lý đổi ngày (Reschedule logic)
      let rescheduleResult = { diff: 0, refundAmount: 0 };
      if (isDateChanged) {
        if (!checkIn || !checkOut) {
          throw new BadRequestException(
            'Cần cung cấp cả ngày check-in và check-out khi đổi ngày',
          );
        }
        const { inDate, outDate } = ensureDateRange(checkIn, checkOut);
        const nights = nightsBetween(inDate, outDate);

        this.assertReschedulable(booking.status as bookings_status);
        this.assertRescheduleLimit(booking, role);
        this.assertRescheduleWindow(booking, role);

        await tx.$queryRaw`SET innodb_lock_wait_timeout = 3`;
        await tx.$queryRaw`SELECT id FROM rooms WHERE id = ${booking.roomId} FOR UPDATE`;

        await this.availability.assertAvailability(
          booking.roomId,
          inDate,
          outDate,
          { tx, excludeBookingId: id },
        );

        const rawTotal = await this.pricing.priceForRange(
          booking.roomId,
          Number(booking.rooms.price),
          inDate,
          outDate,
        );
        const { totalPrice, discountAmount } =
          await this.pricing.applyLoyaltyDiscount(booking.userId, rawTotal);

        // Admin "Miễn phụ phí": giữ nguyên giá cũ nếu giá mới đắt hơn
        const finalPrice =
          waiveFee && role === Role.ADMIN && totalPrice > oldTotal
            ? oldTotal
            : totalPrice;
        const finalDiscount =
          waiveFee && role === Role.ADMIN && totalPrice > oldTotal
            ? Number(booking.discountAmount)
            : discountAmount;

        const { newStatus, refundAmount, diff } = this.resolveRescheduleStatus(
          booking,
          finalPrice,
        );
        rescheduleResult = { diff, refundAmount };

        updateData.checkIn = inDate;
        updateData.checkOut = outDate;
        updateData.rawTotalPrice = rawTotal;
        updateData.discountAmount = finalDiscount;
        updateData.totalPrice = finalPrice;
        updateData.status = newStatus;
        updateData.refundAmount = refundAmount;

        logAction = 'RESCHEDULE';
        if (waiveFee && role === Role.ADMIN) logNote += '[Miễn phụ phí] ';
        logNote += `Đổi ngày: ${nights} đêm (${oldTotal.toLocaleString()} -> ${totalPrice.toLocaleString()} VND). `;
      }

      // 3. Xử lý đổi số lượng khách (Occupancy logic)
      if (isOccupancyChanged) {
        const updatableStatuses: bookings_status[] = [
          bookings_status.PENDING,
          bookings_status.PARTIALLY_PAID,
          bookings_status.CONFIRMED,
          bookings_status.CHECKED_IN,
        ];
        if (!updatableStatuses.includes(booking.status as bookings_status)) {
          throw new BadRequestException(
            'Không thể chỉnh sửa số lượng khách cho đơn hàng này',
          );
        }

        const newAdults = adults ?? booking.adults;
        const newChildren = children ?? (booking.children || 0);

        this.validateCapacity(booking.rooms, newAdults, newChildren);

        updateData.adults = newAdults;
        updateData.children = newChildren;

        if (logAction === 'UPDATE') logAction = 'UPDATE_OCCUPANCY';
        logNote += `Sửa khách: người lớn (${booking.adults} -> ${newAdults}), trẻ em (${booking.children || 0} -> ${newChildren}). `;
      }

      // 4. Xử lý thông tin khách hàng và yêu cầu đặc biệt
      if (isInfoChanged) {
        if (guestFullName !== undefined)
          updateData.guestFullName = guestFullName;
        if (guestEmail !== undefined) updateData.guestEmail = guestEmail;
        if (guestPhoneNumber !== undefined)
          updateData.guestPhoneNumber = guestPhoneNumber;
        if (specialRequest !== undefined)
          updateData.specialRequest = specialRequest;

        if (logAction === 'UPDATE') logAction = 'UPDATE_INFO';
        logNote += 'Cập nhật thông tin khách hàng/yêu cầu đặc biệt. ';
      }

      // 4.5 Xử lý thông tin ngân hàng
      if (isBankInfoChanged) {
        if (bankName) updateData.bankName = bankName;
        if (bankAccountNumber) updateData.bankAccountNumber = bankAccountNumber;
        if (bankAccountName) updateData.bankAccountName = bankAccountName;

        if (logAction === 'UPDATE') {
          logAction = 'UPDATE_BANK_INFO';
        }
        logNote += 'Cập nhật thông tin nhận tiền hoàn. ';
      }

      if (
        role !== Role.ADMIN &&
        !updateData.modifiedCount &&
        (isDateChanged || isOccupancyChanged || isInfoChanged)
      ) {
        updateData.modifiedCount = { increment: 1 };
      }

      // 5. Ghi Log và Cập nhật
      const newTotal =
        updateData.totalPrice !== undefined ? updateData.totalPrice : oldTotal;

      await (tx as any).booking_logs.create({
        data: {
          bookingId: id,
          action: logAction,
          oldCheckIn: booking.checkIn,
          oldCheckOut: booking.checkOut,
          newCheckIn: updateData.checkIn || booking.checkIn,
          newCheckOut: updateData.checkOut || booking.checkOut,
          oldTotal,
          newTotal,
          performedBy: userId,
          note: logNote.trim(),
        },
      });

      const updated = await tx.bookings.update({
        where: { id },
        data: updateData,
        include: {
          rooms: { include: { room_images: true } },
          users: true,
          logs: { orderBy: { createdAt: 'desc' } },
        },
      });

      // Cập nhật booking_date_locks nếu ngày thay đổi
      if (isDateChanged && updateData.checkIn && updateData.checkOut) {
        // Xóa locks cũ
        await tx.booking_date_locks.deleteMany({
          where: { bookingId: id },
        });
        // Insert locks mới
        const newStayDates = eachDayOfInterval({
          start: updateData.checkIn,
          end: subDays(updateData.checkOut, 1),
        });
        if (newStayDates.length > 0) {
          await tx.booking_date_locks.createMany({
            data: newStayDates.map((date) => ({
              roomId: booking.roomId,
              date,
              bookingId: id,
            })),
          });
        }
      }

      let message = 'Cập nhật thành công';
      if (isDateChanged) {
        message = this.buildRescheduleMessage(
          rescheduleResult.diff,
          rescheduleResult.refundAmount,
        );
      } else if (isOccupancyChanged) {
        message = 'Đã cập nhật số lượng khách thành công';
      }

      const expiryMinutes = await this.appConfigsService.getConfigValue<number>(
        AppConfigKey.BOOKING_EXPIRY_MINUTES,
        30,
      );

      return {
        message,
        booking: sanitizeBooking({ ...updated, expiryMinutes }),
      };
    });
  }

  /**
   * Kiểm tra số lượng khách (người lớn, trẻ em) so với sức chứa tối đa của phòng.
   */
  private validateCapacity(room: any, adults: number, children: number) {
    if (adults > room.adultCapacity || children > room.childCapacity) {
      throw new BadRequestException('Vượt quá sức chứa phòng');
    }
  }

  /**
   * Ngăn chặn rủi ro khách hàng đang thao tác nhưng chính sách hủy trên hệ thống bị thay đổi.
   */
  private validatePolicyVersion(
    clientPolicyDate: string | Date | undefined,
    policyConfig: any,
  ) {
    if (clientPolicyDate && policyConfig) {
      const clientDate = new Date(clientPolicyDate).getTime();
      const serverDate = new Date(policyConfig.updatedAt).getTime();
      if (Math.abs(clientDate - serverDate) > 1000) {
        throw new BadRequestException(
          'Chính sách hủy phòng đã được cập nhật. Vui lòng kiểm tra lại thông tin trước khi xác nhận đặt phòng.',
        );
      }
    }
  }

  /**
   * Xác thực quyền truy cập: Chỉ Admin hoặc người tạo đơn mới có quyền thực hiện hành động này.
   */
  private assertOwnerOrAdmin(
    bookingUserId: number,
    requesterId: number,
    role: string,
    action: string,
  ) {
    if (role !== Role.ADMIN && bookingUserId !== requesterId) {
      throw new ForbiddenException(`Bạn không có quyền ${action} booking này`);
    }
  }

  /**
   * Kiểm tra trạng thái hiện tại của đơn có cho phép đổi ngày hay không.
   */
  private assertReschedulable(status: bookings_status) {
    if (!CANCELLABLE_STATUSES.includes(status)) {
      throw new BadRequestException(
        'Chỉ được đổi ngày khi booking đang PENDING, PARTIALLY_PAID hoặc CONFIRMED',
      );
    }
  }

  /**
   * Giới hạn số lần tối đa User được phép tự đổi ngày (mặc định 3 lần). Admin không bị giới hạn.
   */
  private assertRescheduleLimit(booking: any, role: string) {
    const currentCount = Number(booking.modifiedCount || 0);
    if (role !== Role.ADMIN && currentCount >= 3) {
      throw new BadRequestException(
        'Bạn đã sử dụng hết 3 lượt đổi ngày. Vui lòng liên hệ Admin để được hỗ trợ.',
      );
    }
  }

  /**
   * Kiểm tra xem thời điểm hiện tại còn đủ số ngày để đổi phòng miễn phí hay không (dựa trên chính sách).
   */
  private assertRescheduleWindow(booking: any, role: string) {
    if (role === Role.ADMIN) return;

    const daysLeft = daysUntilDate(new Date(booking.checkIn));

    let freeCancelDays = 3;
    const sortedPolicy = sortPolicyDesc(booking.cancellationPolicy);
    if (sortedPolicy.length > 0 && sortedPolicy[0].refundPercent >= 1) {
      freeCancelDays = sortedPolicy[0].daysBefore;
    }

    if (daysLeft < freeCancelDays) {
      throw new BadRequestException(
        `Chỉ được tự đổi ngày khi còn ít nhất ${freeCancelDays} ngày trước check-in. Vui lòng liên hệ Admin để được hỗ trợ.`,
      );
    }
  }

  /**
   * Xác định trạng thái mới và số tiền thừa/thiếu khi giá booking thay đổi do đổi ngày.
   */
  private resolveRescheduleStatus(booking: any, newTotalPrice: number) {
    const paid = Number(booking.paidAmount);
    const diff = newTotalPrice - paid;
    let newStatus: bookings_status = booking.status;
    let refundAmount = 0;

    if (booking.status === bookings_status.PENDING) {
      newStatus = bookings_status.PENDING;
    } else if (diff > 0) {
      newStatus = bookings_status.PARTIALLY_PAID;
    } else {
      newStatus = bookings_status.CONFIRMED;
      if (diff < 0) refundAmount = Math.abs(diff);
    }

    return { newStatus, refundAmount, diff };
  }

  /**
   * Tạo thông báo kết quả trả về cho khách sau khi đổi ngày dựa trên số tiền thay đổi.
   */
  private buildRescheduleMessage(diff: number, refundAmount: number): string {
    if (diff > 0) {
      return `Đã cập nhật ngày. Vui lòng thanh toán thêm ${diff.toLocaleString()} VNĐ.`;
    }
    if (diff < 0) {
      return `Đã cập nhật ngày. Số tiền thừa ${refundAmount.toLocaleString()} VNĐ đã được ghi nhận hoàn trả.`;
    }
    return 'Đã cập nhật ngày thành công.';
  }
}
