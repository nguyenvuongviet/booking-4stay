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
import { PromotionHelper } from './promotion.helper';
import { PromotionService } from './promotion.service';

@ApiTags('promotions')
@Controller('promotions')
export class PromotionPublicController {
  constructor(
    private readonly promotionService: PromotionService,
    private readonly promotionHelper: PromotionHelper,
  ) {}

  /**
   * Validate mã coupon trước checkout (User).
   */
  @Get('validate')
  @ApiBearerAuth('AccessToken')
  async validateCoupon(
    @Req() req: Request,
    @Query('code') code: string,
    @Query('total') total: string,
    @Query('provinceId') provinceId?: string,
  ) {
    const user = req['user'];
    return this.promotionHelper.validateCoupon(
      code,
      +user.id,
      Number(total),
      provinceId ? Number(provinceId) : undefined,
    );
  }

  /**
   * Gợi ý coupon phù hợp cho user tại checkout.
   */
  @Get('suggestions')
  @ApiBearerAuth('AccessToken')
  async getSuggestions(
    @Req() req: Request,
    @Query('provinceId') provinceId?: string,
    @Query('total') total?: string,
  ) {
    const user = req['user'];
    return this.promotionService.getSuggestions(
      +user.id,
      provinceId ? Number(provinceId) : undefined,
      total ? Number(total) : undefined,
    );
  }

  /**
   * Lưu coupon vào ví (User).
   */
  @Post('collect/:id')
  @ApiBearerAuth('AccessToken')
  async collect(
    @Req() req: Request,
    @Param('id', ParseIntPipe) promotionId: number,
  ) {
    const user = req['user'];
    return this.promotionService.collectCoupon(+user.id, promotionId);
  }

  /**
   * Lấy ví voucher (User).
   */
  @Get('wallet')
  @ApiBearerAuth('AccessToken')
  async getWallet(@Req() req: Request, @Query('status') status?: string) {
    const user = req['user'];
    return this.promotionService.getWallet(+user.id, status);
  }

  /**
   * Lấy coupon gắn trong bài blog (Public).
   */
  @Get('blog/:postId')
  @Public()
  async getBlogCoupons(@Param('postId', ParseIntPipe) postId: number) {
    return this.promotionService.getBlogCoupons(postId);
  }
}
