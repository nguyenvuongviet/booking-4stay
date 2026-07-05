/**
 * Các hàm hỗ trợ kiểm tra định dạng (validation) dữ liệu cho các biểu mẫu nhập liệu
 */

/**
 * Kiểm tra định dạng email hợp lệ
 */
export function validateEmail(email: string): string {
  const trimmed = email.trim();
  if (!trimmed) {
    return "Vui lòng nhập địa chỉ email.";
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return "Địa chỉ email không đúng định dạng (Ví dụ: name@example.com).";
  }
  return "";
}

/**
 * Kiểm tra độ mạnh mật khẩu đối với form đổi mật khẩu mới (Kiểm tra nghiêm ngặt)
 */
export function validatePasswordStrength(pwd: string): string {
  if (!pwd) return "Vui lòng nhập mật khẩu mới.";
  if (pwd.length < 8) return "Mật khẩu mới phải có tối thiểu 8 ký tự.";

  const hasUppercase = /[A-Z]/.test(pwd);
  const hasLowercase = /[a-z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSpecial = /[@$!%*?&]/.test(pwd);

  const missing = [];
  if (!hasUppercase) missing.push("chữ hoa");
  if (!hasLowercase) missing.push("chữ thường");
  if (!hasNumber) missing.push("chữ số");
  if (!hasSpecial) missing.push("ký tự đặc biệt");

  if (missing.length > 0) {
    return `Mật khẩu chưa đủ mạnh. Cần thêm: ${missing.join(", ")}.`;
  }
  return "";
}

/**
 * Kiểm tra mật khẩu đăng nhập (Kiểm tra đơn giản hơn để tránh khóa tài khoản demo)
 */
export function validateLoginPassword(pwd: string): string {
  const trimmed = pwd.trim();
  if (!trimmed) {
    return "Vui lòng nhập mật khẩu.";
  }
  if (trimmed.length < 6) {
    return "Mật khẩu phải chứa ít nhất 6 ký tự.";
  }
  return "";
}

/**
 * Kiểm tra định dạng số điện thoại Việt Nam hợp lệ
 */
export function validatePhoneNumber(phone: string): string {
  const trimmed = phone.trim();
  if (!trimmed) {
    return "Số điện thoại không được để trống.";
  }
  const phoneRegex = /^0[0-9]{8,10}$/;
  if (!phoneRegex.test(trimmed)) {
    return "Số điện thoại không hợp lệ (Ví dụ: 0912345678, gồm 9-11 chữ số bắt đầu bằng 0).";
  }
  return "";
}

/**
 * Kiểm tra độ dài họ và tên
 */
export function validateFullName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) {
    return "Họ và tên không được để trống.";
  }
  if (trimmed.length < 2) {
    return "Họ và tên phải có ít nhất 2 ký tự.";
  }
  return "";
}
