import "@/styles/pages/dang-nhap.css";
import type { Metadata } from "next";
import { Suspense } from "react";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { CustomerPageWrap } from "@/components/store/CustomerPageWrap";
import { StoreShell } from "@/components/store/StoreShell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Forgot Password | Stusport",
};

export default function ForgotPasswordPage() {
  return (
    <StoreShell activeNav="home">
      <CustomerPageWrap narrow>
        <Suspense
          fallback={<div className="customer-auth-card--loading" aria-hidden />}
        >
          <ForgotPasswordForm audience="customer" />
        </Suspense>
      </CustomerPageWrap>
    </StoreShell>
  );
}
