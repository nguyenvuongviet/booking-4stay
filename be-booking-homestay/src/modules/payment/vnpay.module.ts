import { Module } from '@nestjs/common';
import { BookingModule } from '../booking/booking.module';
import { PrismaService } from '../prisma/prisma.service';
import { VNPayController } from './vnpay.controller';
import { VNPayService } from './vnpay.service';

@Module({
  imports: [BookingModule],
  providers: [VNPayService, PrismaService],
  controllers: [VNPayController],
  exports: [VNPayService],
})
export class VNPayModule {}
