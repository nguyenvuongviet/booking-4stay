import { Body, Controller, Delete, Headers, Param, Post, Sse } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Private, Public } from 'src/common/decorator/public.decorator';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from '../user/dto/enum.dto';
import { ChatService } from './chatbot.service';
import { RagIndexService } from './rag-index.service';

@Controller('chat')
@Public()
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly ragIndex: RagIndexService,
  ) { }

  @Post()
  async chat(
    @Body() body: { sessionId: string; message: string },
    @Headers('authorization') authorization?: string,
  ) {
    return this.chatService.chat(body.sessionId, body.message, authorization);
  }

  @Sse('stream')
  stream(
    @Body() body: { sessionId: string; message: string },
    @Headers('authorization') authorization?: string,
  ) {
    return this.chatService.stream(body.sessionId, body.message, authorization);
  }

  @Delete(':sessionId')
  clearSession(@Param('sessionId') sessionId: string) {
    return this.chatService.clearSession(sessionId);
  }

  // Endpoint dành cho admin/hệ thống để index lại toàn bộ phòng vào RAG
  @Post('index')
  @Private()
  @Roles(Role.ADMIN)
  @ApiBearerAuth('AccessToken')
  async indexAllRooms() {
    return this.ragIndex.indexAllRooms();
  }
}
