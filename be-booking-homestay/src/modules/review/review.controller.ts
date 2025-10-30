import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorator/public.decorator';
import { CreateReviewDto } from './dto/create-review.dto';
import { ListReviewQuery } from './dto/list-review.query';
import { ReviewService } from './review.service';

@ApiTags('review')
@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @ApiBearerAuth('AccessToken')
  async create(@Req() req: Request, @Body() dto: CreateReviewDto) {
    const user = req['user'];
    return this.reviewService.create(+user.id, dto);
  }

  @Get('rooms/:roomId/')
  @Public()
  async listByRoom(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Query() q: ListReviewQuery,
  ) {
    return this.reviewService.listByRoom(roomId, q);
  }

  @Delete('reviews/:id')
  @ApiBearerAuth('AccessToken')
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const user = req['user'];
    return this.reviewService.remove(id, +user.id, user.role);
  }
}
