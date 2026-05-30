import "@/styles/pages/ho-tro.css";
import { SupportFaq } from "@/components/support/SupportFaq";
import { StoreShell } from "@/components/store/StoreShell";
import { StaticPageShell } from "@/components/store/StaticPageShell";
import { getSiteContentServer } from "@/lib/site-content/get-site-content-server";
import { STORE_NAME } from "@/lib/store/site";
import styles from "@/styles/components/store/StoreStatic.module.css";

export const metadata = {
  title: `Hỗ trợ và giải đáp thắc mắc — ${STORE_NAME}`,
};

export default async function SupportPage() {
  const siteContent = await getSiteContentServer();
  const bg = siteContent.pages.support.backgroundImage?.trim();

  return (
    <StoreShell activeNav="home">
      <StaticPageShell backgroundImage={bg}>
        <h1 className={styles.staticPageTitle}>Hỗ trợ và giải đáp thắc mắc</h1>
        <p className={styles.staticPageIntro}>
          Tìm câu trả lời nhanh về đặt hàng, thanh toán, giao nhận và đổi trả
          tại {STORE_NAME}.
        </p>
        <SupportFaq />
      </StaticPageShell>
    </StoreShell>
  );
}
