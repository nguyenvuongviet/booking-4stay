import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ACCESS_TOKEN_SECRET, CLIENT_URL } from 'src/common/constant/app.constant';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { MessageService } from './message.service';
import { NotificationService } from './notification.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: 'chat',
})
export class MessageGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;
  private readonly activeUsers = new Map<number, Set<string>>();
  private readonly emailCooldowns = new Map<string, number>();
  private readonly emailCooldownMs = 15 * 60 * 1000;

  constructor(
    private readonly jwtService: JwtService,
    private readonly messageService: MessageService,
    private readonly prismaService: PrismaService,
    private readonly mailService: MailService,
    private readonly notificationService: NotificationService,
  ) { }

  // Xử lý khi có Client kết nối qua Socket
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
      this.addActiveUser(decoded.userId, client.id);

      // 4. Cho client join vào phòng cá nhân (user_userId) để nhận thông báo đẩy riêng
      client.join(`user_${decoded.userId}`);
      console.log(`[Socket] User ${decoded.userId} đã kết nối thành công: ${client.id}`);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error(`[Socket] Kết nối thất bại: ${err.message}`);
      client.disconnect(true);
    }
  }

  // Xử lý khi Client ngắt kết nối
  handleDisconnect(client: Socket) {
    const userId = client.data.user?.id;
    if (userId) {
      this.removeActiveUser(userId, client.id);
    }
    console.log(`[Socket] Client đã ngắt kết nối: ${client.id}`);
  }

  /**
   * Tham gia vào cuộc hội thoại cụ thể
   */
  @SubscribeMessage('join_conversation')
  async handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: number; markRead?: boolean },
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
    if (!payload.markRead) return;

    await this.messageService.markAsRead(payload.conversationId, userId);

    // Phát sự kiện cập nhật trạng thái "Đã đọc" cho thành viên khác trong room
    client.to(roomName).emit('read_status_updated', {
      conversationId: payload.conversationId,
      readBy: userId,
    });
  }

  // Rời khỏi cuộc hội thoại
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

  // Gửi tin nhắn mới thời gian thực
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
    let enrichedMessage = savedMessage;

    // 4. Phát thông báo tin nhắn mới tới user cá nhân của đối phương (phòng hờ họ đang ở trang khác)
    // Lấy thông tin cuộc hội thoại để tìm người nhận
    const conv = await this.prismaService.conversations.findUnique({
      where: { id: payload.conversationId },
      include: {
        guest: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        host: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    if (conv) {
      const receiverId = conv.guestId === senderId ? conv.hostId : conv.guestId;
      const sender = conv.guestId === senderId ? conv.guest : conv.host;
      const receiver = conv.guestId === senderId ? conv.host : conv.guest;
      const senderName = `${sender.firstName} ${sender.lastName}`.trim();
      const inboxUrl = `${CLIENT_URL.replace(/\/$/, '')}/inbox`;
      const receiverUnreadCount = await this.messageService.countUnread(
        payload.conversationId,
        receiverId,
      );
      enrichedMessage = {
        ...savedMessage,
        unreadCount: receiverUnreadCount,
      } as typeof savedMessage & { unreadCount: number };
      const notificationPayload = {
        id: savedMessage.id,
        conversationId: payload.conversationId,
        senderId,
        senderName,
        content: payload.content,
        isRead: false,
        unreadCount: receiverUnreadCount,
        createdAt: savedMessage.createdAt,
      };

      const isReceiverOnline = this.isUserOnline(receiverId);

      // Kiểm tra xem đối phương có đang ở trong phòng chat này không
      const receiverSockets = this.activeUsers.get(receiverId);
      let isReceiverInChatRoom = false;
      if (receiverSockets) {
        for (const socketId of receiverSockets) {
          const socket = (this.server as any).sockets.get(socketId);
          if (socket && socket.rooms.has(roomName)) {
            isReceiverInChatRoom = true;
            break;
          }
        }
      }

      // 1. Phát event socket receive_message để hiện Toast in-app + nhấp nháy tab nếu đang online nhưng ở trang khác
      if (isReceiverOnline && !isReceiverInChatRoom) {
        this.server
          .to(`user_${receiverId}`)
          .except(roomName)
          .emit('receive_message', notificationPayload);
        console.log(`[Chat] Gửi receive_message tới user ${receiverId} (online, ngoài room)`);
      }

      // 2. Gửi Web Push nếu đối phương không ở trong phòng chat này (offline hoặc online nhưng ở trang khác)
      if (!isReceiverOnline) {
        console.log(`[Chat] Gửi Web Push tới user ${receiverId}`);
        await this.notificationService.sendChatNotification(receiverId, {
          conversationId: payload.conversationId,
          senderId,
          title: `4Stay - ${senderName}`,
          body: payload.content,
          url: inboxUrl,
        }).catch((err: Error) => {
          console.error(`[Chat] Lỗi gửi Web Push: ${err.message}`);
        });
      }

      // 3. Gửi Email thông báo nếu đối phương OFFLINE hoàn toàn (và hết cooldown)
      if (!isReceiverOnline) {
        console.log(`[Chat] User ${receiverId} offline → gửi Email thông báo`);
        await this.sendOfflineEmailIfNeeded(
          receiver.email,
          receiverId,
          payload.conversationId,
          senderName,
          payload.content,
          inboxUrl,
        );
      }
    }

    this.server.to(roomName).emit('new_message', enrichedMessage);
  }

  // Trạng thái đang gõ phím
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

  private addActiveUser(userId: number, socketId: string) {
    const sockets = this.activeUsers.get(userId) || new Set<string>();
    sockets.add(socketId);
    this.activeUsers.set(userId, sockets);
  }

  private removeActiveUser(userId: number, socketId: string) {
    const sockets = this.activeUsers.get(userId);
    if (!sockets) return;
    sockets.delete(socketId);
    if (sockets.size === 0) {
      this.activeUsers.delete(userId);
    }
  }

  private isUserOnline(userId: number) {
    return (this.activeUsers.get(userId)?.size || 0) > 0;
  }

  private async sendOfflineEmailIfNeeded(
    receiverEmail: string,
    receiverId: number,
    conversationId: number,
    senderName: string,
    content: string,
    inboxUrl: string,
  ) {
    const cooldownKey = `${receiverId}:${conversationId}`;
    const lastSentAt = this.emailCooldowns.get(cooldownKey) || 0;
    if (Date.now() - lastSentAt < this.emailCooldownMs) return;

    try {
      await this.mailService.sendNewMessageMail(
        receiverEmail,
        senderName,
        content,
        inboxUrl,
      );
      this.emailCooldowns.set(cooldownKey, Date.now());
    } catch (error) {
      console.error(
        `[Socket] Khong the gui email thong bao tin nhan moi: ${(error as Error).message}`,
      );
    }
  }
}

