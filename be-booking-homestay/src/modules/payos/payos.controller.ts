import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
} from '@nestjs/common';
import { PayosService } from './payos.service';

@Controller('payos')
export class PayosController {
  private readonly logger = new Logger(PayosController.name);

  constructor(private readonly payosService: PayosService) {}

  @Post('create-link')
  async createLink(@Body() body: { bookingId: number; amount: number }) {
    if (!body.bookingId || !body.amount) {
      throw new BadRequestException('Thiếu tham số');
    }

    const paymentData = await this.payosService.createPaymentLink(
      body.bookingId,
      body.amount,
    );

    return {
      message: 'Tạo link PayOS thành công',
      url: paymentData.checkoutUrl,
    };
  }

  @Get('sync-status/:orderCode')
  async syncStatus(@Param('orderCode') orderCode: string) {
    this.logger.log(`Syncing status for orderCode: ${orderCode}`);
    const success = await this.payosService.verifyAndSyncPayment(orderCode);
    return { success };
  }

  @Post('webhook')
  async handleWebhook(@Body() body: any) {
    this.logger.log(`Received PayOS webhook: ${JSON.stringify(body)}`);
    const success = await this.payosService.handleWebhook(body);

    if (!success) {
      return { success: false, message: 'Invalid signature or error' };
    }

    return { success: true };
  }
}
