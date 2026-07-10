import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from './notification.service';
import { NotificationType } from './notification.types';

@Injectable()
export class BookingNotificationDispatcher {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly prisma: PrismaService,
  ) {}

  create(
    userId: number,
    type: string,
    title: string,
    body: string,
    data?: any,
  ) {
    const normalizedType = String(type || '').toUpperCase();
    const bookingId =
      Number(data?.bookingId || data?.targetId || 0) || undefined;
    const normalizedData = {
      ...data,
      actionUrl:
        data?.actionUrl || (bookingId ? `/booking/${bookingId}` : undefined),
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
          const byAdmin = String(title || '')
            .toLowerCase()
            .includes('admin');
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
        if (bookingId)
          return this.notifyAdminNewBooking(bookingId, data?.guestName);
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
      case 'ADMIN_CHECKIN_REMINDER':
      case 'admin_checkin_reminder':
        if (bookingId) {
          return this.notifyAdminCheckinReminder(
            bookingId,
            data?.guestName,
            new Date(data?.checkIn || Date.now()),
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
      case 'ADMIN_EXPECTED_CHECKIN_REQUEST':
      case 'admin_expected_checkin_request':
        if (bookingId)
          return this.notifyAdminExpectedCheckIn(
            bookingId,
            data?.guestName,
            data?.checkIn as string,
          );
        break;
      case 'EXPECTED_CHECKIN_RESULT':
      case 'expected_checkin_result':
        if (bookingId)
          return this.notifyUserExpectedCheckInResult(
            userId,
            bookingId,
            data?.status as any,
            data?.reason,
          );
        break;
      default:
        break;
    }

    return this.notificationService.create(
      userId,
      type,
      title,
      body,
      normalizedData,
    );
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

  notifyBookingRefunded(
    userId: number,
    bookingId: number,
    refundAmount: number,
  ) {
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

  async notifyAdminCheckinReminder(
    bookingId: number,
    guestName?: string,
    checkIn?: Date,
  ) {
    const adminIds = await this.getAdminUserIds();
    if (adminIds.length === 0) return;

    const promises = adminIds.map((adminId) =>
      this.notificationService.create({
        userId: adminId,
        type: NotificationType.ADMIN_CHECKIN_REMINDER,
        title: 'Sap check-in',
        body: `Don dat phong #${bookingId}${guestName ? ` tu ${guestName}` : ''} se check-in vao ngay mai.`,
        data: {
          actionUrl: `/admin/bookings/${bookingId}`,
          targetType: 'booking',
          targetId: bookingId,
          bookingId,
          guestName,
          checkIn,
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
        body: `Don #${bookingId} da bi huy boi khach hang ${guestName || ''}.`,
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

  async notifyAdminExpectedCheckIn(
    bookingId: number,
    guestName?: string,
    requestedTime?: string,
  ) {
    const adminIds = await this.getAdminUserIds();
    if (adminIds.length === 0) return;

    const promises = adminIds.map((adminId) =>
      this.notificationService.create({
        userId: adminId,
        type: NotificationType.ADMIN_EXPECTED_CHECKIN_REQUEST,
        title: 'Giờ nhận phòng dự kiến mới',
        body: `Booking #${bookingId} của khách ${guestName || 'hàng'} có giờ nhận phòng dự kiến lúc ${requestedTime || 'chưa rõ'}.`,
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
      console.error(
        'Error sending admin expected check-in notifications:',
        err,
      ),
    );
  }

  async notifyUserExpectedCheckInResult(
    userId: number,
    bookingId: number,
    status: 'APPROVED' | 'REJECTED',
    note?: string,
  ) {
    const isApproved = status === 'APPROVED';
    const title = isApproved
      ? 'Xác nhận giờ nhận phòng dự kiến'
      : 'Từ chối giờ nhận phòng dự kiến';
    const body = isApproved
      ? `Giờ nhận phòng dự kiến cho Booking #${bookingId} đã được Admin xác nhận.${note ? ` Lời nhắn: ${note}` : ''}`
      : `Yêu cầu giờ nhận phòng dự kiến cho Booking #${bookingId} đã bị từ chối.${note ? ` Lý do: ${note}` : ''}`;

    await this.notificationService.create({
      userId,
      type: NotificationType.EXPECTED_CHECKIN_RESULT,
      title,
      body,
      data: {
        actionUrl: `/booking/${bookingId}`,
        targetType: 'booking',
        targetId: bookingId,
        bookingId,
        status,
      },
    });
  }

  async notifyAdminUnconfirmedCheckIn(bookingId: number, guestName?: string) {
    const adminIds = await this.getAdminUserIds();
    if (adminIds.length === 0) return;

    const promises = adminIds.map(async (adminId) => {
      const type = NotificationType.ADMIN_UNCONFIRMED_CHECKIN;
      const existing = await this.prisma.notifications.findMany({
        where: { userId: adminId, type },
      });
      const isDuplicate = existing.some((n) => {
        const dataObj = n.data as any;
        return dataObj && Number(dataObj.bookingId) === bookingId;
      });
      if (isDuplicate) return;

      return this.notificationService.create({
        userId: adminId,
        type,
        title: 'Chưa xác nhận Check-In',
        body: `Booking #${bookingId} của khách ${guestName || 'hàng'} đã đến giờ nhận phòng nhưng chưa xác nhận Check-In.`,
        data: {
          actionUrl: `/admin/bookings/${bookingId}`,
          targetType: 'booking',
          targetId: bookingId,
          bookingId,
          guestName,
        },
      });
    });

    await Promise.all(promises).catch((err) =>
      console.error('Error sending admin unconfirmed check-in notifications:', err),
    );
  }

  async notifyAdminUnconfirmedCheckOut(bookingId: number, guestName?: string) {
    const adminIds = await this.getAdminUserIds();
    if (adminIds.length === 0) return;

    const promises = adminIds.map(async (adminId) => {
      const type = NotificationType.ADMIN_UNCONFIRMED_CHECKOUT;
      const existing = await this.prisma.notifications.findMany({
        where: { userId: adminId, type },
      });
      const isDuplicate = existing.some((n) => {
        const dataObj = n.data as any;
        return dataObj && Number(dataObj.bookingId) === bookingId;
      });
      if (isDuplicate) return;

      return this.notificationService.create({
        userId: adminId,
        type,
        title: 'Chưa xác nhận Check-Out',
        body: `Booking #${bookingId} của khách ${guestName || 'hàng'} đã quá giờ trả phòng nhưng chưa xác nhận Check-Out.`,
        data: {
          actionUrl: `/admin/bookings/${bookingId}`,
          targetType: 'booking',
          targetId: bookingId,
          bookingId,
          guestName,
        },
      });
    });

    await Promise.all(promises).catch((err) =>
      console.error('Error sending admin unconfirmed check-out notifications:', err),
    );
  }

  async notifyAdminSuspectedNoShow(bookingId: number, guestName?: string) {
    const adminIds = await this.getAdminUserIds();
    if (adminIds.length === 0) return;

    const promises = adminIds.map(async (adminId) => {
      const type = NotificationType.ADMIN_SUSPECTED_NOSHOW;
      const existing = await this.prisma.notifications.findMany({
        where: { userId: adminId, type },
      });
      const isDuplicate = existing.some((n) => {
        const dataObj = n.data as any;
        return dataObj && Number(dataObj.bookingId) === bookingId;
      });
      if (isDuplicate) return;

      return this.notificationService.create({
        userId: adminId,
        type,
        title: 'Nghi ngờ khách không đến (No-Show)',
        body: `Booking #${bookingId} của khách ${guestName || 'hàng'} đã kết thúc ngày trả phòng dự kiến nhưng chưa từng được check-in.`,
        data: {
          actionUrl: `/admin/bookings/${bookingId}`,
          targetType: 'booking',
          targetId: bookingId,
          bookingId,
          guestName,
        },
      });
    });

    await Promise.all(promises).catch((err) =>
      console.error('Error sending admin suspected no-show notifications:', err),
    );
  }
}
