import { Module } from '@nestjs/common';
import { LoyaltyProgram } from 'src/helpers/loyalty.helper';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, CloudinaryService, LoyaltyProgram],
})
export class UserModule {}
