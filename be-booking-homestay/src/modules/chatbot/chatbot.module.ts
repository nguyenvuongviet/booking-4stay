import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { ChatbotContextService } from './chatbot-context.service';
import { ChatController } from './chatbot.controller';
import { ChatService } from './chatbot.service';
import { GeminiService } from './gemini.service';

@Module({
  controllers: [ChatController],
  providers: [
    ChatService,
    GeminiService,
    ChatbotContextService,
    JwtService,
    PrismaService,
  ],
})
export class ChatModule { }
