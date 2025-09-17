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

  @Post('/:id/upload-avatar')
  // @UseInterceptors(uploadConfig('avatar', 2))
  @ApiParam({ name: 'id', type: String, description: 'User ID', example: '1' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadFileDto, description: 'File upload' })
  async uploadAvatar(
    @Param('id') id: string,
    @UploadedFile() file: UploadFileDto,
  ) {
    return await this.userService.uploadAvatar(+id, file);
  }
}
