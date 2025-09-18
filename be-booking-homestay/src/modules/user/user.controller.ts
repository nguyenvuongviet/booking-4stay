import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/common/decorator/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserFilterDto } from './dto/user-filter.dto';
import { UserService } from './user.service';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';
import { UploadFileDto } from 'src/common/dto/upload-file.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { uploadLocalConfig } from 'src/config/upload-local.config';

@ApiTags('user')
@ApiBearerAuth('AccessToken')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('admin/all')
  @ApiTags('admin')
  @Roles('ADMIN')
  async findAll() {
    return await this.userService.findAll();
  }

  @Get('admin/all-filtered')
  @ApiTags('admin')
  @Roles('ADMIN')
  async findAllFiltered(@Query() query: UserFilterDto) {
    return await this.userService.findAllFiltered(query);
  }

  @Post('admin/create')
  @ApiTags('admin')
  @Roles('ADMIN')
  @ApiBody({ type: CreateUserDto })
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.userService.create(createUserDto);
  }

  @Get('admin/profile/:id')
  @ApiTags('admin')
  @Roles('ADMIN')
  @ApiParam({ name: 'id', type: String, description: 'User ID', example: '1' })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Get('admin/list-roles')
  @ApiTags('admin')
  @Roles('ADMIN')
  async listRoles() {
    return await this.userService.listRoles();
  }

  @Patch('update/:id')
  @ApiParam({ name: 'id', type: String, description: 'User ID', example: '1' })
  @ApiBody({ type: UpdateUserDto })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Patch('admin/update/:id')
  @Roles('ADMIN')
  @ApiTags('admin')
  @ApiParam({ name: 'id', type: String, description: 'User ID', example: '1' })
  @ApiBody({ type: UpdateUserAdminDto })
  adminUpdate(
    @Param('id') id: string,
    @Body() updateUserAdminDto: UpdateUserAdminDto,
  ) {
    return this.userService.adminUpdate(+id, updateUserAdminDto);
  }

  @Delete('admin/delete/:id')
  @Roles('ADMIN')
  @ApiTags('admin')
  @ApiParam({ name: 'id', type: String, description: 'User ID', example: '1' })
  delete(@Param('id') id: string) {
    return this.userService.delete(+id);
  }

  @Post('/:id/avatar-local')
  @UseInterceptors(uploadLocalConfig('images', 'avatar', 2))
  @ApiParam({ name: 'id', type: String, description: 'User ID', example: '1' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload file',
    type: UploadFileDto,
  })
  async avatarLocal(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.userService.avatarLocal(+id, file);
  }

  @Post('/:id/avatar-cloudinary')
  @UseInterceptors(FileInterceptor('file'))
  @ApiParam({ name: 'id', type: String, description: 'User ID', example: '1' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload file',
    type: UploadFileDto,
  })
  async avatarCloudinary(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.userService.avatarCloudinary(+id, file);
  }
}
