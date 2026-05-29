"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { NAV_LINKS } from "@/lib/store/navigation";
import type { NavId } from "@/lib/store/types";
import { useCart } from "./CartProvider";
import { useCustomerAuth } from "./CustomerAuthProvider";
import { LoginModal } from "./LoginModal";
import { MobileBottomNav, type MobileBottomNavItem } from "./MobileBottomNav";
import { AccountMenuDrawer } from "./AccountMenuDrawer";
import { MobileNavDrawer } from "./MobileNavDrawer";
import { MobileSearchSheet } from "./MobileSearchSheet";

type StoreMobileChromeProps = {
  activeNav: NavId;
  membershipTitle?: string;
  onLoginClick: () => void;
  loginOpen: boolean;
  onLoginClose: () => void;
};

function getActiveHref(activeNav: NavId): string {
  const link = NAV_LINKS.find((item) => item.id === activeNav);
  return link?.href ?? "/";
}

export function StoreMobileChrome({
  activeNav,
  membershipTitle,
  onLoginClick,
  loginOpen,
  onLoginClose,
}: StoreMobileChromeProps): React.ReactElement {
  const { itemCount, openCart } = useCart();
  const { user } = useCustomerAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const overlayOpen = menuOpen || searchOpen || accountMenuOpen;

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

  const drawerLinks = useMemo(
    () => NAV_LINKS.map((link) => ({ href: link.href, label: link.label })),
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
            onClick: onLoginClick,
          },
    ],
    [itemCount, openAccountMenu, openCart, openMenu, openSearch, onLoginClick, user],
  );

  return (
    <>
      <MobileNavDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        links={drawerLinks}
        activeHref={getActiveHref(activeNav)}
        variant="store"
      />
      <MobileSearchSheet
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        variant="store"
      />
      <AccountMenuDrawer
        open={accountMenuOpen}
        onClose={() => setAccountMenuOpen(false)}
        variant="store"
      />
      <MobileBottomNav items={bottomNavItems} variant="store" />
      <LoginModal
        open={loginOpen}
        onClose={onLoginClose}
        membershipTitle={membershipTitle}
      />
    </>
  );
}
