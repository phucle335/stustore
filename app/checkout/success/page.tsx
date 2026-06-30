import type { Metadata } from "next";
import { Suspense } from "react";
import { CustomerPageWrap } from "@/components/store/CustomerPageWrap";
import { StoreShell } from "@/components/store/StoreShell";
import SuccessClient from "./success-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout Successful | Stusport",
};

export default function CheckoutSuccessPage() {
  return (
    <StoreShell activeNav="home">
      <CustomerPageWrap narrow theme="dark">
        <Suspense fallback={null}>
          <SuccessClient />
        </Suspense>
      </CustomerPageWrap>
    </StoreShell>
  );
}
