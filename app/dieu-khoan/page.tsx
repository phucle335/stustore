import "@/styles/pages/dieu-khoan.css";
import { StoreShell } from "@/components/store/StoreShell";
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
        <TermsContent />
      </div>
    </StoreShell>
  );
}
