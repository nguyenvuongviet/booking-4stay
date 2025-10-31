import { Module } from '@nestjs/common';
import { VNPayService } from './vnpay.service';
import { VNPayController } from './vnpay.controller';
import { BookingModule } from '../booking/booking.module';

@Module({
  imports: [BookingModule],
  providers: [VNPayService],
  controllers: [VNPayController],
  exports: [VNPayService],
})
export class VNPayModule {}
