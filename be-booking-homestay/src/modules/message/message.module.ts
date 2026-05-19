import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { MessageController } from './message.controller';
import { MessageGateway } from './message.gateway';
import { MessageService } from './message.service';

@Module({
  controllers: [MessageController],
  providers: [
    MessageService,
    MessageGateway,
    PrismaService,
    JwtService,
  ],
  exports: [MessageService],
})
export class MessageModule {}
