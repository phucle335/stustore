import { getSiteUrl } from "@/lib/auth/site-url";

export type PasswordResetAudience = "customer" | "admin";

const RESET_PATH: Record<PasswordResetAudience, string> = {
  customer: "/dat-lai-mat-khau",
  admin: "/login/dat-lai-mat-khau",
};

const FORGOT_PATH: Record<PasswordResetAudience, string> = {
  customer: "/quen-mat-khau",
  admin: "/login/quen-mat-khau",
};

const LOGIN_PATH: Record<PasswordResetAudience, string> = {
  customer: "/dang-nhap",
  admin: "/login",
};

export function getForgotPasswordPath(audience: PasswordResetAudience): string {
  return FORGOT_PATH[audience];
}

export function getLoginPath(audience: PasswordResetAudience): string {
  return LOGIN_PATH[audience];
}

/** URL Supabase gọi về sau khi user bấm link trong email. */
export function buildPasswordResetRedirectTo(
  audience: PasswordResetAudience,
): string {
  const next = RESET_PATH[audience];
  return `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(next)}`;
}

export function mapAuthErrorMessage(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("rate limit") || lower.includes("too many")) {
    return "Gửi email quá nhiều lần. Vui lòng thử lại sau vài phút.";
  }
  if (lower.includes("invalid") && lower.includes("email")) {
    return "Email không hợp lệ.";
  }
  if (lower.includes("same") && lower.includes("password")) {
    return "Mật khẩu mới phải khác mật khẩu cũ.";
  }
  if (lower.includes("weak") || lower.includes("password")) {
    return "Mật khẩu không đủ mạnh. Dùng ít nhất 6 ký tự.";
  }
  if (lower.includes("session") || lower.includes("expired")) {
    return "Link đặt lại mật khẩu đã hết hạn. Yêu cầu gửi lại email.";
  }
  return message;
}
