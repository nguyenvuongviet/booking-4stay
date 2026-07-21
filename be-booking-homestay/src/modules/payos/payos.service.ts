import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PayOS } from '@payos/node';
import { bookings_status } from '@prisma/client';
import {
  CLIENT_URL,
  PAYOS_API_KEY,
  PAYOS_CHECKSUM_KEY,
  PAYOS_CLIENT_ID,
} from 'src/common/constant/app.constant';
import { BookingLifecycleService } from '../booking/booking-lifecycle.service';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../user/dto/enum.dto';

@Injectable()
export class PayosService {
  private readonly payos: PayOS;
  private readonly logger = new Logger(PayosService.name);

  constructor(
    private readonly lifecycleService: BookingLifecycleService,
    private readonly prisma: PrismaService,
  ) {
    this.payos = new PayOS({
      clientId: PAYOS_CLIENT_ID,
      apiKey: PAYOS_API_KEY,
      checksumKey: PAYOS_CHECKSUM_KEY,
    });
  }

  async createPaymentLink(
    userId: number,
    role: string,
    bookingId: number,
    paymentPurpose?: 'DEPOSIT' | 'FULL',
  ) {
    const booking = await this.prisma.bookings.findUnique({
      where: { id: bookingId },
    });
    if (!booking) throw new NotFoundException('Không tìm thấy booking');

    // 0. Kiểm tra xem chức năng thanh toán có đang mở không
    if (process.env.ENABLE_PAYMENT === 'false')
      throw new BadRequestException(
        'Chức năng thanh toán trực tuyến hiện chưa kích hoạt trên hệ thống.',
      );

    // 1. Kiểm tra booking thuộc người gọi (Trừ Admin)
    if (role !== Role.ADMIN && booking.userId !== userId)
      throw new ForbiddenException('Bạn không có quyền thanh toán booking này');

    // 2. Kiểm tra trạng thái booking có được phép thanh toán không
    const invalidStatuses: bookings_status[] = [
      bookings_status.CANCELLED,
      bookings_status.CANCELLED_BY_ADMIN,
      bookings_status.CHECKED_OUT,
      bookings_status.REFUNDED,
    ];
    if (invalidStatuses.includes(booking.status as bookings_status))
      throw new BadRequestException(
        'Booking này không ở trạng thái được phép thanh toán',
      );

    // 3. Tính số tiền phải thu từ database
    const total = Number(booking.totalPrice);
    const paid = Number(booking.paidAmount);
    const outstandingAmount = total - paid;

    if (outstandingAmount <= 0)
      throw new BadRequestException('Booking này đã được thanh toán đầy đủ');

    let amount = 0;
    if (paymentPurpose === 'DEPOSIT') {
      // Đặt cọc 30% tổng tiền
      const requiredDeposit = Math.round(total * 0.3);
      if (paid >= requiredDeposit) {
        // Đã cọc đủ hoặc hơn rồi, số tiền cần thanh toán tiếp là outstandingAmount
        amount = outstandingAmount;
      } else
        // Cần thanh toán số tiền còn thiếu để đạt mức cọc 30%
        amount = requiredDeposit - paid;
    } else
      // Mặc định hoặc thanh toán FULL: trả hết số tiền còn thiếu
      amount = outstandingAmount;

    // Tránh số tiền quá nhỏ (dưới 1000đ PayOS không nhận)
    if (amount < 1000)
      throw new BadRequestException(
        'Số tiền thanh toán tối thiểu là 1,000 VND',
      );

    // Tạo orderCode an toàn: bookingId + timestamp (6 chữ số)
    const timestamp = Date.now() % 1000000;
    const orderCode = Number(
      `${bookingId}${String(timestamp).padStart(6, '0')}`,
    );

    // Lưu mapping orderCode ↔ bookingId vào DB trước khi gọi PayOS
    await this.prisma.payment_transactions.create({
      data: {
        bookingId,
        orderCode: BigInt(orderCode),
        amount,
        status: 'PENDING',
      },
    });

    const domain = CLIENT_URL;
    const cancelUrl = `${domain}/booking?cancel_payos=true`;
    const returnUrl = `${domain}/booking?success_payos=true&bookingId=${bookingId}&orderCode=${orderCode}`;

    const body = {
      orderCode,
      amount,
      description: `Don BK-${bookingId}`,
      items: [
        {
          name: `Đơn đặt phòng #${bookingId}`,
          quantity: 1,
          price: amount,
        },
      ],
      returnUrl,
      cancelUrl,
    };

    try {
      const paymentLinkRes = await this.payos.paymentRequests.create(body);
      return paymentLinkRes;
    } catch (error) {
      this.logger.error('Error creating PayOS payment link:', error);

      // Đánh dấu giao dịch thất bại
      await this.prisma.payment_transactions
        .updateMany({
          where: { orderCode: BigInt(orderCode) },
          data: { status: 'FAILED' },
        })
        .catch(() => {});

      throw error;
    }
  }
  async handleWebhook(webhookBody: any) {
    try {
      const webhookData = await this.payos.webhooks.verify(webhookBody);
      if (!webhookData) return false;

      if (webhookData.code === '00') {
        const orderCodeBigInt = BigInt(webhookData.orderCode);

        // Lookup bookingId từ DB — KHÔNG decode từ số
        const paymentTx = await this.prisma.payment_transactions.findUnique({
          where: { orderCode: orderCodeBigInt },
        });

        if (!paymentTx) {
          this.logger.error(
            `Unknown orderCode from webhook: ${webhookData.orderCode}`,
          );
          return false;
        }

        // Idempotency: đã xử lý rồi thì bỏ qua, trả true để PayOS không retry
        if (paymentTx.status === 'COMPLETED') {
          this.logger.log(
            `Webhook retry ignored for orderCode: ${webhookData.orderCode}`,
          );
          return true;
        }

        // Giao dịch nguyên tử (Atomic transaction) cho cả payment_transactions và bookings
        await this.prisma.$transaction(async (tx) => {
          // Chống race condition: Chỉ update status = 'COMPLETED' nếu nó đang là 'PENDING'
          const updateResult = await tx.payment_transactions.updateMany({
            where: {
              id: paymentTx.id,
              status: 'PENDING',
            },
            data: {
              status: 'COMPLETED',
              payosResponse: webhookData as any,
              processedAt: new Date(),
            },
          });

          if (updateResult.count === 0) {
            this.logger.log(
              `Webhook transaction already processed or not pending: ${paymentTx.id}`,
            );
            return;
          }

          // Cập nhật booking trong CÙNG transaction 'tx' này!
          await this.lifecycleService.updateStatus(
            paymentTx.bookingId,
            webhookData.amount,
            tx,
          );
        });
      }
      return true;
    } catch (error) {
      this.logger.error('Error handling webhook data:', error);
      return false;
    }
  }

