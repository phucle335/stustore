export type MemberProfile = {
  email: string;
  full_name: string | null;
  phone: string | null;
  address: string;
  birthday: string | null;
  gender: string;
  newsletter_opt_in: boolean;
  personalized_recommendations: boolean;
  personalized_ads: boolean;
};

export function emptyMemberProfile(
  email: string,
  fullName?: string | null,
): MemberProfile {
  return {
    email,
    full_name: fullName?.trim() || null,
    phone: null,
    address: "",
    birthday: null,
    gender: "",
    newsletter_opt_in: false,
    personalized_recommendations: false,
    personalized_ads: false,
  };
}

export function mapMemberProfileRow(
  row: Record<string, unknown> | null,
  fallbackEmail: string,
): MemberProfile {
  return {
    email:
      (typeof row?.email === "string" ? row.email : fallbackEmail) ||
      fallbackEmail,
    full_name: typeof row?.full_name === "string" ? row.full_name : null,
    phone: typeof row?.phone === "string" ? row.phone : null,
    address: typeof row?.address === "string" ? row.address : "",
    birthday:
      row?.birthday != null && String(row.birthday).length > 0
        ? String(row.birthday).slice(0, 10)
        : null,
    gender: typeof row?.gender === "string" ? row.gender : "",
    newsletter_opt_in: Boolean(row?.newsletter_opt_in),
    personalized_recommendations: Boolean(row?.personalized_recommendations),
    personalized_ads: Boolean(row?.personalized_ads),
  };
}

export function isMissingProfileColumn(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("does not exist") ||
    lower.includes("schema cache") ||
    (lower.includes("column") && lower.includes("users"))
  );
}
