import * as crypto from 'crypto';

export function getVnPayTimestamp(): string {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const vn = new Date(utc + 7 * 3600 * 1000);

  const yyyy = vn.getFullYear();
  const MM = ('0' + (vn.getMonth() + 1)).slice(-2);
  const dd = ('0' + vn.getDate()).slice(-2);
  const HH = ('0' + vn.getHours()).slice(-2);
  const mm = ('0' + vn.getMinutes()).slice(-2);
  const ss = ('0' + vn.getSeconds()).slice(-2);

  return `${yyyy}${MM}${dd}${HH}${mm}${ss}`;
}

export function createVnpHash(secretKey: string, params: Record<string, any>) {
  const data =
    params.vnp_RequestId +
    '|' +
    params.vnp_Version +
    '|' +
    params.vnp_Command +
    '|' +
    params.vnp_TmnCode +
    '|' +
    params.vnp_TransactionType +
    '|' +
    params.vnp_TxnRef +
    '|' +
    params.vnp_Amount +
    '|' +
    (params.vnp_TransactionNo ?? '') +
    '|' +
    params.vnp_TransactionDate +
    '|' +
    params.vnp_CreateBy +
    '|' +
    params.vnp_CreateDate +
    '|' +
    params.vnp_IpAddr +
    '|' +
    params.vnp_OrderInfo;

  return crypto.createHmac('sha512', secretKey).update(data).digest('hex');
}
