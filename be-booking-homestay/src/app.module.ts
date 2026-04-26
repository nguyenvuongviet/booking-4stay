import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProtectStrategy } from './common/guard/protect/protect.strategy';
import { AmenityModule } from './modules/amenity/amenity.module';
import { AppConfigsModule } from './modules/app-configs/app-configs.module';
import { AuthModule } from './modules/auth/auth.module';
import { BookingModule } from './modules/booking/booking.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { LocationModule } from './modules/location/location.module';
import { LoyaltyModule } from './modules/loyalty/loyalty.module';
import { OtpModule } from './modules/otp/otp.module';
import { PayosModule } from './modules/payos/payos.module';
import { PrismaService } from './modules/prisma/prisma.service';
import { ReviewModule } from './modules/review/review.module';
import { RoomModule } from './modules/room/room.module';
import { TokenModule } from './modules/token/token.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    AppConfigsModule,
    AuthModule,
    TokenModule,
    OtpModule,
    UserModule,
    LocationModule,
    LoyaltyModule,
    RoomModule,
    BookingModule,
    ReviewModule,
    PayosModule,
    AmenityModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, ProtectStrategy],
})
export class AppModule {}
