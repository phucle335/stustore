"use client";

import "@/styles/components/store-reset.css";
import "@/styles/components/store-alignment.css";
import { useState } from "react";
import { SiteFooter } from "@/components/home/SiteFooter";
import type { NavId } from "@/lib/store/types";
import { CommitmentBar } from "./CommitmentBar";
import { Header } from "./Header";
import { StoreMobileChrome } from "./StoreMobileChrome";
import shellStyles from "@/styles/components/store/StoreShell.module.css";

type StoreShellProps = {
  activeNav: NavId;
  membershipTitle?: string;
  children: React.ReactNode;
};

export function StoreShell({
  activeNav,
  membershipTitle,
  children,
}: StoreShellProps) {
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <>
      <Header
        activeNav={activeNav}
        onLoginClick={() => setLoginOpen(true)}
      />
      <CommitmentBar />
      <StoreMobileChrome
        activeNav={activeNav}
        membershipTitle={membershipTitle}
        onLoginClick={() => setLoginOpen(true)}
        loginOpen={loginOpen}
        onLoginClose={() => setLoginOpen(false)}
      />
      <div className={shellStyles.shellWithBottomNav}>
        {children}
        <SiteFooter />
      </div>
    </>
  );
}
