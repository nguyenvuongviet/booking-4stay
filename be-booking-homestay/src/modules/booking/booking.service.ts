import {
  BadRequestException,
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
import { BookingLifecycleService } from './booking-lifecycle.service';
import { ACTIVE_BOOKING_STATUSES } from './booking.constants';
import { CreateBookingDto } from './dto/create-booking.dto';
import { PreCheckDto } from './dto/preCheck-booking.dto';

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
}
////
////
////
////
////
