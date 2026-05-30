import "@/styles/pages/dieu-khoan.css";
import { StoreShell } from "@/components/store/StoreShell";
import { StaticPageShell } from "@/components/store/StaticPageShell";
import { TermsContent } from "@/components/terms/TermsContent";
import { getSiteContentServer } from "@/lib/site-content/get-site-content-server";
import { STORE_NAME } from "@/lib/store/site";

export const metadata = {
  title: `Điều khoản và Điều kiện — ${STORE_NAME}`,
};

export default async function TermsPage() {
  const siteContent = await getSiteContentServer();
  const bg = siteContent.pages.terms.backgroundImage?.trim();

  return (
    <StoreShell activeNav="home">
      <StaticPageShell backgroundImage={bg}>
        <TermsContent />
      </StaticPageShell>
    </StoreShell>
  );
}
