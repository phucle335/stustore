"use client";

import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import {
  BadgePercent,
  ShieldCheck,
  ScanSearch,
  Users,
  Zap,
  Package,
} from "lucide-react";
import styles from "@/styles/components/store/AboutUsPage.module.css";

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
};

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      variants={revealVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className={styles.sectionTitleBlock}>
      <p className={styles.sectionEyebrow}>{eyebrow}</p>
      <h2 className={styles.sectionHeading}>{title}</h2>
    </div>
  );
}

export function AboutUsPage() {
  return (
    <div className={styles.page}>
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.heroCard}>
            <div className={styles.heroGlowLayer}>
              <div className={styles.heroGlowTop} />
              <div className={styles.heroGlowBottom} />
            </div>

            <div className={styles.heroInner}>
              <Reveal>
                <p className={styles.badge}>
                  <Zap className={styles.iconSm} aria-hidden />
                  Giới thiệu STUSPORT
                </p>
              </Reveal>

              <Reveal delay={0.06}>
                <h1 className={styles.heroTitle}>
                  STUSPORT —{" "}
                  <span className={styles.accentText}>
                    Nền tảng định hình phong cách thể thao và văn hóa đường phố
                  </span>{" "}
                  chính hãng.
                </h1>
              </Reveal>

              <Reveal delay={0.12}>
                <p className={styles.heroLead}>
                  Dark. Bold. Hypebeast. Tối giản nhưng mạnh mẽ, tập trung vào trải
                  nghiệm mua sắm rõ ràng và đáng tin cậy.
                </p>
              </Reveal>

              <Reveal delay={0.18}>
                <div className={styles.heroActions}>
                  <Link href="/sneakers" className={styles.btnPrimary}>
                    Khám phá sản phẩm
                  </Link>
                  <Link href="/ho-tro" className={styles.btnSecondary}>
                    Xem chính sách hỗ trợ
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.sectionSpaced}>
        <div className={styles.container}>
          <div className={styles.twoColGrid}>
            <div>
              <Reveal>
                <SectionTitle eyebrow="Our story" title="Câu chuyện của chúng tôi" />
              </Reveal>
              <Reveal delay={0.06}>
                <p className={styles.bodyText}>
                  STUSPORT được hình thành bởi một đội ngũ những người trẻ có sự
                  am hiểu sâu sắc về văn hóa sneaker và streetwear. Chúng tôi
                  nhận ra một “nghịch lý thị trường” tại Việt Nam: người tiêu
                  dùng luôn nơm nớp lo sợ trước vấn nạn hàng giả tràn lan trên
                  các sàn thương mại điện tử. Trong khi đó, các cửa hàng phân
                  phối chính hãng lại có mức giá quá cao. STUSPORT ra đời như một
                  nền tảng thương mại điện tử chuyên biệt, cam kết 100% giày thể
                  thao, quần áo và phụ kiện chính hãng nhằm xóa bỏ hoàn toàn rào
                  cản đó.
                </p>
              </Reveal>
            </div>

            <div>
              <Reveal>
                <div className={styles.storyCard}>
                  <div className={styles.storyCardGradient} />
                  <div className={styles.storyCardBody}>
                    <p className={styles.cardLabel}>Placeholder image</p>
                    <p className={styles.storyQuote}>
                      “Energy meets authenticity.”
                    </p>
                    <p className={styles.storyCaption}>
                      Đây là vị trí cho ảnh lookbook / đội ngũ / cửa hàng để tăng
                      chiều sâu thương hiệu.
                    </p>
                    <div className={styles.thumbRow}>
                      <div className={styles.thumb} />
                      <div className={styles.thumb} />
                      <div className={styles.thumb} />
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.sectionSpaced}>
        <div className={styles.container}>
          <Reveal>
            <SectionTitle eyebrow="Direction" title="Sứ mệnh & Tầm nhìn" />
          </Reveal>

          <div className={styles.cardGrid}>
            <Reveal delay={0.04}>
              <div className={styles.infoCard}>
                <p className={styles.cardLabel}>Sứ mệnh</p>
                <p className={styles.infoCardText}>
                  Xu hướng hóa việc tiếp cận các sản phẩm giày và đồ thể thao
                  chính hãng cho giới trẻ Việt Nam. Xóa bỏ nỗi lo âu về hàng giả
                  bằng một thị trường trực tuyến minh bạch.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <div className={styles.infoCardAccent}>
                <p className={styles.cardLabel}>Tầm nhìn</p>
                <p className={styles.infoCardText}>
                  <span className={styles.yearHighlight}>2028</span> Trở thành nền
                  tảng phân phối đồ thể thao chính hãng Top 5 tại Việt
                  Nam.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className={styles.sectionSpaced}>
        <div className={styles.container}>
          <Reveal>
            <SectionTitle eyebrow="Core values" title="Giá trị cốt lõi" />
          </Reveal>

          <div className={styles.valuesGrid}>
            <Reveal delay={0.02}>
              <div className={styles.valueCard}>
                <div className={styles.valueCardHeader}>
                  <ShieldCheck className={styles.iconMd} aria-hidden />
                  <p className={styles.valueCardTitle}>Authentic</p>
                </div>
                <p className={styles.valueCardDesc}>
                  Chính hãng tuyệt đối — 100% sản phẩm đi kèm Chứng nhận Legit
                  Check.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.05}>
              <div className={styles.valueCard}>
                <div className={styles.valueCardHeader}>
                  <BadgePercent className={styles.iconMd} aria-hidden />
                  <p className={styles.valueCardTitle}>Accessible</p>
                </div>
                <p className={styles.valueCardDesc}>
                  Mức giá đột phá — phá vỡ rào cản tài chính nhờ mô hình Preorder
                  thông minh.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <div className={styles.valueCard}>
                <div className={styles.valueCardHeader}>
                  <ScanSearch className={styles.iconMd} aria-hidden />
                  <p className={styles.valueCardTitle}>Transparent</p>
                </div>
                <p className={styles.valueCardDesc}>
                  Minh bạch hoàn toàn — rõ ràng tuyệt đối về nguồn gốc, giá cả và
                  chính sách.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.11}>
              <div className={styles.valueCard}>
                <div className={styles.valueCardHeader}>
                  <Users className={styles.iconMd} aria-hidden />
                  <p className={styles.valueCardTitle}>Community-Centric</p>
                </div>
                <p className={styles.valueCardDesc}>
                  Trọng tâm cộng đồng — không chỉ là giao dịch, chúng tôi chia
                  sẻ đam mê.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className={styles.sectionSpacedLast}>
        <div className={styles.container}>
          <Reveal>
            <SectionTitle eyebrow="Hybrid model" title="Vì sao chọn STUSPORT" />
          </Reveal>

          <div className={styles.cardGrid}>
            <Reveal delay={0.04}>
              <div className={styles.featureCard}>
                <div className={styles.featureRow}>
                  <div className={styles.iconBox}>
                    <Package className={styles.iconMd} aria-hidden />
                  </div>
                  <div className={styles.featureContent}>
                    <p className={styles.featureTitle}>
                      Giao nhanh hỏa tốc (Hot Stock)
                    </p>
                    <p className={styles.featureDesc}>
                      Nhận ngay với dịch vụ giao hàng 2-4 giờ tại TP.HCM, 3 ngày
                      toàn quốc. Đối với Pre-order giao từ 7-14 ngày.
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <div className={styles.featureCard}>
                <div className={styles.featureRow}>
                  <div className={styles.iconBox}>
                    <BadgePercent className={styles.iconMd} aria-hidden />
                  </div>
                  <div className={styles.featureContent}>
                    <p className={styles.featureTitle}>
                      Đặt trước giá siêu tốt (Preorder)
                    </p>
                    <p className={styles.featureDesc}>
                      Săn bản giới hạn với mức giá thấp hơn 15-30% so với giá
                      bán lẻ truyền thống.
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}
