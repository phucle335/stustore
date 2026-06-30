import "@/styles/pages/tai-khoan.css";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MemberAccountPage } from "@/components/account/MemberAccountPage";
import { StoreShell } from "@/components/store/StoreShell";
import { StaticPageShell } from "@/components/store/StaticPageShell";
import { getSiteContentServer } from "@/lib/site-content/get-site-content-server";
import { getAllProducts } from "@/lib/store/catalog";
import { createAuthServerClient } from "@/lib/supabase/auth-server";
import customerStyles from "@/styles/components/store/Customer.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Member Account | Stusport",
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
  const siteContent = await getSiteContentServer();
  const bg = siteContent.pages.account.backgroundImage?.trim();
  const productsById = Object.fromEntries(
    products.map((product) => [product.id, product]),
  );

  return (
    <StoreShell activeNav="home">
      <StaticPageShell backgroundImage={bg}>
        <div className={`${customerStyles.customerPageWrapDark} taiKhoanPage`}>
          <MemberAccountPage productsById={productsById} />
        </div>
      </StaticPageShell>
    </StoreShell>
  );
}
