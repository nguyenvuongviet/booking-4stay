import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AmenityController } from './amenity.controller';
import { AmenityService } from './amenity.service';

@Module({
  controllers: [AmenityController],
  providers: [AmenityService, PrismaService],
})
export class AmenityModule {}
