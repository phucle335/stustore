"use client";

import Link from "next/link";
import { NAV_LINKS } from "@/lib/store/navigation";
import { SITE_LOGO } from "@/lib/store/site";
import type { NavId } from "@/lib/store/types";
import { useCart } from "./CartProvider";
import { HeaderSearch } from "./HeaderSearch";

type HeaderProps = {
  activeNav: NavId;
  onLoginClick: () => void;
};

export function Header({ activeNav, onLoginClick }: HeaderProps) {
  const { itemCount, openCart } = useCart();

  return (
    <header className="header">
      <div className="header-start">
        <div className="logo">
          <h1>
            <Link href="/" className="logo-link">
              {SITE_LOGO}
            </Link>
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
          <button type="button" onClick={onLoginClick} aria-label="Đăng nhập">
            <i className="far fa-user" />
          </button>
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
