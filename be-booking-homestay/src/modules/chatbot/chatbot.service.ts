import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ACCESS_TOKEN_SECRET } from 'src/common/constant/app.constant';
import { ChatbotContextService } from './chatbot-context.service';
import { GeminiService } from './gemini.service';
import { PromptBuilder } from './promt.service';
import { ChatIntent, RagIntentService } from './rag-intent.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly gemini: GeminiService,
    private readonly contextService: ChatbotContextService,
    private readonly jwtService: JwtService,
    private readonly intentService: RagIntentService,
  ) { }

  // In-memory history (có thể nâng cấp lên Redis sau)
  private memory = new Map<string, any[]>();

  async chat(sessionId: string, message: string, authorization?: string) {
    const history = this.memory.get(sessionId) || [];
    const userId = this.resolveUserId(authorization);

    // 1. Detect intent
    const intent = this.intentService.detect(message);
    this.logger.log(`[RAG] Intent detected: ${intent} for message: "${message.slice(0, 60)}"`);

    // 2. Selective retrieval theo intent
    const context = await this.contextService.build(message, userId, intent);

    // 3. Build structured prompt
    const prompt = PromptBuilder.build(message, context, history, intent);

    // 4. Generate với Gemini
    const response = await this.generateWithFallback(intent, context, prompt);

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

    const intent = this.intentService.detect(message);
    const context = await this.contextService.build(message, userId, intent);
    const prompt = PromptBuilder.build(message, context, history, intent);

    return this.gemini.stream(prompt);
  }

  clearSession(sessionId: string) {
    this.memory.delete(sessionId);
    return { message: 'Chat history cleared' };
  }

  private async generateWithFallback(
    intent: ChatIntent,
    context: any,
    prompt: string,
  ) {
    try {
      const reply = await this.gemini.generate(prompt);
      return {
        reply,
        source: 'gemini',
        intent,
        isFallback: false,
      };
    } catch (error) {
      if (!this.isGeminiQuotaError(error))
        throw error;

      this.logger.warn('Gemini quota/rate limit reached. Using fallback.');
      return {
        reply: this.buildFallbackReply(intent, context),
        source: 'fallback',
        intent,
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

  // Fallback reply đơn giản theo intent (khi Gemini bị quota)
  private buildFallbackReply(intent: ChatIntent, context: any): string {
    const user = context?.currentUser;
    const greet = user?.firstName ? `${user.firstName}, ` : '';

    switch (intent) {
      case ChatIntent.ROOM_SEARCH: {
        const rooms: any[] = context?.rooms || [];
        if (!rooms.length) {
          return `Chào ${greet}hiện mình không tìm thấy phòng phù hợp. Bạn có thể cung cấp thêm địa điểm hoặc ngân sách không?`;
        }
        const list = rooms
          .slice(0, 3)
          .map((r) => {
            const addr = r.address?.province || r.address?.fullAddress || '';
            return `- **${r.name}** (${addr}) — ${Number(r.pricePerNight).toLocaleString('vi-VN')} VND/đêm, ${r.rating}/5 ⭐`;
          })
          .join('\n');
        return `**Gợi ý phòng phù hợp** _(dữ liệu hệ thống)_\n\n${list}`;
      }

      case ChatIntent.LOYALTY: {
        const levels: any[] = context?.loyaltyLevels || [];
        const loyalty = user?.loyalty;
        const lines: string[] = ['**Chương trình khách hàng thân thiết**'];
        if (loyalty) {
          lines.push(`- Hạng của bạn: **${loyalty.currentLevel?.name}** — ${loyalty.points} điểm`);
          if (loyalty.nextLevel) {
            lines.push(`- Còn ${loyalty.nextLevel.pointsNeeded} điểm để lên **${loyalty.nextLevel.name}**`);
          }
        }
        if (levels.length) {
          lines.push('');
          lines.push('**Các cấp độ:**');
          for (const l of levels) {
            lines.push(`- ${l.name}: từ ${l.minPoints} điểm, giảm ${l.discountPercent}%`);
          }
        }
        return lines.join('\n');
      }

      case ChatIntent.CANCELLATION: {
        const rules: any[] = context?.cancellationPolicy?.rules || [];
        if (!rules.length) return `Chào ${greet}mình chưa có dữ liệu chính sách hủy phòng.`;
        const list = rules
          .map((r) => `- Trước ${r.daysBefore} ngày: hoàn **${Math.round(Number(r.refundPercent || 0) * 100)}%**`)
          .join('\n');
        return `**Chính sách hủy phòng 4Stay**\n\n${list}`;
      }

      case ChatIntent.INVENTORY: {
        const s = context?.inventorySummary;
        if (!s) return `Chào ${greet}mình chưa lấy được thống kê từ hệ thống.`;
        return `**Thống kê hệ thống 4Stay**\n\n- Tổng phòng: **${s.totalRooms} phòng**\n- Tại **${s.totalLocationsWithRooms} địa điểm**`;
      }

      case ChatIntent.USER_PROFILE: {
        if (!user) return `Bạn chưa đăng nhập, mình không xem được thông tin tài khoản.`;
        return `**Thông tin tài khoản**\n\n- Tên: ${user.fullName}\n- Email: ${user.email}`;
      }

      default:
        return `Chào ${greet}4Stay đang tạm thời quá tải. Vui lòng thử lại sau ít phút.`;
    }
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
