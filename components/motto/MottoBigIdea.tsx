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
            <p className={styles.eyebrow}>(Về chúng tôi)</p>
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
              Được vận hành bởi những người trẻ đam mê Street-culture, STUSPORT không chỉ bán hàng chính hãng, chúng tôi mang đến một phong cách sống.
            </MottoReveal>
          </div>

          <div>
            <MottoReveal as="h3" className={styles.bigIdeaSub}>
              <MottoLine>
              Nền tảng chuyên phân phối Sneaker, Sportswear và phụ kiện chính hãng. Cam kết 100% Authentic, đổi trả linh hoạt 7 ngày.
              </MottoLine>
          
            </MottoReveal>
            <MottoReveal as="p" className={styles.body} splitLines={false}>
            Trải nghiệm giải pháp mua sắm thông minh
            Đặt trước (Preorder) để tối ưu chi phí, hoặc sở hữu ngay (Hot Stock) các items "on-trend" nhất với cam kết minh bạch và mức giá dễ tiếp cận.
            </MottoReveal>

            <p className={`${styles.eyebrow} ${styles.bigIdeaPurpose}`}>
              (DANH MỤC NỔI BẬT)
            </p>

            <ul className={styles.linkList}>
              <li>
                <Link href="/sneakers" className={styles.btnLink}>
                  <span>Xem Sneaker</span>
                  <span aria-hidden>→</span>
                </Link>
              </li>
              <li>
                <Link href="#work" className={styles.btnLink}>
                  <span>Khám phá bộ sưu tập</span>
                  <span aria-hidden>→</span>
                </Link>
              </li>
              <li>
                <Link href="/ho-tro" className={styles.btnLink}>
                  <span>Hỗ trợ khách hàng</span>
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
