import Link from "next/link";
import styles from "@/styles/components/motto/MottoBigIdea.module.css";
import { MottoLine, MottoReveal } from "./MottoReveal";
import { MottoLogo } from "./MottoLogo";

export function MottoBigIdea() {
  return (
    <section className={styles.bigIdea} id="services">
      <div className={styles.container}>
        <div className={styles.bigIdeaGrid}>
          <div>
            <p className={styles.eyebrow}>(About Us)</p>
            <MottoReveal as="h2" className={styles.bigIdeaTitle}>
              <MottoLine>The Authentic Culture</MottoLine>
              <MottoLine>
                <MottoLogo
                  className={`${styles.bigIdeaTitleLogo} stusport-logo--title`}
                  tone="on-dark"
                />
              </MottoLine>
            </MottoReveal>
            <MottoReveal
              as="p"
              className={`${styles.body} ${styles.bigIdeaLead}`}
              splitLines={false}
            >
              Operated by young people passionate about Street-culture, STUSPORT
              not only sells authentic products, we bring a lifestyle.
            </MottoReveal>
          </div>

          <div>
            <MottoReveal as="h3" className={styles.bigIdeaSub}>
              <MottoLine>
              Platform specializing in distributing authentic Sneakers, Sportswear and accessories. 100% Authentic commitment, flexible 7-day returns.
              </MottoLine>
          
            </MottoReveal>
            <MottoReveal as="p" className={styles.body} splitLines={false}>
            Experience smart shopping solutions
            Pre-order to optimize costs, or own the trendiest items (Hot Stock) with transparent commitment and accessible prices.
            </MottoReveal>

            <p className={`${styles.eyebrow} ${styles.bigIdeaPurpose}`}>
              (FEATURED CATEGORIES)
            </p>

            <ul className={styles.linkList}>
              <li>
                <Link href="/sneakers" className={styles.btnLink}>
                  <span>View Sneakers</span>
                  <span aria-hidden>→</span>
                </Link>
              </li>
              <li>
                <Link href="#work" className={styles.btnLink}>
                  <span>Explore Collections</span>
                  <span aria-hidden>→</span>
                </Link>
              </li>
              <li>
                <Link href="/ho-tro" className={styles.btnLink}>
                  <span>Customer Support</span>
                  <span aria-hidden>→</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
