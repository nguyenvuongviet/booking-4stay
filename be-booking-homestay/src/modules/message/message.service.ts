import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessageService {
  constructor(private readonly prismaService: PrismaService) { }

  // Lấy danh sách các cuộc trò chuyện của người dùng (Guest hoặc Host)
  async getConversations(userId: number) {
    const conversations = await this.prismaService.conversations.findMany({
      where: {
        OR: [
          { guestId: userId },
          { hostId: userId },
        ],
        isDeleted: false,
      },
      include: {
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            email: true,
          },
        },
        host: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            email: true,
          },
        },
        room: {
          select: {
            id: true,
            name: true,
            price: true,
            room_images: {
              where: { isMain: true },
              take: 1,
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Đếm tin nhắn chưa đọc của từng cuộc hội thoại
    const unreadCounts = await Promise.all(
      conversations.map((conv) =>
        this.prismaService.messages.count({
          where: {
            conversationId: conv.id,
            senderId: { not: userId },
            isRead: false,
          },
        }),
      ),
    );

    // Định dạng lại kết quả trả về để UI dễ dùng hơn
    return conversations.map((conv, index) => {
      const lastMessage = conv.messages[0] || null;
      return {
        id: conv.id,
        guestId: conv.guestId,
        hostId: conv.hostId,
        roomId: conv.roomId,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
        guest: conv.guest,
        host: conv.host,
        room: conv.room ? {
          id: conv.room.id,
          name: conv.room.name,
          price: conv.room.price,
          imageUrl: conv.room.room_images[0]?.imageUrl || null,
        } : null,
        lastMessage: lastMessage ? {
          id: lastMessage.id,
          content: lastMessage.content,
          senderId: lastMessage.senderId,
          isRead: lastMessage.isRead,
          createdAt: lastMessage.createdAt,
        } : null,
        unreadCount: unreadCounts[index],
      };
    });
  }

  // Tạo cuộc hội thoại mới giữa Guest và Host liên quan tới Room
  async createConversation(guestId: number, hostId: number, roomId?: number) {
    // 1. Kiểm tra xem cuộc hội thoại đã tồn tại chưa
    let conversation = await this.prismaService.conversations.findFirst({
      where: {
        guestId,
        hostId,
        roomId: roomId || null,
        isDeleted: false,
      },
    });

    // 2. Nếu chưa tồn tại, tiến hành tạo mới
    if (!conversation) {
      conversation = await this.prismaService.conversations.create({
        data: {
          guestId,
          hostId,
          roomId: roomId || null,
        },
      });
    }

    return conversation;
  }

  // Lấy lịch sử tin nhắn của một cuộc trò chuyện có phân trang
  async getMessages(conversationId: number, userId: number, limit = 20, page = 1) {
    // 1. Xác thực quyền truy cập: Kiểm tra xem user có thuộc conversation này không
    const conversation = await this.prismaService.conversations.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Hội thoại không tồn tại');
    }

    if (conversation.guestId !== userId && conversation.hostId !== userId) {
      throw new ForbiddenException('Bạn không có quyền truy cập cuộc hội thoại này');
    }

    // 2. Fetch tin nhắn
    const skip = (page - 1) * limit;
    const messages = await this.prismaService.messages.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip,
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    // Đảo ngược lại để theo thứ tự thời gian tăng dần trước khi gửi lên UI
    return messages.reverse();
  }

  // Lưu tin nhắn mới vào cơ sở dữ liệu
  async saveMessage(conversationId: number, senderId: number, content: string) {
    // 1. Kiểm tra sự tồn tại của cuộc hội thoại
    const conversation = await this.prismaService.conversations.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Hội thoại không tồn tại');
    }

    // 2. Tạo tin nhắn
    const message = await this.prismaService.messages.create({
      data: {
        conversationId,
        senderId,
        content,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    // 3. Cập nhật lastMessageId và updatedAt của cuộc hội thoại
    await this.prismaService.conversations.update({
      where: { id: conversationId },
      data: {
        lastMessageId: message.id,
        updatedAt: new Date(),
      },
    });

    return message;
  }

  // Đánh dấu đã đọc tất cả tin nhắn đối phương gửi trong cuộc hội thoại
  async markAsRead(conversationId: number, userId: number) {
    return this.prismaService.messages.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }

  countUnread(conversationId: number, userId: number) {
    return this.prismaService.messages.count({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
      },
    });
  }

  // Xác thực nhanh quyền truy cập cuộc trò chuyện (Dùng cho Websocket Gateway)
  async verifyAccess(userId: number, conversationId: number): Promise<boolean> {
    const conv = await this.prismaService.conversations.findUnique({
      where: { id: conversationId },
    });
    if (!conv) return false;
    return conv.guestId === userId || conv.hostId === userId;
  }
}
