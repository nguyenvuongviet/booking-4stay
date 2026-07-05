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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/common/decorator/roles.decorator';
import { UploadFileDto } from 'src/common/dto/upload-file.dto';
import { BlogService } from './blog.service';
import {
  ChangePostStatusDto,
  CreateCategoryDto,
  CreatePostDto,
  CreateTagDto,
  QueryCommentDto,
  QueryPostDto,
  UpdateCategoryDto,
  UpdatePostDto,
} from './dto/blog.dto';

@ApiTags('Blog (Admin)')
@Controller('admin/blog')
@Roles('admin')
@ApiBearerAuth()
export class BlogAdminController {
  constructor(private readonly blogService: BlogService) {}

  // ==================== POSTS ====================

  @Get('posts')
  @ApiOperation({ summary: 'Danh sách tất cả bài viết (kể cả DRAFT)' })
  async getPosts(@Query() query: QueryPostDto) {
    return this.blogService.getAdminPosts(query);
  }

  @Get('posts/:id')
  @ApiOperation({ summary: 'Chi tiết bài viết theo ID' })
  async getPostById(@Param('id', ParseIntPipe) id: number) {
    return this.blogService.getPostById(id);
  }

  @Post('posts')
  @ApiOperation({ summary: 'Tạo bài viết mới' })
  async createPost(@Body() dto: CreatePostDto, @Req() req: any) {
    return this.blogService.createPost(req.user.id, dto);
  }

  @Put('posts/:id')
  @ApiOperation({ summary: 'Cập nhật bài viết' })
  async updatePost(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePostDto,
  ) {
    return this.blogService.updatePost(id, dto);
  }

  @Delete('posts/:id')
  @ApiOperation({ summary: 'Soft delete bài viết' })
  async deletePost(@Param('id', ParseIntPipe) id: number) {
    return this.blogService.deletePost(id);
  }

  @Patch('posts/:id/status')
  @ApiOperation({ summary: 'Thay đổi trạng thái bài viết' })
  async changeStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ChangePostStatusDto,
  ) {
    return this.blogService.changePostStatus(id, dto.status);
  }

  // ==================== CATEGORIES ====================

  @Get('categories')
  @ApiOperation({ summary: 'Danh sách tất cả danh mục' })
  async getCategories() {
    return this.blogService.getCategories();
  }

  @Post('categories')
  @ApiOperation({ summary: 'Tạo danh mục' })
  async createCategory(@Body() dto: CreateCategoryDto) {
    return this.blogService.createCategory(dto);
  }

  @Put('categories/:id')
  @ApiOperation({ summary: 'Cập nhật danh mục' })
  async updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.blogService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @ApiOperation({ summary: 'Xóa danh mục' })
  async deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return this.blogService.deleteCategory(id);
  }

  // ==================== TAGS ====================

  @Get('tags')
  @ApiOperation({ summary: 'Danh sách tags' })
  async getTags() {
    return this.blogService.getTags();
  }

  @Post('tags')
  @ApiOperation({ summary: 'Tạo tag' })
  async createTag(@Body() dto: CreateTagDto) {
    return this.blogService.createTag(dto);
  }

  @Delete('tags/:id')
  @ApiOperation({ summary: 'Xóa tag' })
  async deleteTag(@Param('id', ParseIntPipe) id: number) {
    return this.blogService.deleteTag(id);
  }

  // ==================== COMMENTS ====================

  @Get('comments')
  @ApiOperation({ summary: 'Danh sách tất cả comments (admin)' })
  async getComments(@Query() query: QueryCommentDto) {
    return this.blogService.getAdminComments(query);
  }

  @Patch('comments/:id/status')
  @ApiOperation({ summary: 'Cập nhật trạng thái bình luận (admin)' })
  async updateCommentStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: 'PENDING' | 'APPROVED' | 'SPAM',
  ) {
    return this.blogService.updateCommentStatus(id, status as any);
  }

  @Delete('comments/:id')
  @ApiOperation({ summary: 'Admin xóa comment spam' })
  async deleteComment(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.blogService.deleteComment(id, req.user.id, true);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Tải ảnh bài viết lên Cloudinary' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File ảnh cần tải lên',
    type: UploadFileDto,
  })
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.blogService.uploadImage(file);
  }

  @Delete('upload')
  @ApiOperation({ summary: 'Xóa ảnh bài viết trên Cloudinary' })
  async deleteImage(@Body('imageUrl') imageUrl: string) {
    return this.blogService.deleteImage(imageUrl);
  }
}
