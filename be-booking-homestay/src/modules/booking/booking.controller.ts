import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorator/public.decorator';
import { Roles } from 'src/common/decorator/roles.decorator';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ListBookingQuery } from './dto/list-booking.query';
import { RoomAvailabilityDto } from './dto/room-availability.dto';
import { BookingService } from './booking.service';

@ApiTags('bookings')
@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post('/')
  @ApiBearerAuth('AccessToken')
  async create(@Req() req: Request, @Body() dto: CreateBookingDto) {
    const user = req['user'];
    return this.bookingService.create(+user.id, dto);
  }

  @Get('/me')
  @ApiBearerAuth('AccessToken')
  async myBookings(@Req() req: Request, @Query() q: ListBookingQuery) {
    const user = req['user'];
    return this.bookingService.listMine(+user.id, q);
  }

  @Patch('/:id/cancel')
  @ApiBearerAuth('AccessToken')
  async cancel(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CancelBookingDto,
    @Req() req: Request,
  ) {
    const user = req['user'];
    return this.bookingService.cancel(id, +user.id, user.role, dto);
  }

  @Get('/:id')
  @ApiBearerAuth('AccessToken')
  async detail(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const user = req['user'] ?? null;
    return this.bookingService.detail(
      id,
      user ? +user.id : null,
      user ? user.role : null,
    );
  }

  @Get('/admin/all')
  @Roles('ADMIN')
  @ApiBearerAuth('AccessToken')
  async adminList(@Query() q: ListBookingQuery) {
    return this.bookingService.listAll(q);
  }

  @Get('rooms/:id/availability')
  @Public()
  async roomAvailability(
    @Param('id', ParseIntPipe) id: number,
    @Query() q: RoomAvailabilityDto,
  ) {
    return this.bookingService.roomAvailability(id, q);
  }
}
