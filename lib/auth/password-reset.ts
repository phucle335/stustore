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

/** URL Supabase redirects to after user clicks link in email. */
export function buildPasswordResetRedirectTo(
  audience: PasswordResetAudience,
): string {
  const next = RESET_PATH[audience];
  return `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(next)}`;
}

export function mapAuthErrorMessage(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("rate limit") || lower.includes("too many")) {
    return "Too many attempts. Please try again in a few minutes.";
  }
  if (lower.includes("invalid") && lower.includes("email")) {
    return "Invalid email address.";
  }
  if (lower.includes("same") && lower.includes("password")) {
    return "New password must be different from current password.";
  }
  if (lower.includes("weak") || lower.includes("password")) {
    return "Password not strong enough. Use at least 6 characters.";
  }
  if (lower.includes("session") || lower.includes("expired")) {
    return "Password reset link expired. Please request a new one.";
  }
  return message;
}
