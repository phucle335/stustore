import type { MemberTier } from "@/lib/supabase/types";

type TierBadgeProps = {
  tier: MemberTier;
  className?: string;
};

export function TierBadge({ tier, className }: TierBadgeProps) {
  const classMap: Record<MemberTier, string> = {
    Starter: "tier-starter",
    Member: "tier-member",
    Elite: "tier-elite",
  };

  return (
    <span className={`stuclub-tier-badge ${classMap[tier]} ${className ?? ""}`}>
      {tier}
    </span>
  );
}
