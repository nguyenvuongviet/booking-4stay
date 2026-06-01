import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from './notification.service';
import { NotificationType } from './notification.types';

@Injectable()
export class BookingNotificationDispatcher {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly prisma: PrismaService,
  ) { }

  create(userId: number, type: string, title: string, body: string, data?: any) {
    const normalizedType = String(type || '').toUpperCase();
    const bookingId = Number(data?.bookingId || data?.targetId || 0) || undefined;
    const normalizedData = {
      ...data,
      actionUrl: data?.actionUrl || (bookingId ? `/booking/${bookingId}` : undefined),
      targetType: data?.targetType || (bookingId ? 'booking' : undefined),
      targetId: data?.targetId || bookingId,
    };

    switch (normalizedType) {
      case 'BOOKING_CREATED':
      case 'booking_created':
        if (bookingId) return this.notifyBookingCreated(userId, bookingId);
        break;
      case 'BOOKING_CONFIRMED':
      case 'booking_confirmed':
        if (bookingId) return this.notifyBookingConfirmed(userId, bookingId);
        break;
      case 'BOOKING_CANCELLED':
      case 'booking_cancelled':
        if (bookingId) {
          const byAdmin = String(title || '').toLowerCase().includes('admin');
          return this.notifyBookingCancelled(userId, bookingId, byAdmin);
        }
        break;
      case 'BOOKING_REFUNDED':
      case 'booking_refunded':
        if (bookingId) {
          return this.notifyBookingRefunded(
            userId,
            bookingId,
            Number(data?.refundAmount || 0),
          );
        }
        break;
      case 'PAYMENT_SUCCESS':
      case 'payment_success':
        if (bookingId) {
          return this.notifyPaymentSuccess(
            userId,
            bookingId,
            Number(data?.paidAmount || 0),
          );
        }
        break;
      case 'CHECKIN_REMINDER':
      case 'checkin_reminder':
        if (bookingId) {
          return this.notifyCheckinReminder(
            userId,
            bookingId,
            new Date(data?.checkIn || Date.now()),
          );
        }
        break;
      case 'ADMIN_BOOKING_CREATED':
      case 'admin_booking_created':
        if (bookingId) return this.notifyAdminNewBooking(bookingId, data?.guestName);
        break;
      case 'ADMIN_PAYMENT_SUCCESS':
      case 'admin_payment_success':
        if (bookingId) {
          return this.notifyAdminPaymentSuccess(
            bookingId,
            Number(data?.paidAmount || 0),
            data?.guestName,
          );
        }
        break;
      case 'ADMIN_BOOKING_CANCELLED':
      case 'admin_booking_cancelled':
        if (bookingId) {
          return this.notifyAdminBookingCancelled(
            bookingId,
            data?.guestName,
            Number(data?.refundAmount || 0),
          );
        }
        break;
      case 'ADMIN_BOOKING_WAITING_REFUND':
      case 'admin_booking_waiting_refund':
        if (bookingId) {
          return this.notifyAdminBookingWaitingRefund(
            bookingId,
            Number(data?.refundAmount || 0),
            data?.guestName,
          );
        }
        break;
      default:
        break;
    }

    return this.notificationService.create(userId, type, title, body, normalizedData);
  }

  notifyBookingCreated(userId: number, bookingId: number) {
    return this.notificationService.create({
      userId,
      type: NotificationType.BOOKING_CREATED,
      title: 'Dat phong thanh cong',
      body: `Don dat phong #${bookingId} da duoc tao.`,
      data: {
        actionUrl: `/booking/${bookingId}`,
        targetType: 'booking',
        targetId: bookingId,
        bookingId,
      },
    });
  }

  notifyBookingConfirmed(userId: number, bookingId: number) {
    return this.notificationService.create({
      userId,
      type: NotificationType.BOOKING_CONFIRMED,
      title: 'Booking xac nhan',
      body: `Don dat phong #${bookingId} da duoc xac nhan.`,
      data: {
        actionUrl: `/booking/${bookingId}`,
        targetType: 'booking',
        targetId: bookingId,
        bookingId,
      },
    });
  }

  notifyBookingCancelled(userId: number, bookingId: number, byAdmin = false) {
    return this.notificationService.create({
      userId,
      type: NotificationType.BOOKING_CANCELLED,
      title: byAdmin ? 'Booking huy (Admin)' : 'Booking huy',
      body: byAdmin
        ? `Don dat phong #${bookingId} da bi huy boi Admin.`
        : `Don dat phong #${bookingId} da bi huy.`,
      data: {
        actionUrl: `/booking/${bookingId}`,
        targetType: 'booking',
        targetId: bookingId,
        bookingId,
      },
    });
  }

  notifyBookingRefunded(userId: number, bookingId: number, refundAmount: number) {
    return this.notificationService.create({
      userId,
      type: NotificationType.BOOKING_REFUNDED,
      title: 'Hoan tien da xac nhan',
      body: `Don dat phong #${bookingId} da duoc hoan tien ${refundAmount.toLocaleString()}d.`,
      data: {
        actionUrl: `/booking/${bookingId}`,
        targetType: 'booking',
        targetId: bookingId,
        bookingId,
        refundAmount,
      },
    });
  }

  notifyPaymentSuccess(userId: number, bookingId: number, paidAmount: number) {
    return this.notificationService.create({
      userId,
      type: NotificationType.PAYMENT_SUCCESS,
      title: 'Thanh toan thanh cong',
      body: `Thanh toan ${paidAmount.toLocaleString()} da duoc ghi nhan cho don #${bookingId}`,
      data: {
        actionUrl: `/booking/${bookingId}`,
        targetType: 'booking',
        targetId: bookingId,
        bookingId,
        paidAmount,
      },
    });
  }

  notifyCheckinReminder(userId: number, bookingId: number, checkIn: Date) {
    return this.notificationService.create({
      userId,
      type: NotificationType.CHECKIN_REMINDER,
      title: 'Sap check-in',
      body: `Booking #${bookingId} se check-in vao ngay mai.`,
      data: {
        actionUrl: `/booking/${bookingId}`,
        targetType: 'booking',
        targetId: bookingId,
        bookingId,
        checkIn,
      },
    });
  }

  private async getAdminUserIds(): Promise<number[]> {
    try {
      const adminUsers = await this.prisma.users.findMany({
        where: {
          user_roles: {
            some: {
              roles: {
                name: 'ADMIN',
              },
            },
          },
        },
        select: { id: true },
      });
      return adminUsers.map((u) => u.id);
    } catch (error) {
      console.error('Error fetching admin users:', error);
      return [];
    }
  }

  async notifyAdminNewBooking(bookingId: number, guestName?: string) {
    const adminIds = await this.getAdminUserIds();
    if (adminIds.length === 0) return;

    const promises = adminIds.map((adminId) =>
      this.notificationService.create({
        userId: adminId,
        type: NotificationType.ADMIN_BOOKING_CREATED,
        title: 'Dat phong moi',
        body: `Don dat phong #${bookingId}${guestName ? ` tu ${guestName}` : ''} vua duoc tao.`,
        data: {
          actionUrl: `/admin/bookings/${bookingId}`,
          targetType: 'booking',
          targetId: bookingId,
          bookingId,
          guestName,
        },
      }),
    );

    await Promise.all(promises).catch((err) =>
      console.error('Error sending admin notifications:', err),
    );
  }

  async notifyAdminPaymentSuccess(
    bookingId: number,
    paidAmount: number,
    guestName?: string,
  ) {
    const adminIds = await this.getAdminUserIds();
    if (adminIds.length === 0) return;

    const promises = adminIds.map((adminId) =>
      this.notificationService.create({
        userId: adminId,
        type: NotificationType.ADMIN_PAYMENT_SUCCESS,
        title: 'Thanh toan thanh cong',
        body: `Thanh toan ${paidAmount.toLocaleString()} d cho don #${bookingId}${guestName ? ` (${guestName})` : ''} da duoc ghi nhan.`,
        data: {
          actionUrl: `/admin/bookings/${bookingId}`,
          targetType: 'booking',
          targetId: bookingId,
          bookingId,
          paidAmount,
          guestName,
        },
      }),
    );

    await Promise.all(promises).catch((err) =>
      console.error('Error sending admin notifications:', err),
    );
  }

  async notifyAdminBookingCancelled(
    bookingId: number,
    guestName?: string,
    refundAmount?: number,
  ) {
    const adminIds = await this.getAdminUserIds();
    if (adminIds.length === 0) return;

    const promises = adminIds.map((adminId) =>
      this.notificationService.create({
        userId: adminId,
        type: NotificationType.ADMIN_BOOKING_CANCELLED,
        title: 'Booking bi huy',
        body: `Don #${bookingId}${guestName ? ` (${guestName})` : ''} da bi huy boi khach${refundAmount && refundAmount > 0 ? `. Can hoan ${refundAmount.toLocaleString()} d` : '.'}`,
        data: {
          actionUrl: `/admin/bookings/${bookingId}`,
          targetType: 'booking',
          targetId: bookingId,
          bookingId,
          refundAmount,
          guestName,
        },
      }),
    );

    await Promise.all(promises).catch((err) =>
      console.error('Error sending admin notifications:', err),
    );
  }

  async notifyAdminBookingWaitingRefund(
    bookingId: number,
    refundAmount: number,
    guestName?: string,
  ) {
    const adminIds = await this.getAdminUserIds();
    if (adminIds.length === 0) return;

    const promises = adminIds.map((adminId) =>
      this.notificationService.create({
        userId: adminId,
        type: NotificationType.ADMIN_BOOKING_WAITING_REFUND,
        title: 'Booking cho hoan tien',
        body: `Don #${bookingId}${guestName ? ` (${guestName})` : ''} dang cho hoan ${refundAmount.toLocaleString()} d.`,
        data: {
          actionUrl: `/admin/bookings/${bookingId}`,
          targetType: 'booking',
          targetId: bookingId,
          bookingId,
          refundAmount,
          guestName,
        },
      }),
    );

    await Promise.all(promises).catch((err) =>
      console.error('Error sending admin waiting-refund notifications:', err),
    );
  }

  async notifyAdminNewMessage(conversationId: number, fromUserId: number) {
    const adminIds = await this.getAdminUserIds();
    if (adminIds.length === 0) return;

    const promises = adminIds.map((adminId) =>
      this.notificationService.create({
        userId: adminId,
        type: NotificationType.NEW_MESSAGE,
        title: 'Tin nhan moi',
        body: 'Ban co tin nhan moi tu khach hang.',
        data: {
          actionUrl: '/admin/chat',
          targetType: 'conversation',
          targetId: conversationId,
          conversationId,
          fromUserId,
        },
      }),
    );

    await Promise.all(promises).catch((err) =>
      console.error('Error sending admin notifications:', err),
    );
  }
}
