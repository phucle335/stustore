import { PARTNER_BRAND_LOGO_URLS } from "@/lib/motto/content";
import styles from "@/styles/components/home/HomeLegacy.module.css";

export function HomeBrandMarquee() {
  const logos = [...PARTNER_BRAND_LOGO_URLS, ...PARTNER_BRAND_LOGO_URLS];

  return (
    <div className={styles.homeBrandMarquee} aria-label="Partner brands">
      <div className={styles.homeBrandMarqueeTrack}>
        {logos.map((src, index) => (
          <div key={`${src}-${index}`} className={styles.homeBrandMarqueeItem}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" loading="lazy" decoding="async" />
          </div>
        ))}
      </div>
    </div>
  );
}
