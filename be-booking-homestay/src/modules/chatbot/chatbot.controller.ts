import { Body, Controller, Delete, Headers, Param, Post, Sse } from '@nestjs/common';
import { Public } from 'src/common/decorator/public.decorator';
import { ChatService } from './chatbot.service';

@Controller('chat')
@Public()
export class ChatController {
  constructor(private chatService: ChatService) { }

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
}
