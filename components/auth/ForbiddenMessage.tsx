"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { StusportLogo } from "@/components/brand/StusportLogo";
import styles from "@/styles/components/store/Customer.module.css";

export function ForbiddenMessage() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const isAdmin = from === "admin";

  return (
    <div className={styles.forbiddenPage}>
      <div className={styles.customerPageEyebrow}>
        <StusportLogo
          variant="mark"
          tone="on-light"
          href="/"
          className="stusport-logo--compact"
        />
      </div>
      <h1>Access denied</h1>
      <p>
        {isAdmin
          ? "Your account does not have admin privileges. Only admins can access the management dashboard."
          : "You are not authorized to view this content."}
      </p>
      <div className={styles.forbiddenPageActions}>
        <Link href="/" className={styles.storeBtnPrimary}>
          Back to home
        </Link>
        {isAdmin ? (
          <Link href="/login" className={styles.forbiddenPageLink}>
            Sign in with a different admin account
          </Link>
        ) : null}
      </div>
    </div>
  );
}
