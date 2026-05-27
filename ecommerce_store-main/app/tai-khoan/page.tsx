import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MemberAccountPage } from "@/components/account/MemberAccountPage";
import { CustomerPageWrap } from "@/components/store/CustomerPageWrap";
import { StoreShell } from "@/components/store/StoreShell";
import { getAllProducts } from "@/lib/store/catalog";
import { createAuthServerClient } from "@/lib/supabase/auth-server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tài khoản thành viên | Stusport",
};

export default async function MemberAccountRoute() {
  const supabase = await createAuthServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/dang-nhap?redirect=/tai-khoan");
  }

  const products = await getAllProducts();
  const productsById = Object.fromEntries(
    products.map((product) => [product.id, product]),
  );

  return (
    <StoreShell activeNav="home">
      <CustomerPageWrap>
        <MemberAccountPage productsById={productsById} />
      </CustomerPageWrap>
    </StoreShell>
  );
}
