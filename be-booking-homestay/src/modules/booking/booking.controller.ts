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
import { Role } from '../user/dto/enum.dto';
import { BookingCancelRefundService } from './booking-cancel-refund.service';
import { BookingQueryService } from './booking-query.service';
import { BookingService } from './booking.service';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ListBookingQuery } from './dto/list-booking.query';
import { PreCheckDto } from './dto/preCheck-booking.dto';
import { RoomAvailabilityDto } from './dto/room-availability.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@ApiTags('bookings')
@Controller('bookings')
export class BookingController {
  constructor(
    private readonly bookingService: BookingService,
    private readonly queryService: BookingQueryService,
    private readonly cancelRefundService: BookingCancelRefundService,
  ) {}

  @Get('unavailable-days')
  @Public()
  async getUnavailableDays(
    @Query('roomId', ParseIntPipe) roomId: number,
    @Query('excludeBookingId') excludeBookingId?: number,
  ) {
    return this.queryService.getUnavailableDays(
      roomId,
      excludeBookingId ? +excludeBookingId : undefined,
    );
  }

  @Post('/preview')
  @ApiBearerAuth('AccessToken')
  async preview(@Req() req: Request, @Body() dto: PreCheckDto) {
    const user = req['user'];
    return this.bookingService.previewBooking(+user.id, dto);
  }

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
    return this.queryService.listMine(+user.id, q);
  }

  @Patch('/:id/cancel')
  @ApiBearerAuth('AccessToken')
  async cancel(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CancelBookingDto,
    @Req() req: Request,
  ) {
    const user = req['user'];
    return this.cancelRefundService.cancel(id, +user.id, user.role, dto);
  }

  @Patch('/:id')
  @ApiBearerAuth('AccessToken')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBookingDto,
    @Req() req: Request,
  ) {
    const user = req['user'];
    return this.bookingService.update(id, +user.id, user.role, dto);
  }

  @Get('/:id')
  @ApiBearerAuth('AccessToken')
  async detail(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const user = req['user'] ?? null;
    const isAdmin =
      user &&
      Array.isArray(user.user_roles) &&
      user.user_roles.some((ur) => ur.roles && ur.roles.name === Role.ADMIN);
    const roleForService = isAdmin ? Role.ADMIN : null;
    return this.queryService.detail(id, user ? +user.id : null, roleForService);
  }

  @Get('/admin/all')
  @Roles(Role.ADMIN)
  @ApiBearerAuth('AccessToken')
  async adminList(@Query() q: ListBookingQuery) {
    return this.queryService.listAll(q);
  }

  @Get('rooms/:id/availability')
  @Public()
  async roomAvailability(
    @Param('id', ParseIntPipe) id: number,
    @Query() q: RoomAvailabilityDto,
  ) {
    return this.queryService.roomAvailability(id, q);
  }

  @Get('rooms/:roomId/')
  @Roles(Role.ADMIN)
  @ApiBearerAuth('AccessToken')
  async listByRoom(@Param('roomId', ParseIntPipe) roomId: number) {
    return this.queryService.listByRoom(roomId);
  }

  @Get('users/:userId')
  @Roles(Role.ADMIN)
  @ApiBearerAuth('AccessToken')
  async listByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.queryService.listByUser(userId);
  }

  @Patch('/:id/accept')
  @Roles(Role.ADMIN)
  @ApiBearerAuth('AccessToken')
  async acceptBooking(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { paidAmount: number },
  ) {
    return this.bookingService.adminAcceptBooking(id, dto);
  }

  @Patch('/:id/reject')
  @Roles(Role.ADMIN)
  @ApiBearerAuth('AccessToken')
  async rejectBooking(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CancelBookingDto,
  ) {
    return this.cancelRefundService.adminRejectBooking(id, dto);
  }

  @Patch('/:id/admin-cancel')
  @Roles(Role.ADMIN)
  @ApiBearerAuth('AccessToken')
  async adminCancelBooking(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CancelBookingDto,
  ) {
    return this.cancelRefundService.adminCancelBooking(id, dto);
  }

  @Patch('/:id/refund')
  @Roles(Role.ADMIN)
  @ApiBearerAuth('AccessToken')
  async confirmRefund(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { refundAmount: number; refundEvidence?: string },
  ) {
    return this.cancelRefundService.adminConfirmRefund(
      id,
      dto.refundAmount,
      dto.refundEvidence,
    );
  }
}
