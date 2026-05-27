"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { StusportLogo } from "@/components/brand/StusportLogo";
import { MOTTO_NAV } from "@/lib/motto/content";

export function MottoHeader({ theme = "light" }: { theme?: "light" | "dark" }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const headerTheme = scrolled ? "dark" : theme;

  return (
    <>
      <header
        className={`motto-header ${headerTheme === "dark" ? "is-dark" : ""} ${scrolled ? "is-scrolled" : ""}`}
      >
        <div className="motto-container motto-header-inner">
          <StusportLogo href="/" variant="mark" className="motto-header-logo" />

          <nav className="motto-header-nav" aria-label="Main">
            <ul>
              {MOTTO_NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="motto-link-hover">
                    <span className="motto-link-label">{item.label}</span>
                    <span className="motto-link-hover-text" aria-hidden>
                      {item.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="motto-header-actions">
            <Link href="/sneakers" className="motto-btn motto-btn--pill">
              Mua ngay
            </Link>
            <button
              type="button"
              className="motto-header-burger"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <div
        className={`motto-mobile-nav ${menuOpen ? "is-open" : ""}`}
        aria-hidden={!menuOpen}
      >
        <nav aria-label="Mobile">
          <ul>
            {MOTTO_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="motto-mobile-nav-link"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/sneakers"
            className="motto-btn motto-btn--pill motto-btn--invert"
            onClick={() => setMenuOpen(false)}
          >
            Mua ngay
          </Link>
        </nav>
      </div>
    </>
  );
}
