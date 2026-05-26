import { Module } from '@nestjs/common';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PrismaService } from '../prisma/prisma.service';
import { BlogAdminController } from './blog-admin.controller';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';

@Module({
  controllers: [BlogController, BlogAdminController],
  providers: [BlogService, PrismaService, CloudinaryService],
  exports: [BlogService],
})
export class BlogModule {}
