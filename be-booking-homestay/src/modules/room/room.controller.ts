import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorator/public.decorator';
import { Roles } from 'src/common/decorator/roles.decorator';
import { UploadRoomImagesDto } from 'src/common/dto/upload-file.dto';
import { Role } from '../user/dto/enum.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomFilterDto } from './dto/filter-room.dto';
import {
  RoomCalendarQueryDto,
  UpdateCalendarDto,
} from './dto/room-calendar.dto';
import { SetRoomAmenitiesDto } from './dto/set-room-amenities.dto';
import { SetRoomBedsDto } from './dto/set-room-beds.dto';
import { DeleteRoomImagesDto, ImageItemDto } from './dto/set-room-images.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomAssetService } from './room-asset.service';
import { RoomCalendarService } from './room-calendar.service';
import { RoomService } from './room.service';

@ApiTags('room')
@Controller('room')
export class RoomController {
  constructor(
    private readonly roomService: RoomService,
    private readonly assetService: RoomAssetService,
    private readonly calendarService: RoomCalendarService,
  ) {}

  @Get('all')
  @Public()
  async findAll(@Query() query: RoomFilterDto) {
    return await this.roomService.findAll(query);
  }

  @Get(':id')
  @Public()
  async findOne(@Param('id') id: string) {
    return await this.roomService.findOne(+id);
  }

  @Post('admin')
  @Roles(Role.ADMIN)
  @ApiBearerAuth('AccessToken')
  async create(@Req() req: Request, @Body() createRoomDto: CreateRoomDto) {
    const user = req['user'];
    return await this.roomService.create(+user.id, createRoomDto);
  }

  @Patch('admin/:id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth('AccessToken')
  async update(@Param('id') id: string, @Body() dto: UpdateRoomDto) {
    return await this.roomService.update(+id, dto);
  }

  @Delete('admin/:id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth('AccessToken')
  remove(@Param('id') id: string) {
    return this.roomService.remove(+id);
  }

  @Put(':id/amenities')
  @Roles(Role.ADMIN)
  @ApiBearerAuth('AccessToken')
  @ApiBody({ type: SetRoomAmenitiesDto })
  async setAmenities(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SetRoomAmenitiesDto,
  ) {
    return this.assetService.setAmenities(id, dto.amenityIds);
  }

  @Put(':id/beds')
  @Roles(Role.ADMIN)
  @ApiBearerAuth('AccessToken')
  @ApiBody({ type: SetRoomBedsDto })
  async setBeds(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SetRoomBedsDto,
  ) {
    return this.assetService.setBeds(id, dto.beds);
  }

  @Post(':id/images')
  @Roles(Role.ADMIN)
  @ApiBearerAuth('AccessToken')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files'))
  @ApiBody({ type: UploadRoomImagesDto })
  async addRoomImages(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: Express.Multer.File[],
    @Body('images') imagesJson?: string,
  ) {
    const images: ImageItemDto[] = imagesJson ? JSON.parse(imagesJson) : [];
    return this.assetService.addRoomImages(id, files, images);
  }

  @Delete(':id/images')
  @Roles(Role.ADMIN)
  @ApiBearerAuth('AccessToken')
  @ApiBody({ type: DeleteRoomImagesDto })
  async deleteRoomImages(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: DeleteRoomImagesDto,
  ) {
    return this.assetService.deleteRoomImagesByIds(id, dto.imageIds);
  }

  @Patch(':id/images/main')
  @Roles(Role.ADMIN)
  @ApiBearerAuth('AccessToken')
  async setMainImage(
    @Param('id', ParseIntPipe) roomId: number,
    @Body('imageId', ParseIntPipe) imageId: number,
  ) {
    return this.assetService.setMainImage(roomId, imageId);
  }

  @Patch(':id/images/order')
  @Roles(Role.ADMIN)
  @ApiBearerAuth('AccessToken')
  async updateOrder(
    @Param('id', ParseIntPipe) roomId: number,
    @Body('order') order: number[],
  ) {
    return this.assetService.updateImageOrder(roomId, order);
  }

  @Get(':id/calendar')
  @Public()
  async getCalendar(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: RoomCalendarQueryDto,
  ) {
    return this.calendarService.getCalendar(id, query);
  }

  @Put(':id/calendar')
  @Roles(Role.ADMIN)
  @ApiBearerAuth('AccessToken')
  @ApiBody({ type: UpdateCalendarDto })
  async updateCalendar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCalendarDto,
  ) {
    return this.calendarService.updateCalendar(id, dto.updates);
  }
}
