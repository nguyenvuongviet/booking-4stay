import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorator/public.decorator';
import { BlogService } from './blog.service';
import {
  CreateCommentDto,
  QueryCommentDto,
  QueryPostDto,
} from './dto/blog.dto';

@ApiTags('Blog (Public)')
@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  // ==================== POSTS ====================

  @Get('posts')
  @Public()
  @ApiOperation({ summary: 'Danh sách bài viết (paginated, filter)' })
  async getPosts(@Query() query: QueryPostDto) {
    return this.blogService.getPosts(query);
  }

  @Get('posts/featured')
  @Public()
  @ApiOperation({ summary: 'Bài viết nổi bật' })
  async getFeaturedPosts(@Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : 4;
    return this.blogService.getFeaturedPosts(
      isNaN(parsedLimit) ? 4 : parsedLimit,
    );
  }

  @Get('posts/by-province/:provinceId')
  @Public()
  @ApiOperation({ summary: 'Bài viết theo tỉnh thành (Article-to-Room)' })
  async getPostsByProvince(
    @Param('provinceId', ParseIntPipe) provinceId: number,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 3;
    return this.blogService.getPostsByProvince(
      provinceId,
      isNaN(parsedLimit) ? 3 : parsedLimit,
    );
  }

  @Get('posts/related/:slug')
  @Public()
  @ApiOperation({ summary: 'Bài viết liên quan' })
  async getRelatedPosts(
    @Param('slug') slug: string,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 4;
    return this.blogService.getRelatedPosts(
      slug,
      isNaN(parsedLimit) ? 4 : parsedLimit,
    );
  }

  @Get('posts/:slug')
  @Public()
  @ApiOperation({ summary: 'Chi tiết bài viết theo slug' })
  async getPostBySlug(@Param('slug') slug: string) {
    return this.blogService.getPostBySlug(slug);
  }

  @Patch('posts/:slug/view')
  @Public()
  @ApiOperation({ summary: 'Tăng view count' })
  async incrementView(@Param('slug') slug: string) {
    return this.blogService.incrementView(slug);
  }

  // ==================== CATEGORIES ====================

  @Get('categories')
  @Public()
  @ApiOperation({ summary: 'Danh sách danh mục' })
  async getCategories() {
    return this.blogService.getCategories();
  }

  // ==================== TAGS ====================

  @Get('tags')
  @Public()
  @ApiOperation({ summary: 'Danh sách tags' })
  async getTags() {
    return this.blogService.getTags();
  }

  // ==================== COMMENTS ====================

  @Get('posts/:slug/comments')
  @Public()
  @ApiOperation({ summary: 'Danh sách comments theo bài viết' })
  async getComments(
    @Param('slug') slug: string,
    @Query() query: QueryCommentDto,
  ) {
    return this.blogService.getComments(slug, query);
  }

  @Post('posts/:slug/comments')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo comment mới (cần đăng nhập)' })
  async createComment(
    @Param('slug') slug: string,
    @Body() dto: CreateCommentDto,
    @Req() req: any,
  ) {
    return this.blogService.createComment(slug, req.user.id, dto);
  }

  @Delete('comments/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa comment của mình' })
  async deleteComment(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.blogService.deleteComment(id, req.user.id, false);
  }

  @Post('comments/:id/report')
  @Public()
  @ApiOperation({ summary: 'Báo cáo bình luận nhạy cảm/spam' })
  async reportComment(@Param('id', ParseIntPipe) id: number) {
    return this.blogService.reportComment(id);
  }
}
