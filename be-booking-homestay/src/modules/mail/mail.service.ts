import { Injectable } from '@nestjs/common';
import { format } from 'date-fns';
import { SENDER_EMAIL } from 'src/common/constant/app.constant';
import transporter from 'src/config/nodemailer.config';

@Injectable()
export class MailService {
  private wrapTemplate(subject: string, body: string) {
    return `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; background: #f8f8f8;">
        <div style="background: #ffffff; padding: 20px; border-radius: 10px; border: 1px solid #eee;">
          <h2 style="color: #FF6B00; text-align: center; margin-bottom: 20px;">
            4Stay - ${subject}
          </h2>
          ${body}
        </div>
        <p style="text-align: center; font-size: 12px; color: #999; margin-top: 20px;">
          Đây là email tự động, vui lòng không trả lời lại.
        </p>
      </div>
    `;
  }

  private bookingInfoBlock(booking: any) {
    const nights =
      (new Date(booking.checkOut).getTime() -
        new Date(booking.checkIn).getTime()) /
      86400000;

    const remaining = booking.totalPrice - (booking.paidAmount || 0);

    return `
      <p><b>Mã Booking:</b> #${booking.id}</p>
      <p><b>Khách hàng:</b> ${booking.guestFullName}</p>
      <p><b>Email:</b> ${booking.guestEmail}</p>
      <p><b>SĐT:</b> ${booking.guestPhoneNumber}</p>

      <hr style="margin: 16px 0;" />

      <p><b>Phòng:</b> ${booking.rooms?.name ?? 'Không rõ'}</p>
      <p><b>Check-in:</b> ${format(new Date(booking.checkIn), 'dd/MM/yyyy')}</p>
      <p><b>Check-out:</b> ${format(new Date(booking.checkOut), 'dd/MM/yyyy')}</p>
      <p><b>Số đêm:</b> ${nights}</p>

      <hr style="margin: 16px 0;" />

      <p><b>Tổng giá:</b> ${booking.totalPrice.toLocaleString()} ₫</p>
      <p><b>Phương thức thanh toán:</b> ${booking.paymentMethod}</p>
      <p><b>Đã thanh toán:</b> ${booking.paidAmount?.toLocaleString() ?? 0} ₫</p>
      <p><b>Còn thiếu:</b> ${remaining.toLocaleString()} ₫</p>

      <hr style="margin: 16px 0;" />
    `;
  }

  async sendOtpMail(
    to: string,
    otp: string,
    type: 'REGISTER' | 'FORGOT_PASSWORD',
  ) {
    let subject = '';
    let body = '';

    if (type === 'REGISTER') {
      subject = 'Xác minh tài khoản';
      body = `
        <p>Cảm ơn bạn đã đăng ký tại <b>4Stay</b>.</p>
        <p>Mã OTP của bạn là:</p>
        <h3 style="text-align:center; color:#FF6B00; font-size: 28px;">${otp}</h3>
        <p>Mã có hiệu lực trong 5 phút.</p>
      `;
    }

    if (type === 'FORGOT_PASSWORD') {
      subject = 'Đặt lại mật khẩu';
      body = `
        <p>Bạn đã yêu cầu đặt lại mật khẩu.</p>
        <p>Mã OTP của bạn là:</p>
        <h3 style="text-align:center; color:#FF6B00; font-size: 28px;">${otp}</h3>
        <p>Mã sẽ hết hạn sau 5 phút.</p>
      `;
    }

    await transporter.sendMail({
      from: `"4Stay Support" <${SENDER_EMAIL}>`,
      to,
      subject: `4Stay – ${subject}`,
      html: this.wrapTemplate(subject, body),
    });
  }

  async sendBookingMail(
    to: string,
    type:
      | 'BOOKING_PENDING'
      | 'BOOKING_CONFIRMED'
      | 'BOOKING_CANCELLED'
      | 'BOOKING_PARTIALLY_PAID'
      | 'BOOKING_REFUNDED'
      | 'BOOKING_CHECKED_IN'
      | 'BOOKING_CHECKED_OUT'
      | 'BOOKING_WAITING_REFUND',
    booking: any,
  ) {
    let subject = '';
    let body = '';

    const info = this.bookingInfoBlock(booking);

    switch (type) {
      case 'BOOKING_PENDING':
        subject = 'Booking mới đang chờ xác nhận';
        body = `
        ${info}
        <p style="color:#FF6B00;"><b>Trạng thái:</b> PENDING</p>
        <p>Booking của bạn đã được tạo thành công và đang chờ xử lý từ hệ thống 4Stay.</p>
      `;
        break;

      case 'BOOKING_PARTIALLY_PAID':
        subject = 'Thanh toán một phần thành công';
        body = `
        ${info}
        <p style="color:#007bff;"><b>Trạng thái:</b> PARTIALLY_PAID</p>
        <p>Bạn đã thanh toán một phần cho booking này.</p>
        <p>Vui lòng hoàn tất khoản còn lại để được xác nhận đặt phòng.</p>
      `;
        break;

      case 'BOOKING_CONFIRMED':
        subject = 'Booking đã được xác nhận';
        body = `
        ${info}
        <p style="color:green;"><b>Trạng thái:</b> CONFIRMED</p>
        <p>Chúc mừng! Booking của bạn đã được xác nhận thành công.</p>
        <p>Hãy chuẩn bị hành lý cho kỳ nghỉ tuyệt vời cùng 4Stay.</p>
      `;
        break;

      case 'BOOKING_CHECKED_IN':
        subject = 'Bạn đã nhận phòng';
        body = `
        ${info}
        <p style="color:green;"><b>Trạng thái:</b> CHECKED_IN</p>
        <p>Chúc bạn có một kỳ nghỉ tuyệt vời!</p>
      `;
        break;

      case 'BOOKING_CHECKED_OUT':
        subject = 'Bạn đã trả phòng';
        body = `
        ${info}
        <p style="color:#333;"><b>Trạng thái:</b> CHECKED_OUT</p>
        <p>Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ của 4Stay.</p>
        <p>Chúng tôi hy vọng bạn đã có một trải nghiệm thật tuyệt vời.</p>
      `;
        break;

      case 'BOOKING_CANCELLED':
        subject = 'Booking đã bị hủy';
        body = `
        ${info}
        <p style="color:red;"><b>Trạng thái:</b> CANCELLED</p>
        <p><b>Lý do hủy:</b></p>
        <p><i>${booking.cancelReason ?? 'Không có lý do'}</i></p>
      `;
        break;

      case 'BOOKING_WAITING_REFUND':
        subject = 'Yêu cầu hoàn tiền – cần xử lý';
        body = `
        ${info}
        <p style="color:#c77d00;"><b>Trạng thái:</b> WAITING_REFUND</p>
        <p>Booking đã bị hủy và khách có phát sinh thanh toán.</p>
        <p>Vui lòng tiến hành hoàn tiền cho khách.</p>
      `;
        break;

      case 'BOOKING_REFUNDED':
        subject = 'Hoàn tiền thành công';
        body = `
        ${info}
        <p style="color:#28a745;"><b>Trạng thái:</b> REFUNDED</p>
        <p>Khoản thanh toán của bạn đã được hoàn trả thành công.</p>
        <p>Vui lòng kiểm tra tài khoản ngân hàng hoặc ví thanh toán.</p>
      `;
        break;
    }

    await transporter.sendMail({
      from: `"4Stay Support" <${SENDER_EMAIL}>`,
      to,
      subject: `4Stay - ${subject}`,
      html: this.wrapTemplate(subject, body),
    });
  }
}
