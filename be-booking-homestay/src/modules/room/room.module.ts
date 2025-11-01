import { Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { RoomHelper } from './room.helpers';

@Module({
  controllers: [RoomController],
  providers: [RoomService, PrismaService, CloudinaryService, RoomHelper],
})
export class RoomModule {}
