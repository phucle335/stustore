import "@/styles/pages/khong-co-quyen.css";
import type { Metadata } from "next";
import { Suspense } from "react";
import { ForbiddenMessage } from "@/components/auth/ForbiddenMessage";
import { CustomerPageWrap } from "@/components/store/CustomerPageWrap";
import { StoreShell } from "@/components/store/StoreShell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Không có quyền truy cập | Stusport",
  robots: { index: false, follow: false },
};

export default function ForbiddenPage() {
  return (
    <StoreShell activeNav="home">
      <CustomerPageWrap narrow>
        <Suspense
          fallback={<div className="customer-auth-card--loading" aria-hidden />}
        >
          <ForbiddenMessage />
        </Suspense>
      </CustomerPageWrap>
    </StoreShell>
  );
}
