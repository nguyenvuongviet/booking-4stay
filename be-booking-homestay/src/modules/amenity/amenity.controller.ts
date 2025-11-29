import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorator/public.decorator';
import { AmenityService } from './amenity.service';

@ApiTags('amenity')
@Controller('amenity')
export class AmenityController {
  constructor(private readonly amenityService: AmenityService) {}

  @Get()
  @Public()
  async findAll() {
    return await this.amenityService.findAll();
  }
}
