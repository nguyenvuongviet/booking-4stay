import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { MessageController } from './message.controller';
import { MessageGateway } from './message.gateway';
import { MessageService } from './message.service';
import { NotificationService } from './notification.service';

@Module({
  controllers: [MessageController],
  providers: [
    MessageService,
    MessageGateway,
    NotificationService,
    MailService,
    PrismaService,
    JwtService,
  ],
  exports: [MessageService],
})
export class MessageModule { }
