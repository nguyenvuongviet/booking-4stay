import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { bookings_status } from '@prisma/client';
import { ADMIN_EMAIL } from 'src/common/constant/app.constant';
import { AvailabilityHelper } from 'src/helpers/availability.helper';
import { PricingHelper } from 'src/helpers/pricing.helper';
import { ensureDateRange, nightsBetween } from 'src/utils/date.util';
import { sanitizeBooking } from 'src/utils/sanitize/booking.sanitize';
import { AppConfigsService } from '../app-configs/app-configs.service';
import { AppConfigKey } from '../app-configs/constants/app-config.constant';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../user/dto/enum.dto';
import { BookingLifecycleService } from './booking-lifecycle.service';
import {
  ACTIVE_BOOKING_STATUSES,
  CANCELLABLE_STATUSES,
  daysUntilDate,
  sortPolicyDesc,
} from './booking.constants';
import { CreateBookingDto } from './dto/create-booking.dto';
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
  ) {}

  /**
   * Xem trước thông tin đặt phòng (Pre-check).
   * Kiểm tra phòng trống, tính toán giá tiền, áp dụng ưu đãi hạng thành viên (Loyalty).
   */
  async previewBooking(userId: number, dto: PreCheckDto) {
    const { roomId, checkIn, checkOut } = dto;
    const { inDate, outDate } = ensureDateRange(checkIn, checkOut);

    const [room, isOccupied, policyConfig] = await Promise.all([
      this.prisma.rooms.findFirst({
        where: { id: roomId, isDeleted: false },
        select: { id: true, price: true, name: true },
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

    const loyaltyInfo = await this.pricing.applyLoyaltyDiscount(
      userId,
      rawTotal,
    );

    const nights = nightsBetween(inDate, outDate);

    return {
      available: !isOccupied,
      roomName: room.name,
      stayDetails: { checkIn: inDate, checkOut: outDate, nights },
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
    const { totalPrice, discountAmount } =
      await this.pricing.applyLoyaltyDiscount(userId, rawTotal);

    const booking = await this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM rooms WHERE id = ${roomId} FOR UPDATE`;

      await this.assertNoOverlap(tx, roomId, inDate, outDate, userId);
      await this.assertNotBlocked(tx, roomId, inDate, outDate);

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

  /**
   * Admin duyệt đơn đặt phòng thủ công.
   * Chuyển trạng thái booking sang CONFIRMED và cập nhật số tiền đã thanh toán.
   */
  async adminAcceptBooking(bookingId: number, dto: { paidAmount: number }) {
    const updated = await this.lifecycleService.changeBookingStatus(
      bookingId,
      bookings_status.CONFIRMED,
      { allowOverride: true, paidAmount: dto.paidAmount },
    );
    return {
      message: 'Admin đã duyệt đơn',
      booking: sanitizeBooking(updated),
    };
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

      if (!isDateChanged && !isOccupancyChanged && !isInfoChanged) {
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

        await tx.$queryRaw`SELECT id FROM rooms WHERE id = ${booking.roomId} FOR UPDATE`;

        const overlap = await tx.bookings.findFirst({
          where: {
            roomId: booking.roomId,
            isDeleted: false,
            status: { in: ACTIVE_BOOKING_STATUSES },
            id: { not: id },
            checkIn: { lt: outDate },
            checkOut: { gt: inDate },
          },
        });
        if (overlap) {
          throw new BadRequestException(
            `Phòng đã bị đặt trong khoảng thời gian này (ID: ${overlap.id})`,
          );
        }

        const rawTotal = await this.pricing.priceForRange(
          booking.roomId,
          Number(booking.rooms.price),
          inDate,
          outDate,
        );
        const { totalPrice, discountAmount } =
          await this.pricing.applyLoyaltyDiscount(booking.userId, rawTotal);

        const { newStatus, refundAmount, diff } = this.resolveRescheduleStatus(
          booking,
          totalPrice,
        );
        rescheduleResult = { diff, refundAmount };

        updateData.checkIn = inDate;
        updateData.checkOut = outDate;
        updateData.rawTotalPrice = rawTotal;
        updateData.discountAmount = discountAmount;
        updateData.totalPrice = totalPrice;
        updateData.status = newStatus;
        updateData.refundAmount = refundAmount;
        logAction = 'RESCHEDULE';
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

      if (!updateData.modifiedCount) {
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
   * Đảm bảo khoảng ngày đặt không bị trùng với bất kỳ đơn đặt phòng nào khác đang hoạt động.
   * Hỗ trợ chống click đúp (Double-click protection) trong vòng 5 phút cùng 1 user.
   */
  private async assertNoOverlap(
    tx: any,
    roomId: number,
    inDate: Date,
    outDate: Date,
    userId: number,
  ) {
    const overlap = await tx.bookings.findFirst({
      where: {
        roomId,
        isDeleted: false,
        status: { in: ACTIVE_BOOKING_STATUSES },
        checkIn: { lt: outDate },
        checkOut: { gt: inDate },
      },
    });

    if (overlap) {
      if (overlap.userId === userId) {
        const timeDiff =
          new Date().getTime() - new Date(overlap.createdAt).getTime();
        if (timeDiff < 5 * 60 * 1000) return overlap;
      }
      throw new BadRequestException('Khoảng ngày đã có người giữ hoặc bị khóa');
    }
    return null;
  }

  /**
   * Đảm bảo khoảng ngày đặt không nằm trong những ngày Host đã chủ động khóa (Đóng phòng).
   */
  private async assertNotBlocked(
    tx: any,
    roomId: number,
    inDate: Date,
    outDate: Date,
  ) {
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
