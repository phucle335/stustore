"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useId, useMemo } from "react";
import { MobileOverlayLogoHeader } from "@/components/store/MobileOverlayLogoHeader";
import { useCustomerAuth } from "@/components/store/CustomerAuthProvider";
import {
  buildMemberAccountUrl,
  DEFAULT_MEMBER_SECTION_ID,
  MEMBER_ACCOUNT_SECTIONS,
  parseMemberSectionId,
  type MemberSectionId,
} from "@/lib/account/member-sections";
import styles from "@/styles/components/store/AccountMenuDrawer.module.css";

type AccountMenuDrawerProps = {
  open: boolean;
  onClose: () => void;
  variant?: "store" | "motto";
};

function getGreetingName(user: {
  display_name?: string | null;
  full_name?: string | null;
  email?: string | null;
}): string {
  const displayName = user.display_name?.trim();
  if (displayName) {
    return displayName;
  }

  const fullName = user.full_name?.trim();
  if (fullName) {
    return fullName;
  }

  if (user.email) {
    return user.email.split("@")[0] ?? "you";
  }

  return "you";
}

export function AccountMenuDrawer({
  open,
  onClose,
  variant = "store",
}: AccountMenuDrawerProps): React.ReactElement {
  return (
    <Suspense fallback={null}>
      <AccountMenuDrawerContent open={open} onClose={onClose} variant={variant} />
    </Suspense>
  );
}

function AccountMenuDrawerContent({
  open,
  onClose,
  variant = "store",
}: AccountMenuDrawerProps): React.ReactElement {
  const titleId = useId();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useCustomerAuth();

  const activeSection = useMemo((): MemberSectionId => {
    if (pathname !== "/tai-khoan") {
      return DEFAULT_MEMBER_SECTION_ID;
    }
    return (
      parseMemberSectionId(searchParams.get("section")) ??
      DEFAULT_MEMBER_SECTION_ID
    );
  }, [pathname, searchParams]);

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

  const greetingName = user ? getGreetingName(user) : "you";

  function selectSection(sectionId: MemberSectionId): void {
    router.push(buildMemberAccountUrl(sectionId));
    onClose();
  }

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
        aria-label="Close account menu"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
      />
      <aside
        className={panelClass}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <MobileOverlayLogoHeader
          onClose={onClose}
          closeLabel="Close account menu"
        />
        <div className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            Account
          </h2>
          <p className={styles.greeting}>Hi, {greetingName}</p>
        </div>
        <nav className={styles.nav} aria-label="Member account">
          <ul className={styles.list}>
            {MEMBER_ACCOUNT_SECTIONS.map((section) => (
              <li key={section.id} className={styles.listItem}>
                <button
                  type="button"
                  className={
                    activeSection === section.id
                      ? `${styles.sectionLink} ${styles.sectionLinkActive}`
                      : styles.sectionLink
                  }
                  onClick={() => selectSection(section.id)}
                >
                  {section.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </div>
  );
}
