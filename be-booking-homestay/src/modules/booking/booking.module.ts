import { Module } from '@nestjs/common';
import { AvailabilityHelper } from 'src/helpers/availability.helper';
import { LoyaltyProgram } from 'src/helpers/loyalty.helper';
import { PricingHelper } from 'src/helpers/pricing.helper';
import { MailService } from '../mail/mail.service';
import { NotificationModule } from '../notification/notification.module';
import { PrismaService } from '../prisma/prisma.service';
import { PromotionModule } from '../promotion/promotion.module';
import { BookingCancelRefundService } from './booking-cancel-refund.service';
import { BookingLifecycleService } from './booking-lifecycle.service';
import { BookingQueryService } from './booking-query.service';
import { BookingController } from './booking.controller';
import { BookingCron } from './booking.cron';
import { BookingService } from './booking.service';

@Module({
  imports: [NotificationModule, PromotionModule],
  controllers: [BookingController],
  providers: [
    BookingService,
    BookingLifecycleService,
    BookingCancelRefundService,
    BookingQueryService,
    PrismaService,
    PricingHelper,
    AvailabilityHelper,
    LoyaltyProgram,
    MailService,
    BookingCron,
  ],
  exports: [BookingService, BookingLifecycleService, BookingQueryService],
})
export class BookingModule {}
