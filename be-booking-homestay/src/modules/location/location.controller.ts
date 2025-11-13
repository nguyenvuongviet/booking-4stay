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
import { UploadFileDto } from 'src/common/dto/upload-file.dto';
import { CreateCountryDto } from './dto/create-country.dto';
import { CreateDistrictDto } from './dto/create-district.dto';
import { CreateProvinceDto } from './dto/create-province.dto';
import { CreateWardDto } from './dto/create-ward.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { LocationService } from './location.service';

@ApiTags('location')
@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get('provinces/search')
  @Public()
  @ApiQuery({ name: 'keyword', required: true, example: 'Hà' })
  async searchProvinces(@Query('keyword') keyword: string) {
    return this.locationService.searchProvinces(keyword);
  }

  // PUBLIC — Dropdown chọn vị trí
  @Get('countries')
  @Public()
  async getCountries() {
    return this.locationService.getCountries();
  }

  @Get('provinces')
  @Public()
  @ApiQuery({ name: 'countryId', required: true, example: 1 })
  async getProvinces(@Query('countryId') countryId?: number) {
    return this.locationService.getProvinces(countryId);
  }

  @Get('districts')
  @ApiQuery({ name: 'provinceId', required: true, example: 1 })
  @Public()
  async getDistricts(@Query('provinceId') provinceId: number) {
    return this.locationService.getDistricts(provinceId);
  }

  @Get('wards')
  @ApiQuery({ name: 'districtId', required: true, example: 1 })
  @Public()
  async getWards(@Query('districtId') districtId: number) {
    return this.locationService.getWards(districtId);
  }

  // ADMIN — CRUD + Upload + Import
  // --- CREATE ---
  @Post('admin/countries')
  @Roles('ADMIN')
  @ApiBearerAuth('AccessToken')
  async createCountry(@Body() dto: CreateCountryDto) {
    return this.locationService.createCountry(dto);
  }

  @Post('admin/provinces')
  @Roles('ADMIN')
  @ApiBearerAuth('AccessToken')
  async createProvince(@Body() dto: CreateProvinceDto) {
    return this.locationService.createProvince(dto);
  }

  @Post('admin/districts')
  @Roles('ADMIN')
  @ApiBearerAuth('AccessToken')
  async createDistrict(@Body() dto: CreateDistrictDto) {
    return this.locationService.createDistrict(dto);
  }

  @Post('admin/wards')
  @Roles('ADMIN')
  @ApiBearerAuth('AccessToken')
  async createWard(@Body() dto: CreateWardDto) {
    return this.locationService.createWard(dto);
  }

  // --- UPDATE ---
  @Patch('admin/:type/:id')
  @Roles('ADMIN')
  @ApiBearerAuth('AccessToken')
  @ApiParam({
    name: 'type',
    required: true,
    enum: ['country', 'province', 'district', 'ward'],
    description: 'Loại location cần cập nhật hoặc xóa',
  })
  async updateLocation(
    @Param('type') type: string,
    @Param('id') id: string,
    @Body() dto: UpdateLocationDto,
  ) {
    return this.locationService.updateLocation(type, +id, dto);
  }

  // --- DELETE ---
  @Delete('admin/:type/:id')
  @Roles('ADMIN')
  @ApiBearerAuth('AccessToken')
  @ApiParam({
    name: 'type',
    required: true,
    enum: ['country', 'province', 'district', 'ward'],
    description: 'Loại location cần cập nhật hoặc xóa',
  })
  async deleteLocation(@Param('type') type: string, @Param('id') id: string) {
    return this.locationService.deleteLocation(type, +id);
  }

  // --- UPLOAD ẢNH TỈNH/THÀNH ---
  @Put('admin/province-image')
  @Roles('ADMIN')
  @ApiBearerAuth('AccessToken')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiQuery({ name: 'province', required: true, example: 'Hà Nội' })
  @ApiBody({ type: UploadFileDto })
  async setProvinceImage(
    @UploadedFile() file: Express.Multer.File,
    @Query('province') province: string,
  ) {
    return this.locationService.setProvinceImage(province, file);
  }

  @Delete('admin/province-image')
  @Roles('ADMIN')
  @ApiBearerAuth('AccessToken')
  @ApiQuery({ name: 'province', required: true, example: 'Hà Nội' })
  async deleteProvinceImage(@Query('province') province: string) {
    return this.locationService.deleteProvinceImage(province);
  }

  // --- IMPORT FILE CSV/EXCEL ---
  @Post('admin/import')
  @Roles('ADMIN')
  @ApiBearerAuth('AccessToken')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({ type: UploadFileDto })
  async importLocation(@UploadedFile() file: Express.Multer.File) {
    return this.locationService.importFromFile(file);
  }
}
