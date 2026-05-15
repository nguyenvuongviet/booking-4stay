import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CollaborativeService } from './collaborative.service';
import { ContentBasedService } from './content-based.service';
import { ContextualBoostService } from './contextual-boost.service';
import { RecommendationCacheService } from './recommendation-cache.service';
import { RecommendationController } from './recommendation.controller';
import { RecommendationService } from './recommendation.service';

@Module({
  controllers: [RecommendationController],
  providers: [
    RecommendationService,
    RecommendationCacheService,
    ContentBasedService,
    CollaborativeService,
    ContextualBoostService,
    PrismaService,
  ],
  exports: [
    RecommendationService,
    RecommendationCacheService,
    ContentBasedService,
    CollaborativeService,
    ContextualBoostService,
  ],
})
export class RecommendationModule {}
