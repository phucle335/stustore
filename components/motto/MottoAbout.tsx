import Link from "next/link";
import Image from "next/image";
import styles from "@/styles/components/motto/MottoAbout.module.css";
import { MottoReveal } from "./MottoReveal";
import { STORE_NAME } from "@/lib/store/site";

export function MottoAbout() {
  return (
    <section className={styles.about} id="about">
      <div className={styles.container}>
        <MottoReveal as="h2" className={styles.aboutTitle} splitLines={false}>
          About Stusport
        </MottoReveal>

        <div className={styles.aboutGrid}>
          <div className={styles.aboutCard}>
            <div className={styles.aboutCardMedia}>
              <Image
                src="https://cdn.phototourl.com/free/2026-06-05-6255950b-a8fb-43f0-897a-6475a6eb7bae.png"
                alt="Studio Stusport"
                fill
                sizes="(max-width: 767px) 100vw, 50vw"
              />
            </div>
            <p className={styles.aboutCardLabel}>Studio Stusport</p>
          </div>
          <div className={styles.aboutCard}>
            <div className={styles.aboutCardMedia}>
              <Image
                src="https://minhshop.vn/_next/static/media/about-2.fb51b4e0.jpg"
                alt="Stusport Online Store"
                fill
                sizes="(max-width: 767px) 100vw, 50vw"
              />
            </div>
            <p className={styles.aboutCardLabel}>Online Store</p>
          </div>
        </div>

        <MottoReveal
          as="p"
          className={`${styles.body} ${styles.aboutText}`}
          splitLines={false}
        >
          <Link href="/gioi-thieu">
            Operated by young people passionate about Street-culture, {STORE_NAME} not
            only sells authentic products, we bring a lifestyle.
          </Link>
        </MottoReveal>

        <Link href="/gioi-thieu" className={styles.btnLink}>
          About Us
        </Link>
      </div>
    </section>
  );
}
