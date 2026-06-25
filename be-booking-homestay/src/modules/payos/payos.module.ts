import { Module } from '@nestjs/common';
import { BookingModule } from '../booking/booking.module';
import { PrismaService } from '../prisma/prisma.service';
import { PayosController } from './payos.controller';
import { PayosService } from './payos.service';

@Module({
  imports: [BookingModule],
  controllers: [PayosController],
  providers: [PayosService, PrismaService],
  exports: [PayosService],
})
export class PayosModule {}
