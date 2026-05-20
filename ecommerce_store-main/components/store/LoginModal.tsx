"use client";

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
          aria-label="Close login modal"
        >
          &times;
        </button>
        <h2>{membershipTitle}</h2>
        <button type="button" className="social-btn google">
          <i className="fab fa-google" /> Continue with Google
        </button>
        <button type="button" className="social-btn facebook">
          <i className="fab fa-facebook-f" /> Continue with Facebook
        </button>
        <button type="button" className="social-btn apple">
          <i className="fab fa-apple" /> Continue with Apple
        </button>
        <p className="no-password">No password needed</p>
      </div>
    </div>
  );
}
