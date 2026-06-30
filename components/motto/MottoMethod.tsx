import Link from "next/link";
import { StusportLogo } from "@/components/brand/StusportLogo";
import styles from "@/styles/components/motto/MottoMethod.module.css";
import { MottoLine, MottoReveal } from "./MottoReveal";

export function MottoMethodMarquee() {
  const items = Array.from({ length: 16 }, (_, i) => i);

  return (
    <div className={styles.methodMarqueeWrap} aria-hidden>
      <div className={styles.methodMarquee}>
        {items.map((i) => (
          <span key={i} className={styles.methodMarqueeWord}>
            <StusportLogo variant="mark" className="stusport-logo--marquee" />
          </span>
        ))}
      </div>
    </div>
  );
}

export function MottoMethod() {
  return (
    <section className={styles.method} id="method">
      <MottoMethodMarquee />
      <div className={styles.container}>
        <MottoReveal as="h2" className={styles.methodTitle}>
          <MottoLine>Quality</MottoLine>
          <MottoLine>commitment.</MottoLine>
        </MottoReveal>
        <MottoReveal
          as="p"
          className={`${styles.body} ${styles.methodText}`}
          splitLines={false}
        >
          100% Authentic products, free shipping on orders from 799k, and returns
          up to 14 days — Stusport puts customer experience first in every order.
        </MottoReveal>
        <Link href="/ho-tro" className={styles.btnLink}>
          <span>View Support Policies</span>
          <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  );
}
