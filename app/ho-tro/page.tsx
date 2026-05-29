import "@/styles/pages/ho-tro.css";
import { SupportFaq } from "@/components/support/SupportFaq";
import { StoreShell } from "@/components/store/StoreShell";
import { getSiteContentServer } from "@/lib/site-content/get-site-content-server";
import { STORE_NAME } from "@/lib/store/site";

export const metadata = {
  title: `Hỗ trợ và giải đáp thắc mắc — ${STORE_NAME}`,
};

export default async function SupportPage() {
  const siteContent = await getSiteContentServer();
  const bg = siteContent.pages.support.backgroundImage?.trim();
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
        <article className="static-page">
          <h1 className="static-page-title">Hỗ trợ và giải đáp thắc mắc</h1>
          <p className="static-page-intro">
            Tìm câu trả lời nhanh về đặt hàng, thanh toán, giao nhận và đổi trả
            tại {STORE_NAME}.
          </p>
          <SupportFaq />
        </article>
      </div>
    </StoreShell>
  );
}
