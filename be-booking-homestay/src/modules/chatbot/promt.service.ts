import { ChatIntent } from './rag-intent.service';

export class PromptBuilder {
  static build(
    message: string,
    context: any,
    history: any[],
    intent?: ChatIntent,
  ): string {
    const recentHistory = Array.isArray(history) ? history.slice(-4) : [];
    const resolvedIntent = intent ?? ChatIntent.ROOM_SEARCH;

    const contextSection = PromptBuilder.buildContextSection(context, resolvedIntent);
    const historySection = PromptBuilder.buildHistorySection(recentHistory);

    return `Bạn là 4Stay AI Assistant — trợ lý AI của nền tảng đặt phòng homestay 4Stay.

## NHIỆM VỤ
- Hỗ trợ người dùng tìm phòng, xem chính sách, kiểm tra ưu đãi thành viên.
- Intent hiện tại: **${resolvedIntent}**

## QUY TẮC
- Trả lời bằng **tiếng Việt**
- Định dạng Markdown gọn đẹp: tiêu đề in đậm, danh sách gạch đầu dòng, các mục phân cách bằng dòng trống
- Mỗi bullet tối đa 1 câu
- CHỈ sử dụng dữ liệu trong CONTEXT — không bịa phòng, giá, địa chỉ, hay chính sách
- Nếu CONTEXT không có dữ liệu phù hợp, nói rõ và hỏi thêm thông tin
- Giá tiền đơn vị VND
- Nếu có CURRENT_USER, gọi người dùng bằng firstName

${contextSection}

${historySection}

## CÂU HỎI NGƯỜI DÙNG
${message}`;
  }

  // Context builders

  private static buildContextSection(context: any, intent: ChatIntent): string {
    const sections: string[] = ['## CONTEXT (từ cơ sở dữ liệu)'];

    if (context?.currentUser) {
      sections.push(PromptBuilder.buildUserSection(context.currentUser));
    }

    switch (intent) {
      case ChatIntent.ROOM_SEARCH:
        sections.push(PromptBuilder.buildRoomsSection(context?.rooms));
        if (context?.locations?.length) {
          sections.push(PromptBuilder.buildLocationsSection(context.locations));
        }
        break;

      case ChatIntent.LOYALTY:
        sections.push(PromptBuilder.buildLoyaltySection(context?.loyaltyLevels, context?.currentUser));
        break;

      case ChatIntent.CANCELLATION:
        sections.push(PromptBuilder.buildCancellationSection(context?.cancellationPolicy));
        break;

      case ChatIntent.INVENTORY:
        sections.push(PromptBuilder.buildInventorySection(context?.inventorySummary, context?.locations));
        break;

      case ChatIntent.USER_PROFILE:
        if (!context?.currentUser) {
          sections.push('_Người dùng chưa đăng nhập._');
        }
        break;

      case ChatIntent.GENERAL:
        if (context?.siteInfo) {
          sections.push(PromptBuilder.buildSiteInfoSection(context.siteInfo));
        }
        break;
    }

    return sections.join('\n\n');
  }

  private static buildUserSection(user: any): string {
    if (!user) return '';
    const loyalty = user.loyalty;
    const lines = [
      `### CURRENT_USER`,
      `- Tên: ${user.fullName || `${user.firstName} ${user.lastName}`.trim()}`,
      `- Email: ${user.email}`,
    ];

    if (loyalty) {
      lines.push(`- Hạng thành viên: **${loyalty.currentLevel?.name}**`);
      lines.push(`- Điểm tích lũy: **${loyalty.points} điểm**`);
      lines.push(`- Tổng booking: ${loyalty.totalBookings}, tổng đêm: ${loyalty.totalNights}`);
      lines.push(`- Ưu đãi: giảm ${loyalty.currentLevel?.discountPercent}%` +
        (loyalty.currentLevel?.maxDiscountAmount > 0
          ? `, tối đa ${Number(loyalty.currentLevel.maxDiscountAmount).toLocaleString('vi-VN')} VND`
          : ''));

      if (loyalty.nextLevel) {
        lines.push(`- Còn ${loyalty.nextLevel.pointsNeeded} điểm để lên hạng **${loyalty.nextLevel.name}**`);
      } else {
        lines.push(`- Đang ở hạng cao nhất`);
      }
    } else {
      lines.push(`- Chưa có dữ liệu loyalty`);
    }

    return lines.join('\n');
  }

