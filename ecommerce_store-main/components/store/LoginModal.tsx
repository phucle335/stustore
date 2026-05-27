"use client";

import Link from "next/link";
import { SITE_MEMBERSHIP_TITLE } from "@/lib/store/site";

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
      className={`modal${open ? " open" : ""}`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
    >
      <div className="modal-content">
        <button
          type="button"
          className="close"
          onClick={onClose}
          aria-label="Đóng"
        >
          &times;
        </button>
        <p className="customer-page-eyebrow">Stusport</p>
        <h2>{membershipTitle}</h2>
        <p className="no-password" style={{ marginBottom: "1rem", color: "#555" }}>
          Đăng ký hoặc đăng nhập để thanh toán đơn hàng.
        </p>
        <Link
          href="/dang-ky?redirect=%2Fcheckout"
          className="product-detail-add-btn"
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "center",
            textDecoration: "none",
            boxSizing: "border-box",
          }}
          onClick={onClose}
        >
          Đăng ký tài khoản
        </Link>
        <Link
          href="/dang-nhap?redirect=%2Fcheckout"
          className="store-btn-secondary"
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
          Đăng nhập
        </Link>
      </div>
    </div>
  );
}
