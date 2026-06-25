import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { ChatbotContextService } from './chatbot-context.service';
import { ChatController } from './chatbot.controller';
import { ChatService } from './chatbot.service';
import { GeminiService } from './gemini.service';
import { RagEmbeddingService } from './rag-embedding.service';
import { RagIndexService } from './rag-index.service';
import { RagIntentService } from './rag-intent.service';

@Module({
  controllers: [ChatController],
  providers: [
    ChatService,
    GeminiService,
    ChatbotContextService,
    JwtService,
    PrismaService,
    RagEmbeddingService,
    RagIndexService,
    RagIntentService,
  ],
  exports: [RagIndexService],
})
export class ChatModule { }
