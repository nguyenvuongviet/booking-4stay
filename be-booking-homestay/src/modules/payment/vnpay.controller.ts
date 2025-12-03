import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { bookings_paymentMethod, bookings_status } from '@prisma/client';
import { Response } from 'express';
import { Public } from 'src/common/decorator/public.decorator';
import { BookingService } from 'src/modules/booking/booking.service';
import { VNPayService } from './vnpay.service';

@Controller('api')
export class VNPayController {
  constructor(
    private readonly vnpayService: VNPayService,
    private readonly bookingService: BookingService,
  ) {}

  @Public()
  @Post('create-qr')
  async createPayment(
    @Body()
    body: {
      totalPrice: number;
      orderId: string;
      paymentMethod: bookings_paymentMethod;
    },
    @Res() res: Response,
  ) {
    try {
      const { totalPrice, orderId } = body;
      const url = await this.vnpayService.createPaymentUrl(totalPrice, orderId);
      return res.status(200).json({ url });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Failed to create payment URL' });
    }
  }

  @Public()
  @Get('payment-return')
  async handleReturn(
    @Query() query: Record<string, string>,
    @Res() res: Response,
  ) {
    const verified = this.vnpayService.verifyReturnUrl(query);

    const orderId = Number(query.vnp_OrderInfo);
    const responseCode = query.vnp_ResponseCode; // '00' = thành công
    const paidAmount = Number(query.vnp_Amount) / 100;

    try {
      if (verified.isVerified && responseCode === '00') {
        // Thanh toán thành công
        await this.bookingService.updateStatus(
          orderId,
          paidAmount,
          bookings_status.CONFIRMED,
        );
        return res.redirect(
          `http://localhost:3000/booking?orderId=${orderId}&status=success`,
        );
      } else {
        // Thanh toán thất bại
        await this.bookingService.updateStatus(orderId, 0, 'PENDING');
        return res.redirect(
          `http://localhost:3000/booking?orderId=${orderId}&status=failed`,
        );
      }
    } catch (err) {
      console.error('Payment return error:', err);
      return res.redirect(
        `http://localhost:3000/booking?orderId=${orderId}&status=failed`,
      );
    }
  }
}
