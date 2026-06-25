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
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from '../user/dto/enum.dto';
import { Public } from 'src/common/decorator/public.decorator';

@ApiTags('loyalty')
@ApiBearerAuth('AccessToken')
@Controller('loyalty')
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) { }

  @Get('levels')
  @Roles(Role.ADMIN)
  findAllLevels() {
    return this.loyaltyService.findAllLevels();
  }

  @Get('levels/public')
  @Public()
  @ApiOperation({ summary: 'Lấy các cấp độ loyalty công khai cho khách hàng' })
  findActiveLevels() {
    return this.loyaltyService.findActiveLevels();
  }

  @Post('levels')
  @Roles(Role.ADMIN)
  createLevel(@Body() dto: CreateLoyaltyLevelDto) {
    return this.loyaltyService.createLevel(dto);
  }

  @Patch('levels/:id')
  @Roles(Role.ADMIN)
  updateLevel(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLoyaltyLevelDto,
  ) {
    return this.loyaltyService.updateLevel(id, dto);
  }

  @Patch('levels/:id/toggle-active')
  @Roles(Role.ADMIN)
  toggleActive(@Param('id', ParseIntPipe) id: number) {
    return this.loyaltyService.toggleActive(id);
  }

  @Post('recompute')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Cập nhật thông tin cấp độ loyalty (Admin)' })
  async recomputeLevels() {
    return this.loyaltyService.recomputeAllUserLevels();
  }

  @Get('users/all')
  @Roles(Role.ADMIN)
  findAllUserLoyalty() {
    return this.loyaltyService.findAllUserLoyalty();
  }
}
