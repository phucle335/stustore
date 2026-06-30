"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCustomerAuth } from "@/components/store/CustomerAuthProvider";
import { getMyUserCouponsAction } from "@/lib/stuclub/points-actions";
import type { UserCouponStatus } from "@/lib/supabase/types";
import styles from "@/styles/components/account/MyCouponsSection.module.css";

type CouponRow = {
  id: string;
  coupon_code: string;
  description: string | null;
  discount_type: "percent" | "fixed";
  discount_value: number;
  min_order_amount: number;
  expires_at: string | null;
  issued_at: string;
  used_at: string | null;
  status: UserCouponStatus;
};

const TABS: { id: UserCouponStatus | "all"; label: string }[] = [
  { id: "available", label: "Available" },
  { id: "used", label: "Used" },
  { id: "expired", label: "Expired" },
];

export function MyCouponsSection() {
  const { user } = useCustomerAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<UserCouponStatus | "all">("available");
  const [rows, setRows] = useState<CouponRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      const status = activeTab === "all" ? undefined : activeTab;
      const result = await getMyUserCouponsAction(status);

      if (!cancelled) {
        if (result.ok) {
          setRows(result.data);
        } else {
          setError(result.error);
          setRows([]);
        }
        setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  const visibleRows = useMemo(() => {
    if (activeTab === "all") return rows;
    return rows.filter((row) => row.status === activeTab);
  }, [rows, activeTab]);

  function handleApply(couponCode: string) {
    router.push(`/checkout?coupon=${encodeURIComponent(couponCode)}`);
  }

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Rewards</p>
          <h2>My Coupons</h2>
        </div>
      </div>

      <div className={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={activeTab === tab.id ? styles.activeTab : undefined}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}

      {loading ? (
        <p className={styles.muted}>Loading coupons...</p>
      ) : visibleRows.length === 0 ? (
        <p className={styles.muted}>No coupons found.</p>
      ) : (
        <div className={styles.grid}>
          {visibleRows.map((row) => (
            <div key={row.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <p className={styles.code}>{row.coupon_code}</p>
                  <p className={styles.description}>
                    {row.description ?? "Membership coupon"}
                  </p>
                </div>
                <span
                  className={`${styles.statusPill} ${styles[row.status]}`}
                >
                  {row.status}
                </span>
              </div>

              <div className={styles.details}>
                <div>
                  <p className={styles.muted}>Discount</p>
                  <p className={styles.value}>
                    {row.discount_type === "percent"
                      ? `${row.discount_value}%`
                      : `${row.discount_value.toLocaleString("en-US")} VND`}
                  </p>
                </div>
                <div>
                  <p className={styles.muted}>Min order</p>
                  <p className={styles.value}>
                    {row.min_order_amount.toLocaleString("en-US")} VND
                  </p>
                </div>
                <div>
                  <p className={styles.muted}>Expires</p>
                  <p className={styles.value}>
                    {row.expires_at
                      ? new Date(row.expires_at).toLocaleDateString("en-US")
                      : "—"}
                  </p>
                </div>
              </div>

              {row.status === "available" ? (
                <button
                  type="button"
                  className={styles.applyButton}
                  onClick={() => handleApply(row.coupon_code)}
                >
                  Apply
                </button>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
