"use client";

import { useState } from "react";
import type { NavId } from "@/lib/store/types";
import { CommitmentBar } from "./CommitmentBar";
import { Header } from "./Header";
import { LoginModal } from "./LoginModal";

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
      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        membershipTitle={membershipTitle}
      />
      {children}
    </>
  );
}
