import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorator/roles.decorator';
import { DashboardService } from './dashboard.service';

@ApiTags('admin dashboard')
@ApiBearerAuth('AccessToken')
@Controller('admin/dashboard')
@Roles('ADMIN')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  async getStats() {
    return this.dashboardService.getDashboardStats();
  }

  @Get('revenue')
  async getRevenue(@Query('year') year: string) {
    return this.dashboardService.getRevenueByMonth(
      Number(year) || new Date().getFullYear(),
    );
  }

  @Get('recent-bookings')
  async getRecentBookings() {
    return this.dashboardService.getRecentBookings();
  }

  @Get('bookings-status')
  async getBookingStatusSummary(
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    return this.dashboardService.getBookingStatusSummary(
      year ? Number(year) : undefined,
      month ? Number(month) : undefined,
    );
  }

  @Get('popular-rooms')
  async getPopularRooms() {
    return this.dashboardService.getTopRooms();
  }
}
