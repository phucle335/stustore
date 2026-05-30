"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { StusportLogo } from "@/components/brand/StusportLogo";
import { MobileBottomNav, type MobileBottomNavItem } from "@/components/store/MobileBottomNav";
import { AccountMenuDrawer } from "@/components/store/AccountMenuDrawer";
import { MobileNavDrawer } from "@/components/store/MobileNavDrawer";
import { MobileSearchSheet } from "@/components/store/MobileSearchSheet";
import { useCart } from "@/components/store/CartProvider";
import { useCustomerAuth } from "@/components/store/CustomerAuthProvider";
import { MOTTO_NAV } from "@/lib/motto/content";
import styles from "@/styles/components/motto/MottoHeader.module.css";

export function MottoHeader({ theme = "light" }: { theme?: "light" | "dark" }) {
  const pathname = usePathname();
  const { itemCount, openCart } = useCart();
  const { user } = useCustomerAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const overlayOpen = menuOpen || searchOpen || accountMenuOpen;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = overlayOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [overlayOpen]);

  const openMenu = useCallback((): void => {
    setSearchOpen(false);
    setAccountMenuOpen(false);
    setMenuOpen(true);
  }, []);

  const openSearch = useCallback((): void => {
    setMenuOpen(false);
    setAccountMenuOpen(false);
    setSearchOpen(true);
  }, []);

  const openAccountMenu = useCallback((): void => {
    setMenuOpen(false);
    setSearchOpen(false);
    setAccountMenuOpen(true);
  }, []);

  const headerTheme = scrolled ? "dark" : theme;
  const headerState = [
    headerTheme === "dark" ? styles.isDark : "",
    scrolled ? styles.isScrolled : "",
  ]
    .filter(Boolean)
    .join(" ");

  const drawerLinks = useMemo(
    () => MOTTO_NAV.map((item) => ({ href: item.href, label: item.label })),
    [],
  );

  const bottomNavItems: MobileBottomNavItem[] = useMemo(
    () => [
      {
        id: "menu",
        label: "Menu",
        iconClass: "fas fa-bars",
        onClick: openMenu,
      },
      {
        id: "search",
        label: "Tìm kiếm",
        iconClass: "fas fa-search",
        onClick: openSearch,
      },
      {
        id: "cart",
        label: "Giỏ hàng",
        iconClass: "fas fa-shopping-bag",
        onClick: openCart,
        badge: itemCount > 0 ? itemCount : undefined,
        ariaLabel:
          itemCount > 0
            ? `Giỏ hàng, ${itemCount} sản phẩm`
            : "Giỏ hàng",
      },
      user
        ? {
            id: "account",
            label: "Tài khoản",
            iconClass: "far fa-user",
            onClick: openAccountMenu,
          }
        : {
            id: "login",
            label: "Đăng nhập",
            iconClass: "far fa-user",
            href: "/dang-nhap",
          },
    ],
    [itemCount, openAccountMenu, openCart, openMenu, openSearch, user],
  );

  return (
    <>
      <header className={`${styles.header} ${headerState}`.trim()}>
        <div className={`${styles.container} ${styles.headerInner}`}>
          <StusportLogo
            href="/"
            variant="mark"
            className={styles.headerLogo}
            size="M"
          />

          <nav className={styles.nav} aria-label="Main">
            <ul>
              {MOTTO_NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={styles.navLink}>
                    <span className={styles.linkLabel}>{item.label}</span>
                    <span className={styles.linkHoverText} aria-hidden>
                      {item.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.actions}>
            <Link
              href="/sneakers"
              data-track="Mua ngay (header)"
              className={`${styles.btn} ${styles.btnPill} ${styles.headerCtaPill} ${styles.desktopCta}`}
            >
              Mua ngay
            </Link>
          </div>
        </div>
      </header>

      <MobileNavDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        links={drawerLinks}
        activeHref={pathname ?? undefined}
        variant="motto"
      />
      <MobileSearchSheet
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        variant="motto"
      />
      <AccountMenuDrawer
        open={accountMenuOpen}
        onClose={() => setAccountMenuOpen(false)}
        variant="motto"
      />
      <MobileBottomNav items={bottomNavItems} variant="motto" />
    </>
  );
}
