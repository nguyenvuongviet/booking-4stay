import { Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Module({
  controllers: [RoomController],
  providers: [RoomService, PrismaService, CloudinaryService],
})
export class RoomModule {}
