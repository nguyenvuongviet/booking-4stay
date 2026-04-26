import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from 'src/common/decorator/public.decorator';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from '../user/dto/enum.dto';
import { UploadFileDto } from 'src/common/dto/upload-file.dto';
import { CreateCountryDto } from './dto/create-country.dto';
import { CreateProvinceDto } from './dto/create-province.dto';
import { CreateWardDto } from './dto/create-ward.dto';
import { LocationQueryDto } from './dto/location-query.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { LocationService } from './location.service';

@ApiTags('location')
@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get('provinces/search')
  @Public()
  @ApiQuery({ name: 'keyword', required: false, example: 'Hà' })
  async searchProvinces(@Query('keyword') keyword?: string) {
    return this.locationService.searchProvinces(keyword);
  }

  @Get('countries')
  @Public()
  async getCountries(@Query() query: LocationQueryDto) {
    return await this.locationService.getCountries(query);
  }

  @Get('provinces')
  @Public()
  async getProvinces(@Query() query: LocationQueryDto) {
    return await this.locationService.getProvinces(query);
  }

  @Get('wards')
  @Public()
  async getWards(@Query() query: LocationQueryDto) {
    return await this.locationService.getWards(query);
  }

  @Post('admin/countries')
  @Roles(Role.ADMIN)
  @ApiBearerAuth('AccessToken')
  async createCountry(@Body() dto: CreateCountryDto) {
    return await this.locationService.createCountry(dto);
  }

  @Post('admin/provinces')
  @Roles(Role.ADMIN)
  @ApiBearerAuth('AccessToken')
  async createProvince(@Body() dto: CreateProvinceDto) {
    return await this.locationService.createProvince(dto);
  }

  @Post('admin/wards')
  @Roles(Role.ADMIN)
  @ApiBearerAuth('AccessToken')
  async createWard(@Body() dto: CreateWardDto) {
    return await this.locationService.createWard(dto);
  }

  @Patch('admin/:type/:id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth('AccessToken')
  @ApiParam({
    name: 'type',
    required: true,
    enum: ['country', 'province', 'ward'],
    description: 'Loại location cần cập nhật',
  })
  async updateLocation(
    @Param('type') type: string,
    @Param('id') id: string,
    @Body() dto: UpdateLocationDto,
  ) {
    return await this.locationService.updateLocation(type, +id, dto);
  }

  @Delete('admin/:type/:id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth('AccessToken')
  @ApiParam({
    name: 'type',
    required: true,
    enum: ['country', 'province', 'ward'],
    description: 'Loại location cần xóa',
  })
  async deleteLocation(@Param('type') type: string, @Param('id') id: string) {
    return await this.locationService.deleteLocation(type, +id);
  }

  @Put('admin/provinces/:id/image')
  @Roles(Role.ADMIN)
  @ApiBearerAuth('AccessToken')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({ type: UploadFileDto })
  @ApiParam({ name: 'id', required: true, example: '1' })
  async setProvinceImage(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') id: string,
  ) {
    return await this.locationService.setProvinceImage(+id, file);
  }
}
