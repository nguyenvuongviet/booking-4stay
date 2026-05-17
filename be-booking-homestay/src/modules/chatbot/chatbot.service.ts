import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ACCESS_TOKEN_SECRET } from 'src/common/constant/app.constant';
import { ChatbotContextService } from './chatbot-context.service';
import { GeminiService } from './gemini.service';
import { PromptBuilder } from './promt.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly gemini: GeminiService,
    private readonly contextService: ChatbotContextService,
    private readonly jwtService: JwtService,
  ) { }

  // Temporary in-memory history; can be replaced with Redis/DB later.
  private memory = new Map<string, any[]>();

  async chat(sessionId: string, message: string, authorization?: string) {
    const history = this.memory.get(sessionId) || [];
    const userId = this.resolveUserId(authorization);

    const context = await this.contextService.build(message, userId);
    const prompt = PromptBuilder.build(message, context, history);

    const response = await this.generateWithFallback(message, context, prompt);

    history.push({
      user: message,
      bot: response.reply,
      source: response.source,
    });

    this.memory.set(sessionId, history);

    return response;
  }

  async stream(sessionId: string, message: string, authorization?: string) {
    const history = this.memory.get(sessionId) || [];
    const userId = this.resolveUserId(authorization);

    const context = await this.contextService.build(message, userId);
    const prompt = PromptBuilder.build(message, context, history);

    return this.gemini.stream(prompt);
  }

  clearSession(sessionId: string) {
    this.memory.delete(sessionId);
    return { message: 'Chat history cleared' };
  }

  private async generateWithFallback(
    message: string,
    context: any,
    prompt: string,
  ) {
    try {
      const reply = await this.gemini.generate(prompt);
      return {
        reply,
        source: 'gemini',
        isFallback: false,
      };
    } catch (error) {
      if (!this.isGeminiQuotaError(error)) {
        throw error;
      }

      this.logger.warn('Gemini quota/rate limit reached. Using DB fallback.');
      return {
        reply: this.buildFallbackReply(message, context),
        source: 'fallback',
        isFallback: true,
        fallbackReason: 'GEMINI_QUOTA_OR_RATE_LIMIT',
      };
    }
  }

  private isGeminiQuotaError(error: any) {
    const text = `${error?.message || ''} ${error?.status || ''}`.toLowerCase();
    return (
      text.includes('429') ||
      text.includes('quota') ||
      text.includes('too many requests') ||
      text.includes('rate limit')
    );
  }

  private buildFallbackReply(message: string, context: any) {
    const normalized = this.normalize(message);
    const user = context?.currentUser;
    const namePrefix = user?.lastName ? `${user.lastName}, ` : '';

    if (this.isInventoryQuestion(normalized)) {
      return this.buildInventoryFallbackReply(context, namePrefix);
    }

    if (this.isLoyaltyQuestion(normalized)) {
      return this.buildLoyaltyFallbackReply(context, namePrefix);
    }

    if (
      normalized.includes('huy') ||
      normalized.includes('hoan') ||
      normalized.includes('refund') ||
      normalized.includes('cancel')
    ) {
      const rules = context?.cancellationPolicy?.rules || [];
      if (!rules.length) {
        return `Chào ${namePrefix}mình chưa có dữ liệu chính sách hủy phòng trong hệ thống.`;
      }

      const formattedRules = rules
        .map((rule: any) => {
          const percent = Math.round(Number(rule.refundPercent || 0) * 100);
          return `- Trước ${rule.daysBefore} ngày: hoàn ${percent}%`;
        })
        .join('\n');

      return `Chào ${namePrefix}đây là chính sách hoàn hủy hiện tại của 4Stay: ${formattedRules}.`;
    }

    const rooms = context?.rooms || [];
    if (rooms.length > 0) {
      const suggestions = rooms
        .slice(0, 3)
        .map((room: any) => this.formatRoomSuggestion(room))
        .join('\n\n');

      return [
        '**Gợi ý phòng phù hợp**',
        '',
        `*4Stay đang tạm gợi ý theo dữ liệu hệ thống.*`,
        '',
        suggestions,
      ].join('\n');
    }

    return `Chào ${namePrefix}4Stay đang bị giới hạn quota nên mình chỉ có thể trả lời từ dữ liệu hệ thống. Hiện chưa tìm thấy dữ liệu phù hợp với câu hỏi này.`;
  }

  private isInventoryQuestion(normalized: string) {
    const asksCount =
      normalized.includes('bao nhieu') ||
      normalized.includes('so luong') ||
      normalized.includes('tong') ||
      normalized.includes('dem');

    return (
      asksCount &&
      (normalized.includes('phong') ||
        normalized.includes('dia diem') ||
        normalized.includes('location') ||
        normalized.includes('noi co phong'))
    );
  }

  private formatRoomSuggestion(room: any) {
    const location =
      room.address?.fullAddress ||
      [room.address?.ward, room.address?.province].filter(Boolean).join(', ');

    return [
      `- **${room.name}**`,
      `  - *Địa chỉ:* ${location || 'chưa rõ địa chỉ'}`,
      `  - *Giá:* **${Number(room.pricePerNight).toLocaleString('vi-VN')} VND/đêm**`,
      `  - *Sức chứa:* ${room.capacity?.adults || 0} người lớn, ${room.capacity?.children || 0} trẻ em`,
      `  - *Đánh giá:* ${room.rating || 0}/5 (${room.reviewCount || 0} lượt)`,
    ].join('\n');
  }

  private buildInventoryFallbackReply(context: any, namePrefix: string) {
    const summary = context?.inventorySummary;
    const locations = Array.isArray(context?.locations) ? context.locations : [];

    if (!summary) {
      return `**Thống kê phòng**\n\n${namePrefix}mình chưa lấy được thống kê phòng và địa điểm từ hệ thống.`;
    }

    const locationNames = locations
      .slice(0, 10)
      .map((location: any) => `- ${location.name}: ${location.roomCount} phòng`)
      .join('\n');

    const detail = locationNames
      ? `\n\n**Địa điểm đang có phòng**\n${locationNames}`
      : '';

    return `**Thống kê phòng**\n\n${namePrefix}hiện hệ thống có **${summary.totalRooms} phòng** tại **${summary.totalLocationsWithRooms} địa điểm** có phòng.${detail}`;
  }

  private isLoyaltyQuestion(normalized: string) {
    const hasLocationPhrase =
      normalized.includes('dia diem') || normalized.includes('location');
    const asksPoint = normalized.includes('diem') && !hasLocationPhrase;

    return (
      normalized.includes('ten') ||
      normalized.includes('email') ||
      normalized.includes('level') ||
      normalized.includes('cap do') ||
      normalized.includes('hang thanh vien') ||
      normalized.includes('hang cua toi') ||
      asksPoint ||
      normalized.includes('than thiet') ||
      normalized.includes('loyalty')
    );
  }

  private buildLoyaltyFallbackReply(context: any, namePrefix: string) {
    const user = context?.currentUser;
    const levels = Array.isArray(context?.loyaltyLevels)
      ? context.loyaltyLevels
      : [];

    const levelLines = levels.length
      ? levels
        .map((level: any) => {
          const discount = this.formatPercent(level.discountPercent);
          const maxDiscount = Number(level.maxDiscountAmount || 0);
          const maxDiscountText =
            maxDiscount > 0
              ? `, giảm tối đa ${maxDiscount.toLocaleString('vi-VN')} VND`
              : '';
          const description = level.description
            ? ` - ${level.description}`
            : '';
          return `- ${level.name}: từ ${level.minPoints} điểm, giảm ${discount}${maxDiscountText}${description}`;
        })
        .join('\n')
      : '- Chưa có dữ liệu cấp độ loyalty trong hệ thống.';

    if (!user) {
      return [
        '**Chương trình khách hàng thân thiết**',
        '',
        'Mình chưa nhận được thông tin đăng nhập của bạn nên chưa xem được hạng hiện tại.',
        '',
        '**Các cấp độ hiện có**',
        '',
        levelLines,
      ].join('\n');
    }

    const loyalty = user.loyalty;
    if (!loyalty) {
      return [
        '**Chương trình khách hàng thân thiết**',
        '',
        `Chào ${namePrefix}tài khoản của bạn là ${user.email}, nhưng chưa có dữ liệu hạng thành viên.`,
        '',
        '**Các cấp độ hiện có**',
        '',
        levelLines,
      ].join('\n');
    }

    const currentLevel = loyalty.currentLevel;
    const currentDiscount = this.formatPercent(currentLevel.discountPercent);
    const currentMaxDiscount = Number(currentLevel.maxDiscountAmount || 0);
    const currentMaxDiscountText =
      currentMaxDiscount > 0
        ? `, giảm tối đa ${currentMaxDiscount.toLocaleString('vi-VN')} VND`
        : '';
    const next = loyalty.nextLevel
      ? `Bạn còn ${loyalty.nextLevel.pointsNeeded} điểm để lên hạng ${loyalty.nextLevel.name}.`
      : 'Bạn đang ở hạng cao nhất hiện có.';

    return [
      '**Thông tin hạng thành viên**',
      '',
      `Chào ${namePrefix}tài khoản của bạn là: **${user.email}**.`,
      '',
      `- Hạng hiện tại: **${currentLevel.name}**`,
      `- Điểm tích lũy: **${loyalty.points} điểm**`,
      `- Lịch sử: ${loyalty.totalBookings} booking, ${loyalty.totalNights} đêm`,
      `- Ưu đãi: giảm **${currentDiscount}**${currentMaxDiscountText}`,
      '',
      next,
      '',
      '**Toàn bộ chương trình khách hàng thân thiết**',
      '',
      levelLines,
    ].join('\n');
  }

  private formatPercent(value: any) {
    const percent = Number(value || 0);
    return `${percent % 1 === 0 ? percent : percent.toFixed(2)}%`;
  }

  private normalize(value: string) {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\u0111/g, 'd')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private resolveUserId(authorization?: string) {
    const token = authorization?.startsWith('Bearer ')
      ? authorization.slice('Bearer '.length).trim()
      : null;

    if (!token || !ACCESS_TOKEN_SECRET) return undefined;

    try {
      const payload = this.jwtService.verify<{ userId?: number }>(token, {
        secret: ACCESS_TOKEN_SECRET,
      });
      return payload.userId;
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }
}