  async verifyAndSyncPayment(orderCode: string | number) {
    try {
      const paymentInfo = await this.payos.paymentRequests.get(
        Number(orderCode),
      );
      if (paymentInfo && paymentInfo.status === 'PAID') {
        const orderCodeBigInt = BigInt(paymentInfo.orderCode);

        // Lookup bookingId từ DB
        const paymentTx = await this.prisma.payment_transactions.findUnique({
          where: { orderCode: orderCodeBigInt },
        });

        if (!paymentTx) {
          this.logger.error(
            `Unknown orderCode in sync: ${paymentInfo.orderCode}`,
          );
          return false;
        }

        // Idempotency check
        if (paymentTx.status === 'COMPLETED') return true; // Đã xử lý rồi

        // Cập nhật giao dịch + booking trong CÙNG một transaction
        await this.prisma.$transaction(async (tx) => {
          const updateResult = await tx.payment_transactions.updateMany({
            where: {
              id: paymentTx.id,
              status: 'PENDING',
            },
            data: {
              status: 'COMPLETED',
              processedAt: new Date(),
            },
          });

          if (updateResult.count === 0) return;

          await this.lifecycleService.updateStatus(
            paymentTx.bookingId,
            paymentInfo.amountPaid,
            tx,
          );
        });

        return true;
      }
      return false;
    } catch (error) {
      this.logger.error(
        `Error verifying payment for orderCode ${orderCode}:`,
        error,
      );
      return false;
    }
  }
}
