import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { blog_posts_status } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ example: 'Kinh nghiệm du lịch Đà Lạt 2025' })
  @IsString()
  @MinLength(5)
  @MaxLength(255)
  title: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Type(() => Number)
  categoryId: number;

  @ApiPropertyOptional({ example: 1, description: 'ID tỉnh thành liên kết' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  provinceId?: number;

  @ApiPropertyOptional({ example: 'Hướng dẫn du lịch Đà Lạt chi tiết...' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  excerpt?: string;

  @ApiProperty({ example: '<h2>Giới thiệu</h2><p>Đà Lạt là...</p>' })
  @IsString()
  @MinLength(10)
  content: string;

  @ApiPropertyOptional({ example: 'https://res.cloudinary.com/...' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  thumbnailUrl?: string;

  @ApiPropertyOptional({ example: 'Kinh nghiệm du lịch Đà Lạt 2025 | 4Stay' })
  @IsOptional()
  @IsString()
  @MaxLength(70)
  metaTitle?: string;

  @ApiPropertyOptional({ example: 'Hướng dẫn chi tiết lịch trình Đà Lạt...' })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  metaDescription?: string;

  @ApiPropertyOptional({ example: 'đà lạt, du lịch, homestay' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  metaKeywords?: string;

  @ApiPropertyOptional({ example: '🎁 Nhận ưu đãi 5% khi book phòng Đà Lạt!' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  promotionBanner?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ example: [1, 2, 3], description: 'Danh sách tag IDs' })
  @IsOptional()
  @IsInt({ each: true })
  @Type(() => Number)
  tagIds?: number[];
}

export class UpdatePostDto {
  @ApiPropertyOptional({ example: 'Kinh nghiệm du lịch Đà Lạt 2025 (Updated)' })
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  categoryId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  provinceId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  excerpt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(10)
  content?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  thumbnailUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(70)
  metaTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(160)
  metaDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  metaKeywords?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  promotionBanner?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ example: [1, 2, 3] })
  @IsOptional()
  @IsInt({ each: true })
  @Type(() => Number)
  tagIds?: number[];
}

export class ChangePostStatusDto {
  @ApiProperty({ enum: blog_posts_status })
  @IsEnum(blog_posts_status)
  status: blog_posts_status;
}

export class CreateCategoryDto {
  @ApiProperty({ example: 'Du lịch' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'Kinh nghiệm và cẩm nang du lịch' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  position?: number;
}

export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: 'Du lịch' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  position?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateTagDto {
  @ApiProperty({ example: 'đà lạt' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;
}

export class CreateCommentDto {
  @ApiProperty({ example: 'Bài viết rất hay, cảm ơn bạn!' })
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  content: string;
}

export class QueryPostDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  pageSize?: number = 10;

  @ApiPropertyOptional({ example: 'đà lạt' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 'du-lich' })
  @IsOptional()
  @IsString()
  categorySlug?: string;

  @ApiPropertyOptional({ example: 'da-lat' })
  @IsOptional()
  @IsString()
  tagSlug?: string;

  @ApiPropertyOptional({ enum: blog_posts_status })
  @IsOptional()
  @IsEnum(blog_posts_status)
  status?: blog_posts_status;
}

export class QueryCommentDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  pageSize?: number = 10;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  postId?: number;

  @ApiPropertyOptional({ example: 'PENDING' })
  @IsOptional()
  @IsString()
  status?: string;
}
