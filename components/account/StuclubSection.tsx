"use client";

import { useEffect, useMemo, useState } from "react";
import { useCustomerAuth } from "@/components/store/CustomerAuthProvider";
import { MEMBERSHIP_TIERS, type MemberTier, getNextTierInfo } from "@/lib/stuclub/points";
import { getMyPointsAction, getMyPointsHistoryAction } from "@/lib/stuclub/points-actions";
import type { PointsHistoryType } from "@/lib/supabase/types";
import styles from "@/styles/components/account/StuclubSection.module.css";

type PointsHistoryRow = {
  id: string;
  created_at: string;
  points: number;
  type: PointsHistoryType;
  description: string | null;
};

const historyTypeLabel: Record<PointsHistoryType, string> = {
  earned: "Earned",
  bonus: "Bonus",
  manual_add: "Manual add",
  manual_deduct: "Manual deduct",
};

export function StuclubSection() {
  const { user } = useCustomerAuth();
  const [points, setPoints] = useState(0);
  const [tier, setTier] = useState<MemberTier>("Starter");
  const [history, setHistory] = useState<PointsHistoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const pointsResult = await getMyPointsAction();
      if (cancelled) return;

      if (pointsResult.ok) {
        setPoints(pointsResult.data.points);
        setTier(pointsResult.data.tier);
      }

      const historyResult = await getMyPointsHistoryAction();
      if (cancelled) return;

      if (historyResult.ok) {
        setHistory(historyResult.data);
      }

      setLoading(false);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const tierInfo = useMemo(() => getNextTierInfo(points), [points]);
  const currentBenefits = MEMBERSHIP_TIERS[tier]?.benefits ?? [];

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Loyalty</p>
          <h2>STUClub Membership</h2>
        </div>
        <div className={styles.badge}>{tier}</div>
      </div>

      <div className={styles.summaryGrid}>
        <div className={styles.card}>
          <p className={styles.label}>Current Points</p>
          <p className={styles.points}>{points.toLocaleString("en-US")}</p>
          <p className={styles.muted}>
            {tierInfo.next
              ? `${tierInfo.pointsNeeded.toLocaleString("en-US")} pts to ${tierInfo.next}`
              : "Max tier reached"}
          </p>
        </div>

        <div className={`${styles.card} ${styles.wide}`}>
          <p className={styles.label}>Progress</p>
          <div className={styles.progressTrack}>
            <div
              className={styles.progressFill}
              style={{ width: `${tierInfo.progress}%` }}
            />
          </div>
          <p className={styles.muted}>
            {tierInfo.current}
            {tierInfo.next ? ` → ${tierInfo.next}` : ""}
          </p>
        </div>
      </div>

      <div className={styles.benefits}>
        <h3>Membership Benefits</h3>
        <ul>
          {currentBenefits.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div className={styles.history}>
        <h3>Points History</h3>
        {loading ? (
          <p className={styles.muted}>Loading...</p>
        ) : history.length === 0 ? (
          <p className={styles.muted}>No history yet.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Points</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row) => (
                  <tr key={row.id}>
                    <td>{new Date(row.created_at).toLocaleString("en-US")}</td>
                    <td>{historyTypeLabel[row.type] ?? row.type}</td>
                    <td>+{row.points.toLocaleString("en-US")}</td>
                    <td>{row.description ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
