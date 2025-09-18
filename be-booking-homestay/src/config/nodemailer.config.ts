import * as nodemailer from 'nodemailer';
import {
  SENDER_EMAIL,
  SENDER_PASSWORD,
} from 'src/common/constant/app.constant';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: SENDER_EMAIL, //gmail sender accoount
    pass: SENDER_PASSWORD, //app password
  },
});

export default transporter;
