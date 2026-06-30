import type { MemberTier } from "@/lib/supabase/types";

type ProgressBarProps = {
  currentPoints: number;
  currentTier: MemberTier;
  nextTier: MemberTier | null;
  pointsNeeded: number;
  progress: number;
};

const TIER_THRESHOLDS: Record<MemberTier, number> = {
  Starter: 0,
  Member: 500,
  Elite: 2000,
};

export function ProgressBar({
  currentPoints,
  currentTier,
  nextTier,
  pointsNeeded,
  progress,
}: ProgressBarProps) {
  const maxPoints = nextTier ? TIER_THRESHOLDS[nextTier] : TIER_THRESHOLDS[currentTier] + 1000;
  const startPoints = TIER_THRESHOLDS[currentTier];
  const range = Math.max(1, maxPoints - startPoints);
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className="stuclub-progress">
      <div className="stuclub-progress-header">
        <span className="stuclub-progress-tier">{currentTier}</span>
        <span className="stuclub-progress-points">
          {currentPoints.toLocaleString("en-US")} pts
          {nextTier ? (
            <span className="stuclub-progress-next">
              {" "}
              • {pointsNeeded.toLocaleString("en-US")} pts to {nextTier}
            </span>
          ) : (
            <span className="stuclub-progress-next"> • Max tier reached</span>
          )}
        </span>
      </div>
      <div className="stuclub-progress-track">
        <div
          className="stuclub-progress-fill"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      <div className="stuclub-progress-labels">
        <span>0</span>
        <span>{nextTier ? maxPoints.toLocaleString("en-US") : "∞"}</span>
      </div>
    </div>
  );
}
