"use client";

import { StusportLogo } from "@/components/brand/StusportLogo";
import styles from "@/styles/components/store/MobileOverlayLogoHeader.module.css";

type MobileOverlayLogoHeaderProps = {
  onClose?: () => void;
  closeLabel?: string;
};

export function MobileOverlayLogoHeader({
  onClose,
  closeLabel = "Đóng",
}: MobileOverlayLogoHeaderProps): React.ReactElement {
  return (
    <div className={styles.bar}>
      <div className={styles.logo}>
        <h1>
          <StusportLogo href="/" variant="mark" />
        </h1>
      </div>
      {onClose ? (
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label={closeLabel}
        >
          <i className="fas fa-times" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
