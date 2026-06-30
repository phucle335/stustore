import "@/styles/pages/ho-tro.css";
import { SupportFaq } from "@/components/support/SupportFaq";
import { StoreShell } from "@/components/store/StoreShell";
import { StaticPageShell } from "@/components/store/StaticPageShell";
import { getSiteContentServer } from "@/lib/site-content/get-site-content-server";
import { STORE_NAME } from "@/lib/store/site";
import styles from "@/styles/components/store/StoreStatic.module.css";

export const metadata = {
  title: `Help & FAQ — ${STORE_NAME}`,
};

export default async function SupportPage() {
  const siteContent = await getSiteContentServer();
  const bg = siteContent.pages.support.backgroundImage?.trim();

  return (
    <StoreShell activeNav="home">
      <StaticPageShell backgroundImage={bg}>
        <h1 className={styles.staticPageTitle}>Help & FAQ</h1>
        <p className={styles.staticPageIntro}>
          Find quick answers about ordering, payment, delivery, and returns
          at {STORE_NAME}.
        </p>
        <SupportFaq />
      </StaticPageShell>
    </StoreShell>
  );
}
