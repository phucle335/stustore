import { PARTNER_BRAND_LOGO_URLS } from "@/lib/motto/content";
import styles from "@/styles/components/motto/MottoBrandMarquee.module.css";

export function MottoBrandMarquee() {
  const logos = [...PARTNER_BRAND_LOGO_URLS, ...PARTNER_BRAND_LOGO_URLS];

  return (
    <div className={styles.brandMarquee} aria-label="Partner brands">
      <div className={styles.brandMarqueeTrack}>
        {logos.map((src, index) => (
          <div key={`${src}-${index}`} className={styles.brandMarqueeItem}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" loading="lazy" decoding="async" />
          </div>
        ))}
      </div>
    </div>
  );
}
