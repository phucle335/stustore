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
              <MottoLine>Inspired From</MottoLine>
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
              Sneaker, streetwear, nước hoa và đồng hồ chính hãng — cam kết hàng
              thật, giao nhanh, đổi trả linh hoạt cho mọi phong cách thể thao.
            </MottoReveal>
          </div>

          <div>
            <MottoReveal as="h3" className={styles.bigIdeaSub}>
              <MottoLine>
                Stusport — điểm đến cho sneaker, streetwear và phụ kiện
              </MottoLine>
              <MottoLine>thể thao chính hãng tại Việt Nam.</MottoLine>
            </MottoReveal>
            <MottoReveal as="p" className={styles.body} splitLines={false}>
              Từ giày limited đến quần áo training, nước hoa và đồng hồ — mọi
              sản phẩm đều được tuyển chọn kỹ, cam kết authentic và trải nghiệm
              mua sắm trọn vẹn.
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
