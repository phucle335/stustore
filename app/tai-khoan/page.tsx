import "@/styles/pages/tai-khoan.css";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MemberAccountPage } from "@/components/account/MemberAccountPage";
import { CustomerPageWrap } from "@/components/store/CustomerPageWrap";
import { StoreShell } from "@/components/store/StoreShell";
import { getSiteContentServer } from "@/lib/site-content/get-site-content-server";
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
  const siteContent = await getSiteContentServer();
  const bg = siteContent.pages.account.backgroundImage?.trim();
  const productsById = Object.fromEntries(
    products.map((product) => [product.id, product]),
  );

  return (
    <StoreShell activeNav="home">
      <CustomerPageWrap>
        <div
          className="static-page-wrap"
          style={
            bg
              ? {
                  backgroundImage: `linear-gradient(rgba(0,0,0,0.38), rgba(0,0,0,0.38)), url(${bg})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
        >
          <article className="static-page">
            <MemberAccountPage productsById={productsById} />
          </article>
        </div>
      </CustomerPageWrap>
    </StoreShell>
  );
}
