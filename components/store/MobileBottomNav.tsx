"use client";

import Link from "next/link";
import styles from "@/styles/components/store/MobileBottomNav.module.css";

export type MobileBottomNavItem = {
  id: string;
  label: string;
  iconClass: string;
  onClick?: () => void;
  href?: string;
  badge?: number | string;
  ariaLabel?: string;
};

type MobileBottomNavProps = {
  items: MobileBottomNavItem[];
  variant?: "store" | "motto";
};

function NavControl({
  item,
}: {
  item: MobileBottomNavItem;
}): React.ReactElement {
  const content = (
    <>
      <span className={styles.iconWrap}>
        <i className={item.iconClass} aria-hidden="true" />
        {item.badge !== undefined && item.badge !== 0 && item.badge !== "" ? (
          <span className={styles.badge}>
            {typeof item.badge === "number" && item.badge > 99 ? "99+" : item.badge}
          </span>
        ) : null}
      </span>
      <span>{item.label}</span>
    </>
  );

  if (item.href) {
    return (
      <Link
        href={item.href}
        className={styles.button}
        aria-label={item.ariaLabel ?? item.label}
        onClick={item.onClick}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={styles.button}
      onClick={item.onClick}
      aria-label={item.ariaLabel ?? item.label}
    >
      {content}
    </button>
  );
}

export function MobileBottomNav({
  items,
  variant = "store",
}: MobileBottomNavProps): React.ReactElement {
  const navClass =
    variant === "motto"
      ? `${styles.bottomNav} ${styles.bottomNavMotto}`
      : `${styles.bottomNav} ${styles.bottomNavStore}`;

  return (
    <nav className={navClass} aria-label="Main navigation">
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.id} className={styles.item}>
            <NavControl item={item} />
          </li>
        ))}
      </ul>
    </nav>
  );
}
