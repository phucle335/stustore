/** Email tự gán admin (khớp trigger SQL). Thêm email khác nếu cần. */
export const ADMIN_EMAILS = ["workspaceplace22@gmail.com"] as const;

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  return ADMIN_EMAILS.some((adminEmail) => adminEmail === normalized);
}
