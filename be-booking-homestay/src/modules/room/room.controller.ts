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
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomFilterDto } from './dto/filter-room.dto';
import { SetRoomAmenitiesDto } from './dto/set-room-amenities.dto';
import { SetRoomBedsDto } from './dto/set-room-beds.dto';
import { DeleteRoomImagesDto, ImageItemDto } from './dto/set-room-images.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomService } from './room.service';

@ApiTags('room')
@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

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
  @Roles('ADMIN')
  @ApiBearerAuth('AccessToken')
  async create(@Req() req: Request, @Body() createRoomDto: CreateRoomDto) {
    const user = req['user'];
    return await this.roomService.create(+user.id, createRoomDto);
  }

  @Patch('admin/:id')
  @Roles('ADMIN')
  @ApiBearerAuth('AccessToken')
  async update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
    return await this.roomService.update(+id, updateRoomDto);
  }

  @Delete('admin/:id')
  @Roles('ADMIN')
  @ApiBearerAuth('AccessToken')
  remove(@Param('id') id: string) {
    return this.roomService.remove(+id);
  }

  @Put(':id/amenities')
  @Roles('ADMIN')
  @ApiBearerAuth('AccessToken')
  @ApiBody({ type: SetRoomAmenitiesDto })
  async setAmenities(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SetRoomAmenitiesDto,
  ) {
    return this.roomService.setAmenities(id, dto.amenityIds);
  }

  @Put(':id/beds')
  @Roles('ADMIN')
  @ApiBearerAuth('AccessToken')
  @ApiBody({ type: SetRoomBedsDto })
  async setBeds(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SetRoomBedsDto,
  ) {
    return this.roomService.setBeds(id, dto.beds);
  }

  @Post(':id/images')
  @Roles('ADMIN')
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
    return this.roomService.addRoomImages(id, files, images);
  }

  @Delete(':id/images')
  @Roles('ADMIN')
  @ApiBearerAuth('AccessToken')
  @ApiBody({ type: DeleteRoomImagesDto })
  async deleteRoomImages(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: DeleteRoomImagesDto,
  ) {
    return this.roomService.deleteRoomImagesByIds(id, dto.imageIds);
  }
}
