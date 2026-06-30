import "@/styles/pages/dang-nhap.css";
import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { CustomerPageWrap } from "@/components/store/CustomerPageWrap";
import { StoreShell } from "@/components/store/StoreShell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reset Password | Stusport",
};

export default function ResetPasswordPage() {
  return (
    <StoreShell activeNav="home">
      <CustomerPageWrap narrow>
        <Suspense
          fallback={<div className="customer-auth-card--loading" aria-hidden />}
        >
          <ResetPasswordForm audience="customer" />
        </Suspense>
      </CustomerPageWrap>
    </StoreShell>
  );
}
