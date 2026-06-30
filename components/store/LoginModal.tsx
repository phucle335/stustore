"use client";


import Link from "next/link";
import { StusportLogo } from "@/components/brand/StusportLogo";
import { SITE_MEMBERSHIP_TITLE } from "@/lib/store/site";
import customerStyles from "@/styles/components/store/Customer.module.css";
import detailStyles from "@/styles/components/store/ProductDetail.module.css";
import styles from "@/styles/components/store/LoginModal.module.css";

type LoginModalProps = {
  open: boolean;
  onClose: () => void;
  membershipTitle?: string;
};

export function LoginModal({
  open,
  onClose,
  membershipTitle = SITE_MEMBERSHIP_TITLE,
}: LoginModalProps) {
  const handleBackdropClick = (
    event: React.MouseEvent<HTMLDivElement>,
  ): void => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      id="loginModal"
      className={`${styles.modal} ${open ? styles.open : ""}`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
    >
      <div className={styles.modalContent}>
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <div className={customerStyles.customerPageEyebrow}>
          <StusportLogo
            variant="mark"
            tone="on-light"
            href="/"
            className="stusport-logo--compact"
          />
        </div>
        <h2>{membershipTitle}</h2>
        <p className={styles.noPassword} style={{ marginBottom: "1rem", color: "#555" }}>
          Register or sign in to complete your order.
        </p>
        <Link
          href="/dang-ky?redirect=%2Fcheckout"
          className={styles.productDetailAddBtn}
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "center",
            textDecoration: "none",
            boxSizing: "border-box",
          }}
          onClick={onClose}
        >
          Create Account
        </Link>
        <Link
          href="/quen-mat-khau?redirect=%2Fcheckout"
          className={customerStyles.storeBtnSecondary}
          style={{
            display: "inline-flex",
            width: "100%",
            justifyContent: "center",
            textDecoration: "none",
            marginTop: "8px",
            boxSizing: "border-box",
            fontSize: "0.9rem",
          }}
          onClick={onClose}
        >
          Forgot password?
        </Link>
        <Link
          href="/dang-nhap?redirect=%2Fcheckout"
          className={customerStyles.storeBtnSecondary}
          style={{
            display: "inline-flex",
            width: "100%",
            justifyContent: "center",
            textDecoration: "none",
            marginTop: "12px",
            boxSizing: "border-box",
          }}
          onClick={onClose}
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}
