"use client";

import { useEffect, useMemo, useState } from "react";
import { useCustomerAuth } from "@/components/store/CustomerAuthProvider";
import { getMyUserCouponsAction } from "@/lib/stuclub/points-actions";
import type { UserCouponStatus } from "@/lib/supabase/types";
import styles from "@/styles/components/store/UserCouponModal.module.css";

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

type UserCouponModalProps = {
  open: boolean;
  onClose: () => void;
  onApply: (code: string) => void;
};

export function UserCouponModal({
  open,
  onClose,
  onApply,
}: UserCouponModalProps) {
  const { user } = useCustomerAuth();
  const [rows, setRows] = useState<CouponRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !user) {
      setRows([]);
      setError(null);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      const result = await getMyUserCouponsAction("available");
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
  }, [open, user]);

  const availableRows = useMemo(
    () => rows.filter((row) => row.status === "available"),
    [rows],
  );

  if (!open) return null;

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-coupon-modal-title"
    >
      <div className={styles.dialog}>
        <div className={styles.header}>
          <div>
            <h3 id="user-coupon-modal-title">Available Coupons</h3>
            <p className={styles.subtitle}>
              Select a coupon to apply to your order.
            </p>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {error ? <p className={styles.error}>{error}</p> : null}

        {loading ? (
          <p className={styles.muted}>Loading coupons...</p>
        ) : availableRows.length === 0 ? (
          <p className={styles.muted}>No available coupons.</p>
        ) : (
          <div className={styles.list}>
            {availableRows.map((row) => (
              <div key={row.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div>
                    <p className={styles.code}>{row.coupon_code}</p>
                    <p className={styles.description}>
                      {row.description ?? "Membership coupon"}
                    </p>
                  </div>
                  <span className={`${styles.pill} ${styles.available}`}>
                    available
                  </span>
                </div>

                <div className={styles.meta}>
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

                <button
                  type="button"
                  className={styles.applyButton}
                  onClick={() => onApply(row.coupon_code)}
                >
                  Apply
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
