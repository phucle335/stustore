"use client";

import { useEffect, useMemo, useState } from "react";
import {
  adjustPointsAction,
  createMemberCouponAction,
  expireMemberCouponAction,
  getCouponStatsAction,
  getMemberDetailsAction,
  getMembersAction,
  getStuclubStatsAction,
  updateMemberTierAction,
} from "@/lib/admin/actions/stuclub";
import type { MemberTier } from "@/lib/supabase/types";

type MemberRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  membership_tier: MemberTier;
  stu_points: number;
};

type HistoryRow = {
  id: string;
  order_ref: string | null;
  points: number;
  type: string;
  description: string | null;
  created_at: string;
};

type CouponRow = {
  id: string;
  code: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  min_order_amount: number;
  expires_at: string | null;
  status: string;
  issued_at: string;
  used_at: string | null;
};

type Stats = {
  total_members: number;
  starter: number;
  member: number;
  elite: number;
  total_points_issued: number;
  total_coupons_used: number;
};

type MemberDetails = {
  user: MemberRow;
  history: HistoryRow[];
  coupons: CouponRow[];
};

export function StuclubManager() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [details, setDetails] = useState<MemberDetails | null>(null);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<MemberTier | "all">("all");
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [couponStats, setCouponStats] = useState<{
    total_coupons: number;
    available: number;
    used: number;
    expired: number;
  } | null>(null);

  const [pointsForm, setPointsForm] = useState({
    userId: "",
    points: "",
    type: "manual_add" as "manual_add" | "manual_deduct",
    description: "",
  });
  const [tierForm, setTierForm] = useState({ userId: "", tier: "Starter" as MemberTier });
  const [couponForm, setCouponForm] = useState({ userId: "", couponId: "" });

  useEffect(() => {
    let cancelled = false;

    async function loadInitial() {
      setLoading(true);
      setError(null);

      try {
        const [statsResult, membersResult, couponResult] = await Promise.all([
          getStuclubStatsAction(),
          getMembersAction(),
          getCouponStatsAction(),
        ]);

        if (cancelled) return;

        if (statsResult.ok && membersResult.ok && couponResult.ok) {
          setStats(statsResult.data);
          setMembers(membersResult.data);
          setCouponStats(couponResult.data);
        } else {
          setError(
            statsResult.error ??
              membersResult.error ??
              couponResult.error ??
              "Failed to load STUClub data.",
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load STUClub data.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadInitial();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredMembers = useMemo(() => {
    const term = search.trim().toLowerCase();
    return members.filter((member) => {
      const matchesTerm =
        !term ||
        (member.full_name ?? "").toLowerCase().includes(term) ||
        (member.email ?? "").toLowerCase().includes(term) ||
        member.id.toLowerCase().includes(term);
      const matchesTier = tierFilter === "all" || member.membership_tier === tierFilter;
      return matchesTerm && matchesTier;
    });
  }, [members, search, tierFilter]);

  async function handleViewDetails(userId: string) {
    setDetailsLoading(true);
    setDetailsError(null);
    setActionError(null);

    const result = await getMemberDetailsAction(userId);
    if (result.ok) {
      setDetails(result.data);
    } else {
      setDetailsError(result.error);
      setDetails(null);
    }
    setDetailsLoading(false);
  }

  async function handleAdjustPoints() {
    setActionError(null);
    const userId = pointsForm.userId.trim();
    const points = Number(pointsForm.points);

    if (!userId || !Number.isFinite(points) || points === 0) {
      setActionError("Please enter a valid member and points amount.");
      return;
    }

    const result = await adjustPointsAction(
      userId,
      points,
      pointsForm.type,
      pointsForm.description || (pointsForm.type === "manual_add" ? "Manual add" : "Manual deduct"),
    );

    if (result.ok) {
      setPointsForm((current) => ({ ...current, points: "", description: "" }));
      const membersResult = await getMembersAction();
      if (membersResult.ok) setMembers(membersResult.data);
    } else {
      setActionError(result.error);
    }
  }

  async function handleUpdateTier() {
    setActionError(null);
    const userId = tierForm.userId.trim();
    if (!userId) {
      setActionError("Please enter a member ID.");
      return;
    }

    const result = await updateMemberTierAction(userId, tierForm.tier);
    if (result.ok) {
      const membersResult = await getMembersAction();
      if (membersResult.ok) setMembers(membersResult.data);
    } else {
      setActionError(result.error);
    }
  }

  async function handleAssignCoupon() {
    setActionError(null);
    const userId = couponForm.userId.trim();
    const couponId = couponForm.couponId.trim();

    if (!userId || !couponId) {
      setActionError("Please enter member ID and coupon ID.");
      return;
    }

    const result = await createMemberCouponAction({ userId, couponId });
    if (result.ok) {
      setCouponForm({ userId: "", couponId: "" });
      if (details?.user.id === userId) {
        const detailResult = await getMemberDetailsAction(userId);
        if (detailResult.ok) setDetails(detailResult.data);
      }
    } else {
      setActionError(result.error);
    }
  }

  async function handleExpireCoupon(userCouponId: string, userId?: string) {
    setActionError(null);
    const result = await expireMemberCouponAction(userCouponId);
    if (result.ok) {
      if (userId) {
        const detailResult = await getMemberDetailsAction(userId);
        if (detailResult.ok) setDetails(detailResult.data);
      }
    } else {
      setActionError(result.error);
    }
  }

  const tierBadgeClass: Record<MemberTier, string> = {
    Starter: "tier-starter",
    Member: "tier-member",
    Elite: "tier-elite",
  };

  return (
    <div className="admin-stuclub">
      <div className="admin-stuclub-grid">
        <section className="admin-stuclub-section">
          <h2>STUClub Overview</h2>

          {error ? <p className="admin-stuclub-error">{error}</p> : null}
          {actionError ? <p className="admin-stuclub-error">{actionError}</p> : null}

          {loading ? (
            <p>Loading stats...</p>
          ) : stats ? (
            <div className="admin-stuclub-stats">
              <div className="admin-stat-card">
                <p className="admin-stat-label">Total Members</p>
                <p className="admin-stat-value">{stats.total_members}</p>
              </div>
              <div className="admin-stat-card">
                <p className="admin-stat-label">Starter</p>
                <p className="admin-stat-value">{stats.starter}</p>
              </div>
              <div className="admin-stat-card">
                <p className="admin-stat-label">Member</p>
                <p className="admin-stat-value">{stats.member}</p>
              </div>
              <div className="admin-stat-card">
                <p className="admin-stat-label">Elite</p>
                <p className="admin-stat-value">{stats.elite}</p>
              </div>
              <div className="admin-stat-card">
                <p className="admin-stat-label">Points Issued</p>
                <p className="admin-stat-value">{stats.total_points_issued}</p>
              </div>
              <div className="admin-stat-card">
                <p className="admin-stat-label">Coupons Used</p>
                <p className="admin-stat-value">{stats.total_coupons_used}</p>
              </div>
            </div>
          ) : null}
        </section>

        <section className="admin-stuclub-section">
          <h2>Members</h2>

          <div className="admin-stuclub-filters">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name or email"
            />
            <select
              value={tierFilter}
              onChange={(event) => setTierFilter(event.target.value as MemberTier | "all")}
            >
              <option value="all">All tiers</option>
              <option value="Starter">Starter</option>
              <option value="Member">Member</option>
              <option value="Elite">Elite</option>
            </select>
          </div>

          <div className="admin-stuclub-table-wrap">
            <table className="admin-stuclub-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Tier</th>
                  <th>Points</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <p className="admin-member-name">{member.full_name ?? "—"}</p>
                      <p className="admin-member-email">{member.email ?? member.id}</p>
                    </td>
                    <td>
                      <span className={`admin-tier-badge ${tierBadgeClass[member.membership_tier]}`}>
                        {member.membership_tier}
                      </span>
                    </td>
                    <td>{member.stu_points}</td>
                    <td>
                      <button type="button" onClick={() => handleViewDetails(member.id)}>
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={4}>No members found.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <section className="admin-stuclub-section">
          <h2>Member Details</h2>

          {detailsError ? <p className="admin-stuclub-error">{detailsError}</p> : null}
          {detailsLoading ? (
            <p>Loading member details...</p>
          ) : details ? (
            <div className="admin-stuclub-details">
              <div className="admin-detail-header">
                <div>
                  <h3>{details.user.full_name ?? "Unnamed member"}</h3>
                  <p className="admin-detail-email">{details.user.email ?? details.user.id}</p>
                </div>
                <span className={`admin-tier-badge ${tierBadgeClass[details.user.membership_tier]}`}>
                  {details.user.membership_tier}
                </span>
              </div>

              <div className="admin-detail-grid">
                <div>
                  <h4>Points History</h4>
                  <div className="admin-stuclub-table-wrap">
                    <table className="admin-stuclub-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Type</th>
                          <th>Points</th>
                          <th>Description</th>
                          <th>Order</th>
                        </tr>
                      </thead>
                      <tbody>
                        {details.history.map((row) => (
                          <tr key={row.id}>
                            <td>{new Date(row.created_at).toLocaleString("en-US")}</td>
                            <td>{row.type}</td>
                            <td>{row.points > 0 ? `+${row.points}` : row.points}</td>
                            <td>{row.description ?? "—"}</td>
                            <td>{row.order_ref ?? "—"}</td>
                          </tr>
                        ))}
                        {details.history.length === 0 ? (
                          <tr>
                            <td colSpan={5}>No history yet.</td>
                          </tr>
                        ) : null}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h4>Coupons</h4>
                  <div className="admin-stuclub-table-wrap">
                    <table className="admin-stuclub-table">
                      <thead>
                        <tr>
                          <th>Code</th>
                          <th>Status</th>
                          <th>Issued</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {details.coupons.map((row) => (
                          <tr key={row.id}>
                            <td>
                              <p>{row.code}</p>
                              <p className="admin-muted">{row.description}</p>
                            </td>
                            <td>
                              <span className={`admin-status-pill admin-status-${row.status}`}>{row.status}</span>
                            </td>
                            <td>{new Date(row.issued_at).toLocaleDateString("en-US")}</td>
                            <td>
                              {row.status === "available" ? (
                                <button
                                  type="button"
                                  onClick={() => handleExpireCoupon(row.id, details.user.id)}
                                >
                                  Expire
                                </button>
                              ) : null}
                            </td>
                          </tr>
                        ))}
                        {details.coupons.length === 0 ? (
                          <tr>
                            <td colSpan={4}>No coupons.</td>
                          </tr>
                        ) : null}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="admin-detail-actions">
                <div className="admin-action-box">
                  <h4>Adjust Points</h4>
                  <div className="admin-action-row">
                    <input
                      value={pointsForm.userId}
                      onChange={(event) => setPointsForm((current) => ({ ...current, userId: event.target.value }))}
                      placeholder="Member ID"
                    />
                    <input
                      value={pointsForm.points}
                      onChange={(event) => setPointsForm((current) => ({ ...current, points: event.target.value }))}
                      placeholder="Points"
                      type="number"
                    />
                    <select
                      value={pointsForm.type}
                      onChange={(event) =>
                        setPointsForm((current) => ({ ...current, type: event.target.value as "manual_add" | "manual_deduct" }))
                      }
                    >
                      <option value="manual_add">Add</option>
                      <option value="manual_deduct">Deduct</option>
                    </select>
                    <input
                      value={pointsForm.description}
                      onChange={(event) => setPointsForm((current) => ({ ...current, description: event.target.value }))}
                      placeholder="Note"
                    />
                    <button type="button" onClick={() => void handleAdjustPoints()}>
                      Save
                    </button>
                  </div>
                </div>

                <div className="admin-action-box">
                  <h4>Update Tier</h4>
                  <div className="admin-action-row">
                    <input
                      value={tierForm.userId}
                      onChange={(event) => setTierForm((current) => ({ ...current, userId: event.target.value }))}
                      placeholder="Member ID"
                    />
                    <select
                      value={tierForm.tier}
                      onChange={(event) => setTierForm((current) => ({ ...current, tier: event.target.value as MemberTier }))}
                    >
                      <option value="Starter">Starter</option>
                      <option value="Member">Member</option>
                      <option value="Elite">Elite</option>
                    </select>
                    <button type="button" onClick={() => void handleUpdateTier()}>
                      Save
                    </button>
                  </div>
                </div>

                <div className="admin-action-box">
                  <h4>Assign Coupon</h4>
                  <div className="admin-action-row">
                    <input
                      value={couponForm.userId}
                      onChange={(event) => setCouponForm((current) => ({ ...current, userId: event.target.value }))}
                      placeholder="Member ID"
                    />
                    <input
                      value={couponForm.couponId}
                      onChange={(event) => setCouponForm((current) => ({ ...current, couponId: event.target.value }))}
                      placeholder="Coupon ID"
                    />
                    <button type="button" onClick={() => void handleAssignCoupon()}>
                      Assign
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="admin-muted">Select a member above to view details.</p>
          )}
        </section>
      </div>
    </div>
  );
}
