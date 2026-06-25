/**
 * Blog Helper Utilities
 * - Vietnamese slug generation (dấu → không dấu)
 * - Reading time calculation
 * - HTML content helpers
 */

/**
 * Bảng chuyển đổi ký tự tiếng Việt sang không dấu
 */
const vietnameseMap: Record<string, string> = {
  à: 'a',
  á: 'a',
  ạ: 'a',
  ả: 'a',
  ã: 'a',
  â: 'a',
  ầ: 'a',
  ấ: 'a',
  ậ: 'a',
  ẩ: 'a',
  ẫ: 'a',
  ă: 'a',
  ằ: 'a',
  ắ: 'a',
  ặ: 'a',
  ẳ: 'a',
  ẵ: 'a',
  è: 'e',
  é: 'e',
  ẹ: 'e',
  ẻ: 'e',
  ẽ: 'e',
  ê: 'e',
  ề: 'e',
  ế: 'e',
  ệ: 'e',
  ể: 'e',
  ễ: 'e',
  ì: 'i',
  í: 'i',
  ị: 'i',
  ỉ: 'i',
  ĩ: 'i',
  ò: 'o',
  ó: 'o',
  ọ: 'o',
  ỏ: 'o',
  õ: 'o',
  ô: 'o',
  ồ: 'o',
  ố: 'o',
  ộ: 'o',
  ổ: 'o',
  ỗ: 'o',
  ơ: 'o',
  ờ: 'o',
  ớ: 'o',
  ợ: 'o',
  ở: 'o',
  ỡ: 'o',
  ù: 'u',
  ú: 'u',
  ụ: 'u',
  ủ: 'u',
  ũ: 'u',
  ư: 'u',
  ừ: 'u',
  ứ: 'u',
  ự: 'u',
  ử: 'u',
  ữ: 'u',
  ỳ: 'y',
  ý: 'y',
  ỵ: 'y',
  ỷ: 'y',
  ỹ: 'y',
  đ: 'd',
  À: 'A',
  Á: 'A',
  Ạ: 'A',
  Ả: 'A',
  Ã: 'A',
  Â: 'A',
  Ầ: 'A',
  Ấ: 'A',
  Ậ: 'A',
  Ẩ: 'A',
  Ẫ: 'A',
  Ă: 'A',
  Ằ: 'A',
  Ắ: 'A',
  Ặ: 'A',
  Ẳ: 'A',
  Ẵ: 'A',
  È: 'E',
  É: 'E',
  Ẹ: 'E',
  Ẻ: 'E',
  Ẽ: 'E',
  Ê: 'E',
  Ề: 'E',
  Ế: 'E',
  Ệ: 'E',
  Ể: 'E',
  Ễ: 'E',
  Ì: 'I',
  Í: 'I',
  Ị: 'I',
  Ỉ: 'I',
  Ĩ: 'I',
  Ò: 'O',
  Ó: 'O',
  Ọ: 'O',
  Ỏ: 'O',
  Õ: 'O',
  Ô: 'O',
  Ồ: 'O',
  Ố: 'O',
  Ộ: 'O',
  Ổ: 'O',
  Ỗ: 'O',
  Ơ: 'O',
  Ờ: 'O',
  Ớ: 'O',
  Ợ: 'O',
  Ở: 'O',
  Ỡ: 'O',
  Ù: 'U',
  Ú: 'U',
  Ụ: 'U',
  Ủ: 'U',
  Ũ: 'U',
  Ư: 'U',
  Ừ: 'U',
  Ứ: 'U',
  Ự: 'U',
  Ử: 'U',
  Ữ: 'U',
  Ỳ: 'Y',
  Ý: 'Y',
  Ỵ: 'Y',
  Ỷ: 'Y',
  Ỹ: 'Y',
  Đ: 'D',
};

/**
 * Chuyển chuỗi tiếng Việt thành slug SEO-friendly
 * "Kinh nghiệm du lịch Đà Lạt 2025" → "kinh-nghiem-du-lich-da-lat-2025"
 */
export function generateSlug(text: string): string {
  let slug = text.toLowerCase();

  // Chuyển ký tự tiếng Việt sang không dấu
  slug = slug
    .split('')
    .map((char) => vietnameseMap[char] || char)
    .join('');

  // Xóa ký tự đặc biệt, thay khoảng trắng bằng dấu gạch ngang
  slug = slug
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug;
}

/**
 * Tính thời gian đọc bài viết (phút)
 * Dựa trên tốc độ đọc trung bình: ~200 từ/phút (tiếng Việt)
 */
export function calculateReadingTime(htmlContent: string): number {
  // Strip HTML tags để lấy text thuần
  const textContent = htmlContent.replace(/<[^>]*>/g, '').trim();

  // Đếm từ (tiếng Việt tách bằng khoảng trắng)
  const wordCount = textContent
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

  // Tốc độ đọc trung bình: 200 từ/phút, tối thiểu 1 phút
  return Math.max(1, Math.ceil(wordCount / 200));
}

/**
 * Tạo excerpt tự động từ HTML content nếu user không nhập
 * Lấy ~160 ký tự đầu tiên (phù hợp meta description)
 */
export function generateExcerpt(htmlContent: string, maxLength = 160): string {
  const textContent = htmlContent
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (textContent.length <= maxLength) {
    return textContent;
  }

  // Cắt tại ranh giới từ
  const truncated = textContent.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return (
    (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + '...'
  );
}
