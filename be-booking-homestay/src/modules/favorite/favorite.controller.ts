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
import { FavoriteService } from './favorite.service';

@ApiTags('favorites')
@Controller('favorites')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  /**
   * Toggle yêu thích phòng (thêm nếu chưa có, bỏ nếu đã có).
   */
  @Post(':roomId')
  @ApiBearerAuth('AccessToken')
  async toggle(
    @Req() req: Request,
    @Param('roomId', ParseIntPipe) roomId: number,
  ) {
    const user = req['user'];
    return this.favoriteService.toggle(+user.id, roomId);
  }

  /**
   * Lấy danh sách phòng yêu thích của user (có phân trang).
   */
  @Get()
  @ApiBearerAuth('AccessToken')
  async findAll(
    @Req() req: Request,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const user = req['user'];
    return this.favoriteService.findAll(
      +user.id,
      Number(page) || 1,
      Number(pageSize) || 12,
    );
  }

  /**
   * Kiểm tra user đã yêu thích phòng chưa.
   */
  @Get('check/:roomId')
  @ApiBearerAuth('AccessToken')
  async check(
    @Req() req: Request,
    @Param('roomId', ParseIntPipe) roomId: number,
  ) {
    const user = req['user'];
    return this.favoriteService.check(+user.id, roomId);
  }

  /**
   * Kiểm tra hàng loạt roomIds đã yêu thích chưa.
   * GET /favorites/check-bulk?roomIds=1,2,3
   */
  @Get('check-bulk')
  @ApiBearerAuth('AccessToken')
  async checkBulk(@Req() req: Request, @Query('roomIds') roomIds: string) {
    const user = req['user'];
    const ids = (roomIds || '')
      .split(',')
      .map(Number)
      .filter((n) => !isNaN(n) && n > 0);
    return this.favoriteService.checkBulk(+user.id, ids);
  }
}
