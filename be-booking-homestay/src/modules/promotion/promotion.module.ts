import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PromotionPublicController } from './promotion-public.controller';
import { PromotionController } from './promotion.controller';
import { PromotionHelper } from './promotion.helper';
import { PromotionService } from './promotion.service';

@Module({
  controllers: [PromotionController, PromotionPublicController],
  providers: [PromotionService, PromotionHelper, PrismaService],
  exports: [PromotionService, PromotionHelper],
})
export class PromotionModule {}
