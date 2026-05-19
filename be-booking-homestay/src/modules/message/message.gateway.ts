import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { MessageService } from './message.service';
import { PrismaService } from '../prisma/prisma.service';
import { ACCESS_TOKEN_SECRET } from 'src/common/constant/app.constant';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: 'chat',
})
export class MessageGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly messageService: MessageService,
    private readonly prismaService: PrismaService,
  ) {}

  /**
   * Xử lý khi có Client kết nối qua Socket
   */
  async handleConnection(client: Socket) {
    try {
      // 1. Trích xuất token từ handshake auth hoặc headers
      let token = client.handshake.auth?.token || client.handshake.headers['authorization'];
      
      if (!token) {
        throw new Error('Không tìm thấy token xác thực');
      }

      if (token.startsWith('Bearer ')) {
        token = token.substring(7);
      }

      // 2. Xác thực Token JWT
      const decoded = this.jwtService.verify(token, {
        secret: ACCESS_TOKEN_SECRET as string,
      });

      if (!decoded || !decoded.userId) {
        throw new Error('Token không hợp lệ hoặc đã hết hạn');
      }

      // 3. Gắn thông tin người dùng vào socket session
      client.data.user = { id: decoded.userId };

      // 4. Cho client join vào phòng cá nhân (user_userId) để nhận thông báo đẩy riêng
      client.join(`user_${decoded.userId}`);
      console.log(`[Socket] User ${decoded.userId} đã kết nối thành công: ${client.id}`);
    } catch (error) {
      console.error(`[Socket] Kết nối thất bại: ${error.message}`);
      client.disconnect(true);
    }
  }

  /**
   * Xử lý khi Client ngắt kết nối
   */
  handleDisconnect(client: Socket) {
    console.log(`[Socket] Client đã ngắt kết nối: ${client.id}`);
  }

  /**
   * Tham gia vào cuộc hội thoại cụ thể
   */
  @SubscribeMessage('join_conversation')
  async handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: number },
  ) {
    const userId = client.data.user?.id;
    if (!userId || !payload.conversationId) return;

    // Xác thực xem user có quyền tham gia cuộc trò chuyện này không
    const hasAccess = await this.messageService.verifyAccess(userId, payload.conversationId);
    if (!hasAccess) {
      client.emit('error_message', { message: 'Bạn không có quyền tham gia cuộc trò chuyện này' });
      return;
    }

    const roomName = `conversation_${payload.conversationId}`;
    client.join(roomName);
    console.log(`[Socket] User ${userId} đã tham gia room: ${roomName}`);

    // Đánh dấu đã đọc tất cả tin nhắn đối phương gửi
    await this.messageService.markAsRead(payload.conversationId, userId);

    // Phát sự kiện cập nhật trạng thái "Đã đọc" cho thành viên khác trong room
    client.to(roomName).emit('read_status_updated', {
      conversationId: payload.conversationId,
      readBy: userId,
    });
  }

  /**
   * Rời khỏi cuộc hội thoại
   */
  @SubscribeMessage('leave_conversation')
  handleLeaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: number },
  ) {
    const userId = client.data.user?.id;
    if (!userId || !payload.conversationId) return;

    const roomName = `conversation_${payload.conversationId}`;
    client.leave(roomName);
    console.log(`[Socket] User ${userId} đã rời room: ${roomName}`);
  }

  /**
   * Gửi tin nhắn mới thời gian thực
   */
  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: number; content: string },
  ) {
    const senderId = client.data.user?.id;
    if (!senderId || !payload.conversationId || !payload.content?.trim()) return;

    // 1. Xác thực quyền gửi tin nhắn
    const hasAccess = await this.messageService.verifyAccess(senderId, payload.conversationId);
    if (!hasAccess) {
      client.emit('error_message', { message: 'Không thể gửi tin nhắn. Lỗi phân quyền.' });
      return;
    }

    // 2. Lưu tin nhắn vào cơ sở dữ liệu
    const savedMessage = await this.messageService.saveMessage(
      payload.conversationId,
      senderId,
      payload.content,
    );

    const roomName = `conversation_${payload.conversationId}`;

    // 3. Phát tin nhắn tới tất cả thành viên đang trong room cuộc hội thoại này
    this.server.to(roomName).emit('new_message', savedMessage);

    // 4. Phát thông báo tin nhắn mới tới user cá nhân của đối phương (phòng hờ họ đang ở trang khác)
    // Lấy thông tin cuộc hội thoại để tìm người nhận
    const conv = await this.prismaService.conversations.findUnique({
      where: { id: payload.conversationId },
    });
    
    if (conv) {
      const receiverId = conv.guestId === senderId ? conv.hostId : conv.guestId;
      
      // Phát tới socket riêng của người nhận
      this.server.to(`user_${receiverId}`).emit('unread_notification', {
        conversationId: payload.conversationId,
        senderId,
        content: payload.content,
        createdAt: savedMessage.createdAt,
      });
    }
  }

  /**
   * Trạng thái đang gõ phím
   */
  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: number; isTyping: boolean },
  ) {
    const userId = client.data.user?.id;
    if (!userId || !payload.conversationId) return;

    const roomName = `conversation_${payload.conversationId}`;
    
    // Phát tin báo đang gõ cho các socket khác trong room (loại trừ chính sender)
    client.to(roomName).emit('typing_status', {
      conversationId: payload.conversationId,
      senderId: userId,
      isTyping: payload.isTyping,
    });
  }
}
