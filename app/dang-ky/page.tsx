import "@/styles/pages/dang-ky.css";
import type { Metadata } from "next";
import { Suspense } from "react";
import { CustomerAuthForm } from "@/components/auth/CustomerAuthForm";
import { CustomerPageWrap } from "@/components/store/CustomerPageWrap";
import { StoreShell } from "@/components/store/StoreShell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Đăng ký | Stusport",
};

export default function RegisterPage() {
  return (
    <StoreShell activeNav="home">
      <CustomerPageWrap narrow>
        <Suspense
          fallback={<div className="customer-auth-card--loading" aria-hidden />}
        >
          <CustomerAuthForm mode="register" />
        </Suspense>
      </CustomerPageWrap>
    </StoreShell>
  );
}
