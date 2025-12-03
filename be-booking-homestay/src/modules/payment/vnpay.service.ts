import { Injectable } from '@nestjs/common';
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

@Injectable()
export class VNPayService {
  private vnpay: VNPay;

  constructor() {
    this.vnpay = new VNPay({
      tmnCode: VNPAY_TMN_CODE || '',
      secureSecret: VNPAY_SECRET_KEY || '',
      vnpayHost: VNPAY_HOST || '',
      testMode: true,
      hashAlgorithm: HashAlgorithm.SHA512,
      loggerFn: ignoreLogger,
    });
  }

  async createPaymentUrl(totalPrice: number, orderId: string): Promise<string> {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);

    const vnpayResponse = await this.vnpay.buildPaymentUrl({
      vnp_Amount: (totalPrice / 100) * 100, // VNPay yêu cầu đơn vị = VNĐ * 100
      vnp_IpAddr: '127.0.0.1',
      vnp_TxnRef: `${Date.now()}`,
      vnp_OrderInfo: orderId,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: VNPAY_RETURN_URL || '',
      vnp_Locale: VnpLocale.VN,
      vnp_CreateDate: dateFormat(now, 'yyyyMMddHHmmss'),
      vnp_ExpireDate: dateFormat(tomorrow, 'yyyyMMddHHmmss'),
    });

    return vnpayResponse;
  }

  verifyReturnUrl(query: Record<string, string>) {
    return this.vnpay.verifyReturnUrl(query as unknown as ReturnQueryFromVNPay);
  }
}
