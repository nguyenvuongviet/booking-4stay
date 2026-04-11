import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorator/roles.decorator';
import { AppConfigsService } from './app-configs.service';
import { AppConfigKey } from './constants/app-config.constant';

@ApiTags('app configs')
@Controller('app-configs')
@ApiBearerAuth('AccessToken')
export class AppConfigsController {
  constructor(private readonly appConfigsService: AppConfigsService) {}

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Lấy toàn bộ danh sách cấu hình hệ thống (Admin)' })
  async getAllConfigs() {
    return this.appConfigsService.findAll();
  }

  @Patch(':key')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Cập nhật giá trị một cấu hình (Admin)' })
  async updateConfig(
    @Param('key') key: string,
    @Body() body: { value: any; description?: string },
    @Req() req: Request,
  ) {
    const user = req['user'];
    return this.appConfigsService.setConfigValue(
      key as AppConfigKey,
      body.value,
      body.description,
      user?.id ? +user.id : undefined,
    );
  }
}
