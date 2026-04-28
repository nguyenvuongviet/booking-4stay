/**
 * Timezone Utility - Chuẩn "Lưu UTC - Hiển thị Local"
 *
 * Nguyên tắc:
 *  - Database: Luôn lưu UTC
 *  - Backend: Tính toán nghiệp vụ theo giờ VN (Asia/Ho_Chi_Minh = UTC+7)
 *  - Frontend: Nhận UTC ISO string, tự hiển thị theo timezone trình duyệt
 */

/** Offset múi giờ Việt Nam so với UTC (phút) */
const VN_OFFSET_MINUTES = 7 * 60; // 420 phút

/**
 * Lấy thời điểm hiện tại theo giờ Việt Nam.
 * Dùng để so sánh nghiệp vụ (chính sách hủy, cửa sổ đổi ngày, v.v.)
 */
export function nowVN(): Date {
  const utcMs = Date.now();
  return new Date(utcMs + VN_OFFSET_MINUTES * 60 * 1000);
}

/**
 * Chuyển một Date object (UTC) thành thời điểm tương đương theo giờ VN.
 * Trả về Date object vẫn là UTC nhưng giá trị đã được dịch +7h.
 */
export function toVNTime(utcDate: Date): Date {
  return new Date(utcDate.getTime() + VN_OFFSET_MINUTES * 60 * 1000);
}

/**
 * Tính số ngày còn lại từ "bây giờ theo giờ VN" đến một mốc ngày (so sánh theo ngày, không theo giờ).
 * Dùng để tính "còn X ngày trước check-in" cho chính sách hủy phòng.
 */
export function daysUntilVN(targetDate: Date): number {
  const vnNow = nowVN();
  // Reset về 00:00:00 theo giờ VN
  const todayVN = new Date(
    Date.UTC(
      vnNow.getUTCFullYear(),
      vnNow.getUTCMonth(),
      vnNow.getUTCDate(),
    ),
  );

  // Chuyển target (thường là @db.Date -> UTC midnight) sang ngày VN
  const targetVN = new Date(
    Date.UTC(
      targetDate.getUTCFullYear(),
      targetDate.getUTCMonth(),
      targetDate.getUTCDate(),
    ),
  );

  return Math.floor(
    (targetVN.getTime() - todayVN.getTime()) / (1000 * 60 * 60 * 24),
  );
}

/**
 * Đảm bảo một chuỗi date (yyyy-MM-dd) được chuyển thành UTC midnight.
 * Dùng cho checkIn/checkOut vì DB lưu @db.Date (không có giờ).
 * Ví dụ: "2026-05-01" -> 2026-05-01T00:00:00.000Z
 */
export function toUTCMidnight(dateStr: string | Date): Date {
  const str =
    dateStr instanceof Date
      ? dateStr.toISOString().split('T')[0]
      : dateStr.split('T')[0];
  return new Date(`${str}T00:00:00.000Z`);
}

/**
 * Serialize một Date object thành chuỗi ISO UTC chuẩn có Z suffix.
 * Đảm bảo frontend nhận được chuỗi đúng định dạng để parse chính xác.
 * Ví dụ: new Date() -> "2026-04-28T16:00:00.000Z"
 */
export function toUTCISOString(date: Date | null | undefined): string | null {
  if (!date) return null;
  return date instanceof Date ? date.toISOString() : new Date(date).toISOString();
}