  private static buildRoomsSection(rooms: any[]): string {
    if (!rooms?.length) {
      return `### PHÒNG PHÙ HỢP\n_Không tìm thấy phòng phù hợp trong hệ thống._`;
    }

    const lines = [`### PHÒNG PHÙ HỢP (${rooms.length} kết quả từ RAG)`];

    for (const r of rooms) {
      const addr = r.address?.fullAddress
        || [r.address?.ward, r.address?.province].filter(Boolean).join(', ')
        || 'Chưa rõ địa chỉ';

      lines.push(`\n**${r.name}**`);
      lines.push(`- Địa chỉ: ${addr}`);
      lines.push(`- Giá: ${Number(r.pricePerNight).toLocaleString('vi-VN')} VND/đêm`);
      lines.push(`- Sức chứa: ${r.capacity?.adults || 0} người lớn, ${r.capacity?.children || 0} trẻ em`);
      lines.push(`- Đánh giá: ${r.rating}/5 (${r.reviewCount} lượt)`);

      if (r.amenities?.length) {
        lines.push(`- Tiện nghi: ${r.amenities.slice(0, 5).join(', ')}`);
      }
      if (r.description) {
        lines.push(`- Mô tả: ${r.description}`);
      }
    }

    return lines.join('\n');
  }

  private static buildLocationsSection(locations: any[]): string {
    if (!locations?.length) return '';
    const list = locations
      .slice(0, 10)
      .map((l: any) => `- ${l.name}: ${l.roomCount} phòng`)
      .join('\n');
    return `### ĐỊA ĐIỂM CÓ PHÒNG\n${list}`;
  }

  private static buildLoyaltySection(levels: any[], currentUser: any): string {
    const lines = [`### CHƯƠNG TRÌNH KHÁCH HÀNG THÂN THIẾT`];

    if (!levels?.length) {
      lines.push('_Chưa có dữ liệu cấp độ loyalty._');
      return lines.join('\n');
    }

    lines.push('**Các cấp độ:**');
    for (const l of levels) {
      const discount = `${Number(l.discountPercent)}%`;
      const maxDiscount = l.maxDiscountAmount > 0
        ? `, tối đa ${Number(l.maxDiscountAmount).toLocaleString('vi-VN')} VND`
        : '';
      const desc = l.description ? ` — ${l.description}` : '';
      lines.push(`- **${l.name}**: từ ${l.minPoints} điểm, giảm ${discount}${maxDiscount}${desc}`);
    }

    return lines.join('\n');
  }

  private static buildCancellationSection(policy: any): string {
    const rules = policy?.rules;
    if (!rules?.length) {
      return `### CHÍNH SÁCH HỦY PHÒNG\n_Chưa có dữ liệu chính sách hủy phòng._`;
    }

    const lines = [`### CHÍNH SÁCH HỦY PHÒNG`];
    for (const rule of rules) {
      const percent = Math.round(Number(rule.refundPercent || 0) * 100);
      lines.push(`- Hủy trước **${rule.daysBefore} ngày**: hoàn **${percent}%** giá trị booking`);
    }

    if (policy?.updatedAt) {
      lines.push(`_Cập nhật lần cuối: ${new Date(policy.updatedAt).toLocaleDateString('vi-VN')}_`);
    }

    return lines.join('\n');
  }

  private static buildInventorySection(summary: any, locations: any[]): string {
    const lines = [`### THỐNG KÊ HỆ THỐNG`];

    if (summary) {
      lines.push(`- Tổng số phòng: **${summary.totalRooms} phòng**`);
      lines.push(`- Số địa điểm có phòng: **${summary.totalLocationsWithRooms} tỉnh/thành phố**`);
    }

    if (locations?.length) {
      lines.push('');
      lines.push('**Địa điểm đang có phòng:**');
      for (const l of locations.slice(0, 12)) {
        lines.push(`- ${l.name}: ${l.roomCount} phòng`);
      }
    }

    return lines.join('\n');
  }

  private static buildSiteInfoSection(siteInfo: any): string {
    const lines = [`### THÔNG TIN 4STAY`];
    if (siteInfo?.SITE_NAME) lines.push(`- Tên: ${siteInfo.SITE_NAME}`);
    if (siteInfo?.CONTACT_EMAIL) lines.push(`- Email liên hệ: ${siteInfo.CONTACT_EMAIL}`);
    return lines.join('\n');
  }

  private static buildHistorySection(history: any[]): string {
    if (!history.length) return '';

    const lines = ['## LỊCH SỬ HỘI THOẠI (4 tin nhắn gần nhất)'];
    for (const h of history) {
      if (h.user) lines.push(`**User:** ${h.user}`);
      if (h.bot) lines.push(`**Bot:** ${h.bot}`);
    }

    return lines.join('\n');
  }
}
