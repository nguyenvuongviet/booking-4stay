import { Injectable, Logger } from '@nestjs/common';
import {
  VAPID_PRIVATE_KEY,
  VAPID_PUBLIC_KEY,
  VAPID_SUBJECT,
} from 'src/common/constant/app.constant';
import * as webpush from 'web-push';
import { PrismaService } from '../prisma/prisma.service';

type PushSubscriptionBody = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
};

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly pushEnabled =
    Boolean(VAPID_PUBLIC_KEY) &&
    Boolean(VAPID_PRIVATE_KEY) &&
    Boolean(VAPID_SUBJECT);

  constructor(private readonly prismaService: PrismaService) {
    if (this.pushEnabled) {
      webpush.setVapidDetails(
        VAPID_SUBJECT,
        VAPID_PUBLIC_KEY,
        VAPID_PRIVATE_KEY,
      );
    }
  }

  getPublicKey() {
    return { publicKey: VAPID_PUBLIC_KEY, enabled: this.pushEnabled };
  }

  async saveSubscription(userId: number, subscription: PushSubscriptionBody) {
    if (!subscription?.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
      return { saved: false };
    }

    const existing = await (this.prismaService as any).push_subscriptions.findFirst({
      where: { userId, endpoint: subscription.endpoint },
    });

    if (existing) {
      await (this.prismaService as any).push_subscriptions.update({
        where: { id: existing.id },
        data: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          createdAt: new Date(),
        },
      });
      return { saved: true };
    }

    await (this.prismaService as any).push_subscriptions.create({
      data: {
        userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    });

    return { saved: true };
  }

  async sendChatNotification(
    userId: number,
    payload: {
      conversationId: number;
      title: string;
      body: string;
      senderId: number;
      url?: string;
    },
  ) {
    if (!this.pushEnabled) return;

    const subscriptions = await (this.prismaService as any).push_subscriptions.findMany({
      where: { userId },
    });

    await Promise.all(
      subscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth,
              },
            },
            JSON.stringify({
              title: payload.title,
              body: payload.body,
              icon: '/4stay-logo.png',
              badge: '/4stay-logo.png',
              tag: `chat-room-${payload.conversationId}`,
              data: {
                url: payload.url || '/inbox',
                conversationId: payload.conversationId,
                senderId: payload.senderId,
              },
            }),
          );
        } catch (error) {
          const statusCode = (error as any)?.statusCode;
          if (statusCode === 404 || statusCode === 410) {
            await (this.prismaService as any).push_subscriptions.delete({
              where: { id: subscription.id },
            });
            return;
          }
          this.logger.warn(
            `Failed to send push notification to user ${userId}: ${(error as Error).message}`,
          );
        }
      }),
    );
  }
}
