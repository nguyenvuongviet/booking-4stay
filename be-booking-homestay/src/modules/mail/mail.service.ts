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
}
