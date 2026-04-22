import { Injectable, Logger } from '@nestjs/common';
import { PayOS } from '@payos/node';
import {
  CLIENT_URL,
  PAYOS_API_KEY,
  PAYOS_CHECKSUM_KEY,
  PAYOS_CLIENT_ID,
} from 'src/common/constant/app.constant';
import { BookingService } from '../booking/booking.service';

@Injectable()
export class PayosService {
  private readonly payos: PayOS;
  private readonly logger = new Logger(PayosService.name);

  constructor(private readonly bookingService: BookingService) {
    this.payos = new PayOS({
      clientId: PAYOS_CLIENT_ID,
      apiKey: PAYOS_API_KEY,
      checksumKey: PAYOS_CHECKSUM_KEY,
    });
  }

  async createPaymentLink(bookingId: number, amount: number) {
    const orderCode = Number(
      `${bookingId}${Math.floor(Math.random() * 10000)}`,
    );

    const domain = CLIENT_URL;
    const cancelUrl = `${domain}/booking?cancel_payos=true`;
    const returnUrl = `${domain}/booking?success_payos=true&bookingId=${bookingId}`;

    const body = {
      orderCode,
      amount,
      description: `Don ${bookingId}`,
      items: [
        {
          name: `Đơn đặt phòng ${bookingId}`,
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
      throw error;
    }
  }

  async handleWebhook(webhookBody: any) {
    try {
      const webhookData = await this.payos.webhooks.verify(webhookBody);
      if (!webhookData) return false;

      if (webhookData.code === '00') {
        const orderCode = webhookData.orderCode;
        const bookingId = Math.floor(Number(orderCode) / 10000);
        await this.bookingService.updateStatus(bookingId, webhookData.amount);
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
        const bookingId = Math.floor(Number(paymentInfo.orderCode) / 10000);
        await this.bookingService.updateStatus(
          bookingId,
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
