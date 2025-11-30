import { Injectable } from '@nestjs/common';
import { SENDER_EMAIL } from 'src/common/constant/app.constant';
import transporter from 'src/config/nodemailer.config';

@Injectable()
export class MailService {
  async sendOtpMail(
    to: string,
    otp: string,
    type: 'REGISTER' | 'FORGOT_PASSWORD',
  ) {
    let subject = '';
    let html = '';

    if (type === 'REGISTER') {
      subject = '4Stay - Verify your account';
      html = `<p>Thank you for registering at <b>4Stay</b>.</p>
              <p>Your OTP code is: <b>${otp}</b></p>
              <p>This code will expire in 5 minutes.</p>`;
    }

    if (type === 'FORGOT_PASSWORD') {
      subject = '4Stay - Reset your password';
      html = `<p>You requested to reset your password at <b>4Stay</b>.</p>
              <p>Your OTP code is: <b>${otp}</b></p>
              <p>This code will expire in 5 minutes.</p>`;
    }

    await transporter.sendMail({
      from: `"4Stay Support" <${SENDER_EMAIL}>`,
      to,
      subject,
      html,
    });
  }

  async sendBookingMail(
    to: string,
    type: 'BOOKING_PENDING' | 'BOOKING_CONFIRMED' | 'BOOKING_CANCELLED',
    booking: any,
  ) {
    let subject = '';
    let html = '';

    switch (type) {
      case 'BOOKING_PENDING':
        subject = '4Stay - Booking mới đang chờ xác nhận';
        html = `
        <p>Mã booking: <b>#${booking.id}</b></p>
        <p>Khách: <b>${booking.guestFullName}</b></p>
        <p>Ngày nhận phòng: <b>${booking.checkIn}</b></p>
        <p>Ngày trả phòng: <b>${booking.checkOut}</b></p>
        <p>Trạng thái: <b>PENDING</b></p>
      `;
        break;

      case 'BOOKING_CONFIRMED':
        subject = '4Stay - Booking của bạn đã được xác nhận';
        html = `
        <p>Mã booking: <b>#${booking.id}</b></p>
        <p>Check-in: ${booking.checkIn}</p>
        <p>Check-out: ${booking.checkOut}</p>
        <p>Booking đã được xác nhận thành công.</p>
      `;
        break;

      case 'BOOKING_CANCELLED':
        subject = '4Stay - Booking đã bị hủy';
        html = `
        <p>Mã booking: <b>#${booking.id}</b></p>
        <p>Trạng thái: <b>CANCELLED</b></p>
        <p>Nếu bạn không thực hiện hành động này, vui lòng liên hệ hỗ trợ.</p>
      `;
        break;
    }

    await transporter.sendMail({
      from: `"4Stay Support" <${SENDER_EMAIL}>`,
      to,
      subject,
      html,
    });
  }
}
