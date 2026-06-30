import { TierBadge } from "@/components/stuclub/TierBadge";
import { ProgressBar } from "@/components/stuclub/ProgressBar";
import type { MemberTier } from "@/lib/supabase/types";

type PointsDisplayProps = {
  points: number;
  tier: MemberTier;
  nextTier: MemberTier | null;
  pointsNeeded: number;
  progress: number;
};

export function PointsDisplay({
  points,
  tier,
  nextTier,
  pointsNeeded,
  progress,
}: PointsDisplayProps) {
  return (
    <div className="stuclub-points-display">
      <div className="stuclub-points-header">
        <div>
          <p className="stuclub-points-label">STUClub Points</p>
          <p className="stuclub-points-value">{points.toLocaleString("en-US")}</p>
        </div>
        <TierBadge tier={tier} />
      </div>
      <ProgressBar
        currentPoints={points}
        currentTier={tier}
        nextTier={nextTier}
        pointsNeeded={pointsNeeded}
        progress={progress}
      />
    </div>
  );
}
