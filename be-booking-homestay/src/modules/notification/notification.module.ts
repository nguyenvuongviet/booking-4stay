import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { TokenModule } from '../token/token.module';
import { BookingNotificationDispatcher } from './booking-notification.dispatcher';
import { NotificationController } from './notification.controller';
import { NotificationGateway } from './notification.gateway';
import { NotificationService } from './notification.service';

@Module({
    imports: [TokenModule],
    providers: [
        NotificationService,
        NotificationGateway,
        BookingNotificationDispatcher,
        PrismaService,
        JwtService,
    ],
    controllers: [NotificationController],
    exports: [NotificationService, BookingNotificationDispatcher],
})
export class NotificationModule { }
