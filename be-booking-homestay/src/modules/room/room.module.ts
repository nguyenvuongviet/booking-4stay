import { Module } from '@nestjs/common';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PrismaService } from '../prisma/prisma.service';
import { RoomAssetService } from './room-asset.service';
import { RoomCalendarService } from './room-calendar.service';
import { RoomController } from './room.controller';
import { RoomHelper } from './room.helpers';
import { RoomService } from './room.service';

@Module({
  controllers: [RoomController],
  providers: [
    RoomService,
    RoomAssetService,
    RoomCalendarService,
    PrismaService,
    CloudinaryService,
    RoomHelper,
  ],
})
export class RoomModule {}
