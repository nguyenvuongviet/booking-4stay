import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Logger,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Public } from 'src/common/decorator/public.decorator';
import { Role } from '../user/dto/enum.dto';
import { PayosService } from './payos.service';

@Controller('payos')
export class PayosController {
  private readonly logger = new Logger(PayosController.name);

  constructor(private readonly payosService: PayosService) {}

  @Post('create-link')
  @ApiBearerAuth('AccessToken')
  async createLink(
    @Req() req: any,
    @Body() body: { bookingId: number; paymentPurpose?: 'DEPOSIT' | 'FULL' },
  ) {
    if (!body.bookingId)
      throw new BadRequestException('Thiếu tham số bookingId');

    const user = req['user'];
    if (!user)
      throw new ForbiddenException('Bạn cần đăng nhập để thực hiện thanh toán');

    const roles = user.user_roles?.map((ur: any) => ur.roles?.name) || [];
    const role = roles.includes(Role.ADMIN) ? Role.ADMIN : Role.USER;

    const paymentData = await this.payosService.createPaymentLink(
      +user.id,
      role,
      body.bookingId,
      body.paymentPurpose,
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
  @Public()
  async handleWebhook(@Body() body: any) {
    this.logger.log(`Received PayOS webhook: ${JSON.stringify(body)}`);
    const success = await this.payosService.handleWebhook(body);

    if (!success)
      return { success: false, message: 'Invalid signature or error' };

    return { success: true };
  }
}
