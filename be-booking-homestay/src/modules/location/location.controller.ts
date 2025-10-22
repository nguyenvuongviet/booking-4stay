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
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorator/public.decorator';
import { Roles } from 'src/common/decorator/roles.decorator';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { LocationService } from './location.service';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadFileDto } from 'src/common/dto/upload-file.dto';

@ApiTags('location')
@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get('all')
  @Public()
  async findAll() {
    return await this.locationService.findAll();
  }

  @Get('provinces/list/all')
  @Public()
  async provinces() {
    return this.locationService.listProvinces();
  }

  @Get('search')
  @Public()
  async search(@Query() query: PaginationQueryDto) {
    return this.locationService.search(query);
  }

  @Get('provinces/:province/districts')
  @Public()
  async districts(@Param('province') province: string) {
    return this.locationService.listDistricts(province);
  }

  @Get('provinces/:province/districts/:district/wards')
  @Public()
  async wards(
    @Param('province') province: string,
    @Param('district') district: string,
  ) {
    return this.locationService.listWards(province, district);
  }

  @Post('admin')
  @ApiBearerAuth('AccessToken')
  @Roles('ADMIN')
  async create(@Body() createLocationDto: CreateLocationDto) {
    return await this.locationService.create(createLocationDto);
  }

  @Get('admin/:id')
  @ApiBearerAuth('AccessToken')
  @Roles('ADMIN')
  async findOne(@Param('id') id: string) {
    return await this.locationService.findOne(+id);
  }

  @Patch('admin/:id')
  @ApiBearerAuth('AccessToken')
  @Roles('ADMIN')
  async update(
    @Param('id') id: string,
    @Body() updateLocationDto: UpdateLocationDto,
  ) {
    return await this.locationService.update(+id, updateLocationDto);
  }

  @Delete('admin/:id')
  @ApiBearerAuth('AccessToken')
  @Roles('ADMIN')
  async remove(@Param('id') id: string) {
    return await this.locationService.remove(+id);
  }

  @Put('province-image')
  @ApiBearerAuth('AccessToken')
  @Roles('ADMIN')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({ type: UploadFileDto })
  @ApiQuery({ name: 'province', required: true, example: 'Hà Nội' })
  async setProvinceImage(
    @UploadedFile() file: Express.Multer.File,
    @Query('province') province: string,
  ) {
    return this.locationService.setProvinceImage(province, file);
  }

  @Delete('province-image')
  @ApiBearerAuth('AccessToken')
  @Roles('ADMIN')
  @ApiQuery({ name: 'province', required: true, example: 'Hà Nội' })
  async deleteProvinceImage(@Query('province') province: string) {
    return this.locationService.deleteProvinceImage(province);
  }
}
