import "@/styles/pages/checkout.css";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CheckoutView } from "@/components/store/CheckoutView";
import { CustomerPageWrap } from "@/components/store/CustomerPageWrap";
import { StoreShell } from "@/components/store/StoreShell";
import { createAuthServerClient } from "@/lib/supabase/auth-server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Thanh toán | Stusport",
};

export default async function CheckoutPage() {
  const supabase = await createAuthServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/dang-nhap?redirect=/checkout");
  }

  return (
    <StoreShell activeNav="home">
      <CustomerPageWrap narrow theme="dark">
        <CheckoutView />
      </CustomerPageWrap>
    </StoreShell>
  );
}
