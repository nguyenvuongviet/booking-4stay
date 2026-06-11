import { Injectable, Logger } from '@nestjs/common';
import { PayOS } from '@payos/node';
import {
  CLIENT_URL,
  PAYOS_API_KEY,
  PAYOS_CHECKSUM_KEY,
  PAYOS_CLIENT_ID,
} from 'src/common/constant/app.constant';
import { BookingLifecycleService } from '../booking/booking-lifecycle.service';
import { PrismaService } from '../prisma/prisma.service';

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

  async createPaymentLink(bookingId: number, amount: number) {
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
      description: `Don ${bookingId}`,
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

        // Xử lý trong transaction
        await this.prisma.$transaction(async (tx) => {
          // Double-check idempotency trong TX (chống race giữa 2 webhook cùng lúc)
          const freshTx = await tx.payment_transactions.findUnique({
            where: { orderCode: orderCodeBigInt },
          });
          if (freshTx?.status === 'COMPLETED') return;

          // Cập nhật trạng thái giao dịch
          await tx.payment_transactions.update({
            where: { id: paymentTx.id },
            data: {
              status: 'COMPLETED',
              payosResponse: webhookData as any,
              processedAt: new Date(),
            },
          });
        });

        // Cập nhật booking (bên ngoài TX riêng vì lifecycleService có TX riêng)
        await this.lifecycleService.updateStatus(
          paymentTx.bookingId,
          webhookData.amount,
        );
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
        if (paymentTx.status === 'COMPLETED') {
          return true; // Đã xử lý rồi
        }

        // Cập nhật giao dịch + booking
        await this.prisma.payment_transactions.update({
          where: { id: paymentTx.id },
          data: {
            status: 'COMPLETED',
            processedAt: new Date(),
          },
        });

        await this.lifecycleService.updateStatus(
          paymentTx.bookingId,
          paymentInfo.amountPaid,
        );

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
