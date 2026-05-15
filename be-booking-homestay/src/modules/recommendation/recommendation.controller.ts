import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorator/public.decorator';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from '../user/dto/enum.dto';
import { CollaborativeService } from './collaborative.service';
import { ContentBasedService } from './content-based.service';
import { ContextualBoostService } from './contextual-boost.service';
import { RecommendationCacheService } from './recommendation-cache.service';
import { RecommendationService } from './recommendation.service';

@ApiTags('recommendation')
@Controller('recommendation')
export class RecommendationController {
  constructor(
    private readonly recommendationService: RecommendationService,
    private readonly cacheService: RecommendationCacheService,
    private readonly contentBasedService: ContentBasedService,
    private readonly collaborativeService: CollaborativeService,
    private readonly contextualBoostService: ContextualBoostService,
  ) {}

  /**
   * Gợi ý cá nhân hóa cho user đang đăng nhập.
   * Hybrid: Content-Based + Collaborative → Fallback Popularity.
   */
  @Get('for-you')
  @ApiBearerAuth('AccessToken')
  async getForYou(@Req() req: Request, @Query('limit') limit?: string) {
    const user = req['user'];
    const maxLimit = Math.min(Number(limit) || 12, 30);

    // 1. Content-Based (giá, tỉnh, amenity, capacity)
    const contentItems = await this.contentBasedService.getForYou(
      +user.id,
      maxLimit,
    );

    // 2. Collaborative (khách giống bạn cũng đặt...)
    const collabItems =
      await this.collaborativeService.getCollaborativeRecommendations(
        +user.id,
        Math.ceil(maxLimit / 2),
      );

    // 3. Merge & Deduplicate — content-based ưu tiên trước
    const seenIds = new Set<number>();
    const merged: any[] = [];

    for (const item of [...contentItems, ...collabItems]) {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);
        merged.push(item);
      }
    }

    if (merged.length > 0) {
      const strategy =
        contentItems.length > 0 && collabItems.length > 0
          ? 'hybrid'
          : contentItems.length > 0
            ? 'content-based'
            : 'collaborative';

      // 4. Contextual Boost — điều chỉnh điểm theo ngữ cảnh
      const boosted = await this.contextualBoostService.applyBoost(
        merged.slice(0, maxLimit),
      );

      return {
        message: 'Gợi ý dành riêng cho bạn',
        items: boosted,
        strategy,
      };
    }

    // 5. Fallback về popularity
    const popular = await this.recommendationService.getPopular(maxLimit);
    return {
      message: 'Phòng phổ biến',
      items: popular,
      strategy: 'popularity',
    };
  }

  /**
   * Phòng tương tự — dựa trên price, province, amenities.
   * Không cần đăng nhập.
   */
  @Get('similar/:roomId')
  @Public()
  async getSimilar(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Query('limit') limit?: string,
  ) {
    const items = await this.contentBasedService.getSimilar(
      roomId,
      Math.min(Number(limit) || 6, 12),
    );
    return { message: 'Phòng tương tự', items };
  }

  /**
   * Lấy danh sách phòng phổ biến nhất (theo popularity score).
   * Không cần đăng nhập.
   */
  @Get('popular')
  @Public()
  async getPopular(@Query('limit') limit?: string) {
    const items = await this.recommendationService.getPopular(
      Math.min(Number(limit) || 12, 30),
    );
    return { message: 'Danh sách phòng phổ biến', items };
  }

  /**
   * Lấy phòng đang trống trong N ngày tới (Host-side: fill empty rooms).
   * Không cần đăng nhập.
   */
  @Get('available-soon')
  @Public()
  async getAvailableSoon(
    @Query('days') days?: string,
    @Query('limit') limit?: string,
  ) {
    const items = await this.recommendationService.getAvailableSoon(
      Math.min(Number(days) || 7, 30),
      Math.min(Number(limit) || 8, 20),
    );
    return { message: 'Phòng đang trống sắp tới', items };
  }

  /**
   * Trigger thủ công tính lại Popularity Score + User Preferences.
   * Cần quyền ADMIN.
   */
  @Post('recalculate')
  @Roles(Role.ADMIN)
  @ApiBearerAuth('AccessToken')
  async recalculate() {
    await this.cacheService.recalculatePopularity();
    await this.contentBasedService.recalculateUserPreferences();
    return {
      message: 'Đã tính lại Popularity Score + User Preferences thành công',
    };
  }
}
