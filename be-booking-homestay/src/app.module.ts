import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProtectStrategy } from './common/guard/protect/protect.strategy';
import { AuthModule } from './modules/auth/auth.module';
import { LocationModule } from './modules/location/location.module';
import { LoyaltyModule } from './modules/loyalty/loyalty.module';
import { OtpModule } from './modules/otp/otp.module';
import { PrismaService } from './modules/prisma/prisma.service';
import { RoomModule } from './modules/room/room.module';
import { TokenModule } from './modules/token/token.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/public',
    }), // xem ảnh local được lưu trong thư mục public
    AuthModule,
    TokenModule,
    OtpModule,
    UserModule,
    LocationModule,
    LoyaltyModule,
    RoomModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, ProtectStrategy],
})
export class AppModule {}
