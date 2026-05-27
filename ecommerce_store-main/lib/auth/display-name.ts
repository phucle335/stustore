export function resolveDisplayName(
  fullName: string | null | undefined,
  email: string | null | undefined,
): string {
  const trimmed = fullName?.trim();
  if (trimmed) return trimmed;

  const mail = email?.trim();
  if (!mail) return "Khách hàng";

  const local = mail.split("@")[0];
  return local.length > 0 ? local : "Khách hàng";
}
