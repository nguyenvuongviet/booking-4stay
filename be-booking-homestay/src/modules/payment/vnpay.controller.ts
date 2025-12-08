import { Body, Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { Public } from 'src/common/decorator/public.decorator';
import { Roles } from 'src/common/decorator/roles.decorator';
import { VNPayService } from './vnpay.service';

@Controller('api')
export class VNPayController {
  constructor(private readonly vnpayService: VNPayService) {}

  @Post('create-qr')
  @Public()
  async createPayment(
    @Body() body: { totalPrice: number; orderId: string },
    @Res() res: Response,
  ) {
    const url = await this.vnpayService.createPaymentUrl(
      body.totalPrice,
      body.orderId,
    );
    return res.status(200).json({ url });
  }

  @Get('payment-return')
  @Public()
  async handleReturn(
    @Query() query: Record<string, string>,
    @Res() res: Response,
  ) {
    const redirectUrl = await this.vnpayService.handlePaymentReturn(query);
    return res.redirect(redirectUrl);
  }

  @Post('refund')
  @Roles('ADMIN')
  @ApiBearerAuth('AccessToken')
  async refund(
    @Body() body: { bookingId: number; amount: number; reason?: string },
    @Req() req: Request,
  ) {
    const user = req['user'];
    const result = await this.vnpayService.refund(
      body.bookingId,
      body.amount,
      +user.id,
      body.reason ?? 'Default reason',
    );
    return result;
  }
}
