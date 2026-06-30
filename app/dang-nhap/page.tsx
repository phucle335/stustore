import "@/styles/pages/dang-nhap.css";
import type { Metadata } from "next";
import { Suspense } from "react";
import { CustomerAuthForm } from "@/components/auth/CustomerAuthForm";
import { CustomerPageWrap } from "@/components/store/CustomerPageWrap";
import { StoreShell } from "@/components/store/StoreShell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign In | Stusport",
};

export default function CustomerLoginPage() {
  return (
    <StoreShell activeNav="home">
      <CustomerPageWrap narrow pageClassName="dangNhapPage">
        <Suspense
          fallback={<div className="customer-auth-card--loading" aria-hidden />}
        >
          <CustomerAuthForm mode="login" />
        </Suspense>
      </CustomerPageWrap>
    </StoreShell>
  );
}
