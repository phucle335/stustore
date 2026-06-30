export const POINTS_PER_VND = 60_000;

export function calculatePointsFromOrder(subtotalVnd: number): number {
  return Math.max(0, Math.floor(subtotalVnd / POINTS_PER_VND));
}

export type MemberTier = "Starter" | "Member" | "Elite";

export function getTierFromPoints(points: number): MemberTier {
  if (points >= 2000) return "Elite";
  if (points >= 500) return "Member";
  return "Starter";
}

export function getNextTierInfo(points: number): {
  current: MemberTier;
  next: MemberTier | null;
  pointsNeeded: number;
  progress: number;
} {
  const current = getTierFromPoints(points);

  if (points >= 2000) {
    return {
      current: "Elite",
      next: null,
      pointsNeeded: 0,
      progress: 100,
    };
  }

  if (points >= 500) {
    const pointsNeeded = 2000 - points;
    const progress = Math.min(100, Math.round((points / 2000) * 100));
    return {
      current: "Member",
      next: "Elite",
      pointsNeeded,
      progress,
    };
  }

  const pointsNeeded = 500 - points;
  const progress = Math.min(100, Math.round((points / 500) * 100));
  return {
    current: "Starter",
    next: "Member",
    pointsNeeded,
    progress,
  };
}

export const MEMBERSHIP_TIERS: Record<
  MemberTier,
  { label: string; minPoints: number; benefits: string[] }
> = {
  Starter: {
    label: "Starter",
    minPoints: 0,
    benefits: [
      "Welcome Voucher: 100,000 VND off",
      "Access to member-only promotions",
      "Earn STU Points on every eligible purchase",
    ],
  },
  Member: {
    label: "Member",
    minPoints: 500,
    benefits: [
      "All Starter benefits",
      "Member Reward Voucher",
      "Early access to new arrivals and selected pre-orders",
      "Exclusive member-only discount codes",
      "Double STU Points during special campaigns",
    ],
  },
  Elite: {
    label: "Elite",
    minPoints: 2000,
    benefits: [
      "All Starter and Member benefits",
      "Elite Reward Voucher",
      "15% loyalty discount (maximum 1,000,000 VND)",
      "Exclusive gifts and merchandise",
      "Priority customer support",
      "Early access to limited sneaker releases and exclusive pre-orders",
      "Invitations to special events and campaigns",
    ],
  },
};
