import { Injectable } from '@nestjs/common';

export enum ChatIntent {
  ROOM_SEARCH = 'ROOM_SEARCH',       // tìm phòng
  LOYALTY = 'LOYALTY',               // hỏi điểm, hạng thành viên, ưu đãi
  CANCELLATION = 'CANCELLATION',     // chính sách hủy, hoàn tiền
  INVENTORY = 'INVENTORY',           // bao nhiêu phòng, địa điểm
  USER_PROFILE = 'USER_PROFILE',     // thông tin tài khoản cá nhân
  GENERAL = 'GENERAL',               // câu hỏi chung về 4Stay
}

// Từ khóa phân loại intent — tiếng Việt đã bỏ dấu
const INTENT_PATTERNS: Record<ChatIntent, RegExp[]> = {
  [ChatIntent.ROOM_SEARCH]: [
    /phong/,
    /homestay/,
    /villa/,
    /resort/,
    /nha nghi/,
    /khach san/,
    /dat phong/,
    /tim phong/,
    /co phong/,
    /gia phong/,
    /o dau/,
    /o (tai|o) /,
    /goi y/,
    /de xuat/,
    /tien nghi/,
    /biet thu/,
    /view/,
    /bien/,
    /nui/,
    /trung tam/,
    /suc chua/,
    /nguoi lon/,
    /tre em/,
    /gia re/,
    /cao cap/,
    /gia bao nhieu/,
    /bao nhieu tien/,
    /wifi/,
    /ho boi/,
    /dieu hoa/,
    /bep/,
  ],
  [ChatIntent.LOYALTY]: [
    /diem/,
    /hang thanh vien/,
    /khach hang than thiet/,
    /loyalty/,
    /cap do/,
    /hang cua toi/,
    /uu dai/,
    /giam gia/,
    /tich diem/,
    /nang hang/,
    /silver/,
    /gold/,
    /platinum/,
    /diamond/,
    /bronze/,
    /bao nhieu diem/,
    /con thieu bao nhieu/,
  ],
  [ChatIntent.CANCELLATION]: [
    /huy/,
    /hoan/,
    /refund/,
    /cancel/,
    /chinh sach/,
    /hoan tien/,
    /phi huy/,
    /hoan huy/,
    /tra phong/,
    /boi thuong/,
  ],
  [ChatIntent.INVENTORY]: [
    /bao nhieu phong/,
    /so luong phong/,
    /tong so phong/,
    /bao nhieu dia diem/,
    /co bao nhieu/,
    /thong ke/,
    /tong quan/,
    /co may/,
    /so luong/,
    /dem phong/,
  ],
  [ChatIntent.USER_PROFILE]: [
    /tai khoan/,
    /thong tin ca nhan/,
    /ten cua toi/,
    /email cua toi/,
    /ho so/,
    /thong tin cua toi/,
    /xem thong tin/,
  ],
  [ChatIntent.GENERAL]: [
    /4stay/,
    /lien he/,
    /hotline/,
    /ho tro/,
    /gioi thieu/,
    /4stay la gi/,
    /website/,
    /app/,
    /ung dung/,
    /xin chao/,
    /chao/,
    /hello/,
    /hi /,
  ],
};

@Injectable()
export class RagIntentService {
  /**
   * Phát hiện intent của câu hỏi người dùng
   * Trả về intent với điểm cao nhất, fallback về ROOM_SEARCH
   */
  detect(message: string): ChatIntent {
    const normalized = this.normalize(message);

    const scores: Record<ChatIntent, number> = {
      [ChatIntent.ROOM_SEARCH]: 0,
      [ChatIntent.LOYALTY]: 0,
      [ChatIntent.CANCELLATION]: 0,
      [ChatIntent.INVENTORY]: 0,
      [ChatIntent.USER_PROFILE]: 0,
      [ChatIntent.GENERAL]: 0,
    };

    for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(normalized)) {
          scores[intent as ChatIntent]++;
        }
      }
    }

    const best = Object.entries(scores).sort(([, a], [, b]) => b - a)[0];

    // Nếu không có pattern nào match → mặc định ROOM_SEARCH
    if (best[1] === 0) return ChatIntent.ROOM_SEARCH;

    return best[0] as ChatIntent;
  }

  private normalize(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\u0111/g, 'd')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
