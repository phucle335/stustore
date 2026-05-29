import Link from "next/link";
import Image from "next/image";
import styles from "@/styles/components/motto/MottoAbout.module.css";
import { MottoReveal } from "./MottoReveal";

export function MottoAbout() {
  return (
    <section className={styles.about} id="about">
      <div className={styles.container}>
        <MottoReveal as="h2" className={styles.aboutTitle} splitLines={false}>
          Về Stusport
        </MottoReveal>

        <div className={styles.aboutGrid}>
          <div className={styles.aboutCard}>
            <div className={styles.aboutCardMedia}>
              <Image
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80"
                alt="Showroom Stusport"
                fill
                sizes="(max-width: 767px) 100vw, 50vw"
              />
            </div>
            <p className={styles.aboutCardLabel}>Showroom TP.HCM</p>
          </div>
          <div className={styles.aboutCard}>
            <div className={styles.aboutCardMedia}>
              <Image
                src="https://images.unsplash.com/photo-1472851294608-062f824d0981?w=800&q=80"
                alt="Cửa hàng trực tuyến Stusport"
                fill
                sizes="(max-width: 767px) 100vw, 50vw"
              />
            </div>
            <p className={styles.aboutCardLabel}>Cửa hàng trực tuyến</p>
          </div>
        </div>

        <MottoReveal
          as="p"
          className={`${styles.body} ${styles.aboutText}`}
          splitLines={false}
        >
          Stusport mang đến sneaker và streetwear chính hãng, tư vấn size chuẩn
          và giao nhanh toàn quốc — mua sắm an tâm, đổi trả rõ ràng.
        </MottoReveal>

        <Link href="/ho-tro" className={styles.btnLink}>
          Liên hệ hỗ trợ
        </Link>
      </div>
    </section>
  );
}
