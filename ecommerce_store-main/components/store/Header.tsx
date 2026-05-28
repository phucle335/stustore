"use client";

import Link from "next/link";
import { StusportLogo } from "@/components/brand/StusportLogo";
import { NAV_LINKS } from "@/lib/store/navigation";
import type { NavId } from "@/lib/store/types";
import { useCustomerAuth } from "./CustomerAuthProvider";
import { useCart } from "./CartProvider";
import { HeaderSearch } from "./HeaderSearch";

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
    <header className="header">
      <div className="header-start">
        <div className="logo">
          <h1>
            <StusportLogo href="/" variant="mark" />
          </h1>
        </div>
        <nav className="main-nav">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              className={link.id === activeNav ? "nav-active" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="header-end">
        <HeaderSearch />
        <div className="header-icons">
          {loading ? (
            <span className="header-user-greeting header-user-greeting--muted">
              …
            </span>
          ) : user ? (
            <div className="header-user-menu">
              <Link href="/tai-khoan" className="header-user-greeting">
                Hi, {greetingName}
              </Link>
              <button
                type="button"
                className="header-user-signout"
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
              className="header-login-btn"
            >
              <i className="far fa-user" />
            </button>
          )}
          <button
            type="button"
            className="cart-icon-btn"
            onClick={openCart}
            aria-label={`Giỏ hàng${itemCount > 0 ? `, ${itemCount} sản phẩm` : ""}`}
          >
            <i className="fas fa-shopping-bag" />
            {itemCount > 0 ? (
              <span className="cart-badge">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            ) : null}
          </button>
        </div>
      </div>
    </header>
  );
}
