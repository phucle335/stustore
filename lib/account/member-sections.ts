export type MemberSectionId =
  | "orders"
  | "coupons"
  | "favorites"
  | "profile"
  | "password"
  | "preferences";

export type MemberAccountSection = {
  id: MemberSectionId;
  label: string;
};

export const MEMBER_ACCOUNT_SECTIONS: readonly MemberAccountSection[] = [
  { id: "orders", label: "Order History" },
  { id: "coupons", label: "Coupons" },
  { id: "favorites", label: "Favorites" },
  { id: "profile", label: "Edit Profile" },
  { id: "password", label: "Change Password" },
  { id: "preferences", label: "Preferences" },
] as const;

const MEMBER_SECTION_IDS = new Set<string>(
  MEMBER_ACCOUNT_SECTIONS.map((section) => section.id),
);

export const DEFAULT_MEMBER_SECTION_ID: MemberSectionId = "orders";

export function parseMemberSectionId(
  value: string | null | undefined,
): MemberSectionId | null {
  if (!value || !MEMBER_SECTION_IDS.has(value)) {
    return null;
  }
  return value as MemberSectionId;
}

export function buildMemberAccountUrl(sectionId: MemberSectionId): string {
  return `/tai-khoan?section=${sectionId}`;
}
