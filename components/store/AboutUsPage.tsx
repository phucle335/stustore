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
                  About STUSPORT
                </p>
              </Reveal>

              <Reveal delay={0.06}>
                <h1 className={styles.heroTitle}>
                  STUSPORT —{" "}
                  <span className={styles.accentText}>
                    The platform shaping authentic sports style and street culture
                  </span>{" "}
                  .
                </h1>
              </Reveal>

              <Reveal delay={0.12}>
                <p className={styles.heroLead}>
                  Dark. Bold. Hypebeast. Minimal yet powerful, focused on a clear
                  and reliable shopping experience.
                </p>
              </Reveal>

              <Reveal delay={0.18}>
                <div className={styles.heroActions}>
                  <Link href="/sneakers" className={styles.btnPrimary}>
                    Explore Products
                  </Link>
                  <Link href="/ho-tro" className={styles.btnSecondary}>
                    View Support Policies
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
                <SectionTitle eyebrow="Our story" title="Our Story" />
              </Reveal>
              <Reveal delay={0.06}>
                <p className={styles.bodyText}>
                  STUSPORT was founded by a team of young people with deep
                  understanding of sneaker and streetwear culture. We recognized a
                  "market paradox" in Vietnam: consumers are always anxious about
                  the rampant proliferation of counterfeit goods on e-commerce
                  platforms. Meanwhile, authorized distributors have prices that are
                  too high. STUSPORT was born as a specialized e-commerce platform
                  committed to 100% authentic sports shoes, clothing, and accessories
                  to completely remove these barriers.
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
                      "Energy meets authenticity."
                    </p>
                    <p className={styles.storyCaption}>
                      This space is for lookbook photos / team / store to enhance
                      brand depth.
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
            <SectionTitle eyebrow="Direction" title="Mission & Vision" />
          </Reveal>

          <div className={styles.cardGrid}>
            <Reveal delay={0.04}>
              <div className={styles.infoCard}>
                <p className={styles.cardLabel}>Mission</p>
                <p className={styles.infoCardText}>
                  Democratize access to authentic sports shoes and gear for young
                  Vietnamese people. Eliminate counterfeit anxiety with a transparent
                  online marketplace.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <div className={styles.infoCardAccent}>
                <p className={styles.cardLabel}>Vision</p>
                <p className={styles.infoCardText}>
                  <span className={styles.yearHighlight}>2028</span> Become a Top 5
                  authentic sports gear distribution platform in Vietnam.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className={styles.sectionSpaced}>
        <div className={styles.container}>
          <Reveal>
            <SectionTitle eyebrow="Core values" title="Core Values" />
          </Reveal>

          <div className={styles.valuesGrid}>
            <Reveal delay={0.02}>
              <div className={styles.valueCard}>
                <div className={styles.valueCardHeader}>
                  <ShieldCheck className={styles.iconMd} aria-hidden />
                  <p className={styles.valueCardTitle}>Authentic</p>
                </div>
                <p className={styles.valueCardDesc}>
                  Absolute authenticity — 100% products come with Legit Check
                  certification.
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
                  Breakthrough pricing — breaking financial barriers with smart
                  Preorder model.
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
                  Complete transparency — absolute clarity on origin, pricing, and
                  policies.
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
                  Community-focused — not just transactions, we share passion.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className={styles.sectionSpacedLast}>
        <div className={styles.container}>
          <Reveal>
            <SectionTitle eyebrow="Hybrid model" title="Why Choose STUSPORT" />
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
                      Express Delivery (Hot Stock)
                    </p>
                    <p className={styles.featureDesc}>
                      Receive quickly with 2-4 hour delivery in Ho Chi Minh City,
                      3 days nationwide. Pre-order delivery from 7-14 days.
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
                      Best Price Pre-order (Preorder)
                    </p>
                    <p className={styles.featureDesc}>
                      Secure limited editions at 15-30% lower than traditional
                      retail prices.
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
