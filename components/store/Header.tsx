"use client";


import Link from "next/link";
import { StusportLogo } from "@/components/brand/StusportLogo";
import { NAV_LINKS } from "@/lib/store/navigation";
import type { NavId } from "@/lib/store/types";
import { useCustomerAuth } from "./CustomerAuthProvider";
import { useCart } from "./CartProvider";
import { HeaderSearch } from "./HeaderSearch";
import styles from "@/styles/components/store/Header.module.css";

type HeaderProps = {
  activeNav: NavId;
  onLoginClick: () => void;
};

export function Header({ activeNav, onLoginClick }: HeaderProps) {
  const { itemCount, openCart } = useCart();
  const { user, loading, signOut } = useCustomerAuth();
  const greetingName =
    (user?.display_name && user.display_name.trim()) ||
    (user?.full_name && user.full_name.trim()) ||
    (user?.email ? user.email.split("@")[0] : "") ||
    "bạn";

  return (
    <header className={styles.header}>
      <div className={styles.headerStart}>
        <div className={styles.logo}>
          <h1>
            <StusportLogo href="/" variant="mark" />
          </h1>
        </div>
        <nav className={styles.mainNav}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              className={link.id === activeNav ? styles.navActive : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className={styles.headerEnd}>
        <HeaderSearch />
        <div className={styles.headerIcons}>
          {loading ? (
            <span className={`${styles.headerUserGreeting} ${styles.headerUserGreetingMuted}`}>
              …
            </span>
          ) : user ? (
            <div className={styles.headerUserMenu}>
              <Link href="/tai-khoan" className={styles.headerUserGreeting}>
                Hi, {greetingName}
              </Link>
              <button
                type="button"
                className={styles.headerUserSignout}
                onClick={() => void signOut()}
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onLoginClick}
              aria-label="Đăng nhập"
              className={styles.headerLoginBtn}
            >
              <i className="far fa-user" />
            </button>
          )}
          <button
            type="button"
            className={styles.cartIconBtn}
            onClick={openCart}
            aria-label={`Giỏ hàng${itemCount > 0 ? `, ${itemCount} sản phẩm` : ""}`}
          >
            <i className="fas fa-shopping-bag" />
            {itemCount > 0 ? (
              <span className={styles.cartBadge}>
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            ) : null}
          </button>
        </div>
      </div>
    </header>
  );
}
