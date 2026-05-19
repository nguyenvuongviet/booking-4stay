import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiBody, ApiQuery, ApiParam } from '@nestjs/swagger';
import { MessageService } from './message.service';

@ApiTags('message')
@ApiBearerAuth('AccessToken')
@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  /**
   * Lấy danh sách hộp thư inbox (Conversations) của người dùng hiện tại
   */
  @Get('conversations')
  async getConversations(@Req() req: any) {
    const userId = +req.user.id;
    return this.messageService.getConversations(userId);
  }

  /**
   * Tạo mới hoặc lấy ra cuộc hội thoại hiện có giữa Guest (User hiện tại) và Host
   */
  @Post('conversations')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        hostId: { type: 'number', example: 2 },
        roomId: { type: 'number', example: 10, nullable: true },
      },
      required: ['hostId'],
    },
  })
  async createConversation(
    @Req() req: any,
    @Body('hostId', ParseIntPipe) hostId: number,
    @Body('roomId') roomId?: number,
  ) {
    const guestId = +req.user.id;
    return this.messageService.createConversation(guestId, hostId, roomId);
  }

  /**
   * Lấy danh sách tin nhắn của một cuộc hội thoại (Phân trang)
   */
  @Get('conversations/:id/messages')
  @ApiParam({ name: 'id', type: 'number', description: 'Conversation ID' })
  @ApiQuery({ name: 'page', type: 'number', required: false, example: 1 })
  @ApiQuery({ name: 'limit', type: 'number', required: false, example: 20 })
  async getMessages(
    @Req() req: any,
    @Param('id', ParseIntPipe) conversationId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const userId = +req.user.id;
    const pageNum = page ? +page : 1;
    const limitNum = limit ? +limit : 20;
    
    return this.messageService.getMessages(conversationId, userId, limitNum, pageNum);
  }

  /**
   * Đánh dấu đã đọc tất cả tin nhắn trong cuộc hội thoại từ đối phương
   */
  @Post('conversations/:id/read')
  @ApiParam({ name: 'id', type: 'number', description: 'Conversation ID' })
  async markAsRead(
    @Req() req: any,
    @Param('id', ParseIntPipe) conversationId: number,
  ) {
    const userId = +req.user.id;
    return this.messageService.markAsRead(conversationId, userId);
  }
}
