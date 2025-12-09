import { BadRequestException, Injectable } from '@nestjs/common';
import axios from 'axios';
import {
  VNPAY_HOST,
  VNPAY_RETURN_URL,
  VNPAY_SECRET_KEY,
  VNPAY_TMN_CODE,
} from 'src/common/constant/app.constant';
import {
  dateFormat,
  HashAlgorithm,
  ignoreLogger,
  ProductCode,
  ReturnQueryFromVNPay,
  VNPay,
  VnpLocale,
} from 'vnpay';
import { BookingService } from '../booking/booking.service';
import { PrismaService } from '../prisma/prisma.service';
import { createVnpHash, getVnPayTimestamp } from './vnpay.utils';

@Injectable()
export class VNPayService {
  private vnpay: VNPay;

  constructor(
    private readonly bookingService: BookingService,
    private readonly prisma: PrismaService,
  ) {
    this.vnpay = new VNPay({
      tmnCode: VNPAY_TMN_CODE,
      secureSecret: VNPAY_SECRET_KEY,
      vnpayHost: VNPAY_HOST,
      testMode: true,
      hashAlgorithm: HashAlgorithm.SHA512,
      loggerFn: ignoreLogger,
    });
  }

  async createPaymentUrl(totalPrice: number, orderId: string): Promise<string> {
    const now = new Date();
    const expire = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const vnpayResponse = await this.vnpay.buildPaymentUrl({
      vnp_Amount: (totalPrice / 100) * 100,
      vnp_IpAddr: '127.0.0.1',
      vnp_TxnRef: `${Date.now()}`,
      vnp_OrderInfo: orderId,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: VNPAY_RETURN_URL,
      vnp_Locale: VnpLocale.VN,
      vnp_CreateDate: dateFormat(now, 'yyyyMMddHHmmss'),
      vnp_ExpireDate: dateFormat(expire, 'yyyyMMddHHmmss'),
    });

    return vnpayResponse;
  }

  verifyReturnUrl(query: Record<string, string>) {
    return this.vnpay.verifyReturnUrl(query as unknown as ReturnQueryFromVNPay);
  }

  async handlePaymentReturn(query: Record<string, string>): Promise<string> {
    const verified = this.verifyReturnUrl(query);

    const bookingId = Number(query.vnp_OrderInfo);
    const responseCode = query.vnp_ResponseCode;
    const vnp_Amount = query.vnp_Amount;

    console.log({ vnp_Amount });

    const amount = Number(query.vnp_Amount) / 100;

    console.log({ amount });

    try {
      if (verified.isVerified && responseCode === '00') {
        await this.prisma.payments.create({
          data: {
            bookingId,
            amount,
            txnRef: query.vnp_TxnRef,
            transactionNo: query.vnp_TransactionNo,
            transactionDate: query.vnp_PayDate,
            bankCode: query.vnp_BankCode,
            cardType: query.vnp_CardType,
            status: 'SUCCESS',
            rawData: query,
          },
        });

        await this.bookingService.updateStatus(bookingId, amount);
        return `http://localhost:3000/booking?orderId=${bookingId}&status=success`;
      }

      await this.bookingService.updateStatus(bookingId, 0);
      return `http://localhost:3000/booking?orderId=${bookingId}&status=failed`;
    } catch (err) {
      console.error('Error in VNPay callback:', err);
      return `http://localhost:3000/booking?orderId=${bookingId}&status=failed`;
    }
  }

  async refund(
    bookingId: number,
    amount: number,
    adminId: number,
    reason?: string,
  ) {
    const payment = await this.prisma.payments.findFirst({
      where: {
        bookingId,
        status: 'SUCCESS',
      },
    });
    if (!payment)
      throw new BadRequestException('Không tìm thấy payment thành công');

    const reqId = `${Date.now()}`;
    const vnp_TransactionType = amount === Number(payment.amount) ? '02' : '03';

    const params = {
      vnp_RequestId: reqId,
      vnp_Version: '2.1.0',
      vnp_Command: 'refund',
      vnp_TmnCode: VNPAY_TMN_CODE,
      vnp_TransactionType,
      vnp_TxnRef: payment.txnRef,
      vnp_Amount: amount * 100,
      vnp_OrderInfo: reason ?? `Refund by ${adminId}`,
      vnp_TransactionNo: payment.transactionNo,
      vnp_TransactionDate: payment.transactionDate,
      vnp_CreateBy: String(adminId),
      vnp_CreateDate: getVnPayTimestamp(),
      vnp_IpAddr: '127.0.0.1',
    };

    const vnp_SecureHash = createVnpHash(VNPAY_SECRET_KEY, params);
    const body = { ...params, vnp_SecureHash };

    const apiUrl =
      'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction';

    const axiosRes = await axios.post(apiUrl, body, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000,
    });

    const vnpRes = axiosRes.data;

    console.log({ vnpRes });

    await this.prisma.refunds.create({
      data: {
        paymentId: payment.id,
        amount,
        createdBy: adminId,
        reason,
        requestId: reqId,
        transactionType: vnp_TransactionType === '02' ? 'FULL' : 'PARTIAL',
        rspCode: vnpRes.vnp_ResponseCode,
        rspMessage: vnpRes.vnp_Message,
        transactionDate: new Date(),
        rawData: vnpRes,
      },
    });

    if (vnpRes.vnp_ResponseCode === '00') {
      await this.prisma.payments.update({
        where: { id: payment.id },
        data: { status: 'REFUNDED' },
      });

      await this.bookingService.changeBookingStatus(bookingId, 'REFUNDED', {
        allowOverride: true,
        notifyAdmin: true,
        notifyUser: true,
      });

      return { message: 'Hoàn tiền thành công', vnpResponse: vnpRes };
    } else {
      throw new BadRequestException(
        `Hoàn tiền thất bại (Mã VNPay: ${vnpRes.vnp_ResponseCode}). Chi tiết: ${vnpRes.vnp_Message}`,
      );
    }
  }
}
