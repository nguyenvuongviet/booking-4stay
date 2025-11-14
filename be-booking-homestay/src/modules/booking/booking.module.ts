import { Module } from '@nestjs/common';
import { AvailabilityHelper } from 'src/helpers/availability.helper';
import { LoyaltyProgram } from 'src/helpers/loyalty.helper';
import { PricingHelper } from 'src/helpers/pricing.helper';
import { PrismaService } from '../prisma/prisma.service';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';

@Module({
  controllers: [BookingController],
  providers: [
    BookingService,
    PrismaService,
    PricingHelper,
    AvailabilityHelper,
    LoyaltyProgram,
  ],
  exports: [BookingService],
})
export class BookingModule {}
