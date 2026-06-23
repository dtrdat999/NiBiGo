/** Chuyển message lỗi Supabase Auth (tiếng Anh) sang tiếng Việt thân thiện. */
export function mapAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "Email hoặc mật khẩu không đúng.";
  if (m.includes("email not confirmed")) return "Email chưa được xác nhận. Kiểm tra hộp thư của bạn.";
  if (m.includes("user already registered")) return "Email này đã được đăng ký.";
  if (m.includes("password should be at least")) return "Mật khẩu cần ít nhất 6 ký tự.";
  if (m.includes("rate limit") || m.includes("too many")) return "Bạn thao tác quá nhanh, thử lại sau ít phút.";
  if (m.includes("unable to validate email")) return "Email không hợp lệ.";
  return "Đã có lỗi xảy ra. Vui lòng thử lại.";
}
