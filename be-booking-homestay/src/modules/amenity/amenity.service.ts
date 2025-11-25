import { Injectable } from '@nestjs/common';
import { sanitizeAmenity } from 'src/utils/sanitize/amenity.sanitize';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AmenityService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const amenities = await this.prisma.amenities.findMany();
    return sanitizeAmenity(amenities);
  }
}
