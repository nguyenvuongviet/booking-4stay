import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Module({
  controllers: [LocationController],
  providers: [LocationService, PrismaService, CloudinaryService],
})
export class LocationModule {}
