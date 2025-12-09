import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoyaltyService } from './loyalty.service';
import { CreateLoyaltyLevelDto } from './dto/create-loyalty-level.dto';
import { UpdateLoyaltyLevelDto } from './dto/update-loyalty-level.dto';
import { UpdateUserLoyaltyDto } from './dto/update-user-loyalty.dto';
import { Roles } from 'src/common/decorator/roles.decorator';

@ApiTags('loyalty')
@ApiBearerAuth('AccessToken')
@Controller('loyalty')
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  @Get('levels')
  @Roles('ADMIN')
  findAllLevels() {
    return this.loyaltyService.findAllLevels();
  }

  @Post('levels')
  @Roles('ADMIN')
  createLevel(@Body() dto: CreateLoyaltyLevelDto) {
    return this.loyaltyService.createLevel(dto);
  }

  @Patch('levels/:id')
  @Roles('ADMIN')
  updateLevel(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLoyaltyLevelDto,
  ) {
    return this.loyaltyService.updateLevel(id, dto);
  }

  @Patch('levels/:id/toggle-active')
  @Roles('ADMIN')
  toggleActive(@Param('id', ParseIntPipe) id: number) {
    return this.loyaltyService.toggleActive(id);
  }

  @Post('recompute')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Cập nhật thông tin cấp độ loyalty (Admin)' })
  async recomputeLevels() {
    return this.loyaltyService.recomputeAllUserLevels();
  }

  @Get('users/all')
  @Roles('ADMIN')
  findAllUserLoyalty() {
    return this.loyaltyService.findAllUserLoyalty();
  }

  @Get('user/:userId')
  findUserLoyalty(@Param('userId', ParseIntPipe) userId: number) {
    return this.loyaltyService.findUserLoyalty(userId);
  }

  @Patch('user/:userId')
  @Roles('ADMIN')
  updateUserLoyalty(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: UpdateUserLoyaltyDto,
  ) {
    return this.loyaltyService.updateUserLoyalty(userId, dto);
  }
}
