"use client";

import Link from "next/link";
import { useEffect, useId } from "react";
import { MobileOverlayLogoHeader } from "@/components/store/MobileOverlayLogoHeader";
import styles from "@/styles/components/store/MobileNavDrawer.module.css";

export type MobileNavDrawerLink = {
  href: string;
  label: string;
};

type MobileNavDrawerProps = {
  open: boolean;
  onClose: () => void;
  links: readonly MobileNavDrawerLink[];
  activeHref?: string;
  variant?: "store" | "motto";
};

export function MobileNavDrawer({
  open,
  onClose,
  links,
  activeHref,
  variant = "store",
}: MobileNavDrawerProps): React.ReactElement {
  const titleId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const panelClass =
    variant === "motto" ? `${styles.panel} ${styles.panelMotto}` : styles.panel;

  return (
    <div
      className={`${styles.root}${open ? ` ${styles.open}` : ""}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        className={styles.backdrop}
        aria-label="Close menu"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
      />
      <aside
        className={panelClass}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <MobileOverlayLogoHeader onClose={onClose} closeLabel="Close menu" />
        <div className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            Categories
          </h2>
        </div>
        <nav className={styles.nav} aria-label="Categories">
          <ul className={styles.list}>
            {links.map((link) => (
              <li key={link.href} className={styles.listItem}>
                <Link
                  href={link.href}
                  className={
                    activeHref === link.href
                      ? `${styles.categoryLink} ${styles.categoryLinkActive}`
                      : styles.categoryLink
                  }
                  onClick={onClose}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </div>
  );
}
