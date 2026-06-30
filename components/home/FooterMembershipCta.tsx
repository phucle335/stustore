"use client";

import Link from "next/link";
import { useCustomerAuth } from "@/components/store/CustomerAuthProvider";
import styles from "@/styles/components/home/FooterMembershipCta.module.css";

export function FooterMembershipCta() {
  const { user, loading } = useCustomerAuth();

  if (loading || user) return null;

  return (
    <div className={styles.membershipCta}>
      <div className={styles.membershipCtaInner}>
        <div>
          <p className={styles.membershipCtaTitle}>Not a member yet?</p>
          <p className={styles.membershipCtaText}>
            Become a member and enjoy exclusive benefits right away.
          </p>
        </div>
        <Link href="/stuclub" className={styles.membershipCtaButton}>
          Join for free
        </Link>
      </div>
    </div>
  );
}
