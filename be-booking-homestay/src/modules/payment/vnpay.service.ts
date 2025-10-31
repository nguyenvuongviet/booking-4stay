import { Injectable } from '@nestjs/common';
import { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat, HashAlgorithm, ReturnQueryFromVNPay  } from 'vnpay';
// import { format } from 'date-fns';

@Injectable()
export class VNPayService {
  private vnpay: VNPay;

  constructor() {
    this.vnpay = new VNPay({
      tmnCode: process.env.VNPAY_TMN_CODE || '',
      secureSecret: process.env.VNPAY_SECRET_KEY || '',
      vnpayHost: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
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
      vnp_Amount: totalPrice/100 * 100, // VNPay yêu cầu đơn vị = VNĐ * 100
      vnp_IpAddr: '127.0.0.1',
      vnp_TxnRef: `${Date.now()}`,
      vnp_OrderInfo:orderId,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: process.env.VNPAY_RETURN_URL || '',
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
