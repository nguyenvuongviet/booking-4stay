import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationGateway } from './notification.gateway';
import { NotificationData, NotificationType } from './notification.types';

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: NotificationGateway,
  ) { }

  async create(
    input:
      | {
        userId: number;
        type: NotificationType;
        title: string;
        body: string;
        data?: NotificationData;
      }
      | number,
    typeArg?: string,
    titleArg?: string,
    bodyArg?: string,
    dataArg?: NotificationData,
  ) {
    const normalized =
      typeof input === 'number'
        ? {
          userId: input,
          type: (typeArg as NotificationType) || NotificationType.NEW_MESSAGE,
          title: titleArg || '',
          body: bodyArg || '',
          data: dataArg,
        }
        : input;
    const { userId, title, body, data } = normalized;
    const normalizedInputType = String(normalized.type || '').toUpperCase();
    const type = await this.normalizeTypeByRecipientRole(
      userId,
      normalizedInputType as NotificationType,
      data,
    );
    const dedupeSince = new Date(Date.now() - 15 * 1000);
    const existingNotifications = await this.prisma.notifications.findMany({
      where: {
        userId,
        type,
        createdAt: { gte: dedupeSince },
      },
      orderBy: { createdAt: 'desc' },
    });

    const isDuplicate = existingNotifications.some((existing) => {
      const existingData = existing.data as any;
      const newData = data as any;

      const targetMatch =
        (!existingData && !newData) ||
        (existingData &&
          newData &&
          existingData.targetId === newData.targetId &&
          existingData.targetType === newData.targetType &&
          existingData.bookingId === newData.bookingId &&
          existingData.conversationId === newData.conversationId);

      const normalizedType = String(type).toUpperCase();
      if (
        normalizedType === NotificationType.BOOKING_CANCELLED ||
        normalizedType === 'BOOKING_CANCELLED' ||
        normalizedType === NotificationType.ADMIN_BOOKING_CANCELLED
      ) {
        return targetMatch;
      }

      const titleBodyMatch = existing.title === title && existing.body === body;
      return titleBodyMatch && targetMatch;
    });

    if (isDuplicate && existingNotifications.length > 0) {
      return existingNotifications[0];
    }

    const noti = await this.prisma.notifications.create({
      data: {
        userId,
        type,
        title,
        body,
        data,
      },
    });

    try {
      this.gateway.emitToUser(userId, 'notification', noti);
    } catch { }

    return noti;
  }

  private async normalizeTypeByRecipientRole(
    userId: number,
    inputType: NotificationType,
    data?: NotificationData,
  ): Promise<NotificationType> {
    const type = String(inputType || '').toUpperCase() as NotificationType;
    if (
      type !== NotificationType.BOOKING_CREATED &&
      type !== NotificationType.PAYMENT_SUCCESS &&
      type !== NotificationType.BOOKING_CANCELLED
    ) {
      return type;
    }

    const isAdminRecipient = await this.prisma.users.findFirst({
      where: {
        id: userId,
        user_roles: {
          some: {
            roles: { name: 'ADMIN' },
          },
        },
      },
      select: { id: true },
    });

    if (!isAdminRecipient) return type;

    const actionUrl = String(data?.actionUrl || '');
    const isAdminScopedNotification = actionUrl.startsWith('/admin');
    if (!isAdminScopedNotification) return type;

    if (type === NotificationType.BOOKING_CREATED) {
      return NotificationType.ADMIN_BOOKING_CREATED;
    }
    if (type === NotificationType.PAYMENT_SUCCESS) {
      return NotificationType.ADMIN_PAYMENT_SUCCESS;
    }
    if (type === NotificationType.BOOKING_CANCELLED) {
      return NotificationType.ADMIN_BOOKING_CANCELLED;
    }
    return type;
  }

  async findForUserCursor(
    userId: number,
    params: { cursor?: number; limit?: number; page?: number; pageSize?: number },
  ) {
    const limit = Math.min(
      Math.max(Number(params.limit || params.pageSize || 20), 1),
      100,
    );
    const cursor = params.cursor ? Number(params.cursor) : undefined;
    const page = Number(params.page || 1);
    const skip = (page - 1) * limit;
    const where: any = { userId };
    if (cursor) where.id = { lt: cursor };

    const [items, total, unreadCount] = await Promise.all([
      this.prisma.notifications.findMany({
        where,
        orderBy: { id: 'desc' },
        ...(cursor ? {} : { skip }),
        take: limit + 1,
      }),
      this.prisma.notifications.count({ where: { userId } }),
      this.prisma.notifications.count({ where: { userId, read: false } }),
    ]);

    const hasMore = items.length > limit;
    const normalizedItems = hasMore ? items.slice(0, limit) : items;
    const nextCursor = hasMore
      ? normalizedItems[normalizedItems.length - 1]?.id
      : null;

    return {
      items: normalizedItems,
      total,
      unreadCount,
      pagination: {
        limit,
        hasMore,
        nextCursor,
      },
    };
  }

  async markRead(userId: number, ids: number[]) {
    if (!ids?.length) return { count: 0 };
    return this.prisma.notifications.updateMany({
      where: { id: { in: ids }, userId },
      data: { read: true },
    });
  }

  async markAllRead(userId: number) {
    return this.prisma.notifications.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  async notifyNewMessage(
    recipients: number[],
    fromUserId: number,
    conversationId: number,
    snippet: string,
  ) {
    const created: any[] = [];
    for (const uid of recipients) {
      try {
        const noti = await this.create({
          userId: uid,
          type: NotificationType.NEW_MESSAGE,
          title: 'Tin nhan moi',
          body: snippet || 'Ban co tin nhan moi',
          data: {
            conversationId,
            fromUserId,
            targetType: 'conversation',
            targetId: conversationId,
            actionUrl: '/inbox',
          },
        });
        created.push(noti);
      } catch (e) {
        console.error('notifyNewMessage error for user', uid, e);
      }
    }
    return created;
  }
}
