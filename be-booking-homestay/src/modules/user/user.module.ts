import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, CloudinaryService],
})
export class UserModule {}
