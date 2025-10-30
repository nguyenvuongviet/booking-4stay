import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/common/decorator/roles.decorator';
import { UploadFileDto } from 'src/common/dto/upload-file.dto';
import { uploadLocalConfig } from 'src/config/upload-local.config';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserFilterDto } from './dto/filter-user.dto';
import { UserService } from './user.service';

@ApiTags('user')
@ApiBearerAuth('AccessToken')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Patch('update')
  async update(@Body() updateUserDto: UpdateUserDto, @Req() req: Request) {
    const user = req['user'];
    return await this.userService.update(+user.id, updateUserDto);
  }

  @Post('/avatar-local')
  @UseInterceptors(uploadLocalConfig('images', 'avatar', 2))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload file',
    type: UploadFileDto,
  })
  async avatarLocal(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const user = req['user'];
    return await this.userService.avatarLocal(+user.id, file);
  }

  @Post('/avatar-cloudinary')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload file',
    type: UploadFileDto,
  })
  async avatarCloudinary(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const user = req['user'];
    return await this.userService.avatarCloudinary(+user.id, file);
  }

  @Post('admin/create')
  @Roles('ADMIN')
  @ApiBody({ type: CreateUserDto })
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.userService.create(createUserDto);
  }

  @Get('admin/list-roles')
  @Roles('ADMIN')
  async listRoles() {
    return await this.userService.listRoles();
  }

  @Get('admin/all')
  @Roles('ADMIN')
  async findAll() {
    return await this.userService.findAll();
  }

  @Get('admin/all-filtered')
  @Roles('ADMIN')
  async findAllFiltered(@Query() query: UserFilterDto) {
    return await this.userService.findAllFiltered(query);
  }

  @Get('admin/profile/:id')
  @Roles('ADMIN')
  @ApiParam({ name: 'id', type: String, description: 'User ID', example: '1' })
  async findOne(@Param('id') id: string) {
    return await this.userService.findOne(+id);
  }

  @Patch('admin/update/:id')
  @Roles('ADMIN')
  @ApiParam({ name: 'id', type: String, description: 'User ID', example: '1' })
  @ApiBody({ type: UpdateUserAdminDto })
  async adminUpdate(
    @Param('id') id: string,
    @Body() updateUserAdminDto: UpdateUserAdminDto,
  ) {
    return await this.userService.adminUpdate(+id, updateUserAdminDto);
  }

  @Delete('admin/delete/:id')
  @Roles('ADMIN')
  @ApiParam({ name: 'id', type: String, description: 'User ID', example: '1' })
  async delete(@Param('id') id: string) {
    return await this.userService.delete(+id);
  }

  @Post('admin/:id/avatar-local')
  @UseInterceptors(uploadLocalConfig('images', 'avatar', 2))
  @ApiParam({ name: 'id', type: String, description: 'User ID', example: '1' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload file',
    type: UploadFileDto,
  })
  async adminAvatarLocal(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.userService.avatarLocal(+id, file);
  }

  @Post('admin/:id/avatar-cloudinary')
  @UseInterceptors(FileInterceptor('file'))
  @ApiParam({ name: 'id', type: String, description: 'User ID', example: '1' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload file',
    type: UploadFileDto,
  })
  async adminAvatarCloudinary(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.userService.avatarCloudinary(+id, file);
  }
}
