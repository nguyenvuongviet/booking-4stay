import { Body, Controller, Get, Param, Patch, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorator/public.decorator';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from '../user/dto/enum.dto';
import { AppConfigsService } from './app-configs.service';
import { AppConfigKey } from './constants/app-config.constant';

@ApiTags('app configs')
@Controller('app-configs')
@ApiBearerAuth('AccessToken')
export class AppConfigsController {
  constructor(private readonly appConfigsService: AppConfigsService) {}

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Lấy toàn bộ danh sách cấu hình hệ thống (Admin)' })
  async getAllConfigs() {
    return this.appConfigsService.findAll();
  }

  @Get('public')
  @Public()
  @ApiOperation({ summary: 'Lấy các cấu hình công khai cho khách hàng' })
  async getPublicConfigs() {
    const keys = [
      AppConfigKey.CANCELLATION_POLICY,
      AppConfigKey.SITE_NAME,
      AppConfigKey.CONTACT_EMAIL,
    ];
    const configs = await this.appConfigsService.findAll();
    return configs.filter((c) => keys.includes(c.key as AppConfigKey));
  }

  @Patch(':key')
  @Roles(Role.ADMIN)
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
