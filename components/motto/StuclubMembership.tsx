"use client";

import { useState } from "react";
import { LoginModal } from "@/components/store/LoginModal";
import styles from "@/styles/components/motto/MottoStuclub.module.css";

type Tier = {
  title: string;
  requirement: string;
  benefits: string[];
};

type Faq = {
  question: string;
  answer: string;
};

const TIERS: Tier[] = [
  {
    title: "Starter",
    requirement: "0–499 STU Points",
    benefits: [
      "Welcome Voucher: 100,000 VND off",
      "Access to member-only promotions",
      "Earn STU Points on every eligible purchase",
    ],
  },
  {
    title: "Member",
    requirement: "500–1,999 STU Points",
    benefits: [
      "All Starter benefits",
      "Member Reward Voucher",
      "Early access to new arrivals and selected pre-orders",
      "Exclusive member-only discount codes",
      "Double STU Points during special campaigns",
    ],
  },
  {
    title: "Elite",
    requirement: "2,000+ STU Points",
    benefits: [
      "All Starter and Member benefits",
      "Elite Reward Voucher",
      "15% loyalty discount (maximum 1,000,000 VND)",
      "Exclusive gifts and merchandise",
      "Priority customer support",
      "Early access to limited sneaker releases and exclusive pre-orders",
      "Invitations to special events and campaigns",
    ],
  },
];

const FAQS: Faq[] = [
  {
    question: "How do I earn STU Points?",
    answer:
      "Earn 1 STU Point for every 10,000 VND spent on eligible purchases. Points are added automatically after order completion.",
  },
  {
    question: "When do I move up a membership level?",
    answer:
      "Your tier is based on your total earned STU Points. Once your lifetime points reach 500 or 2,000, you move to the next level automatically.",
  },
  {
    question: "Can I use vouchers with other offers?",
    answer:
      "Unless stated otherwise, vouchers cannot be combined with other promotions. Stacking rules are shown during checkout.",
  },
  {
    question: "Do STU Points expire?",
    answer:
      "Yes. Unused STU Points expire after 12 months of inactivity unless otherwise stated in a campaign or promotion.",
  },
  {
    question: "How do I receive my rewards?",
    answer:
      "Rewards and vouchers are delivered to your account. Exclusive event invitations are sent by email or message when available.",
  },
];

export function StuclubMembership() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <section className={styles.page}>
      <div className={styles.container}>
        <div className={styles.headingWrap}>
          <h1 className={styles.heading}>STUClub Membership</h1>
          <div className={styles.headingActions}>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={() => setLoginOpen(true)}
            >
              Register / Sign In
            </button>
          </div>
        </div>

        <LoginModal
          open={loginOpen}
          onClose={() => setLoginOpen(false)}
        />

        <div className={styles.pointBanner}>
          <div className={styles.pointIconWrap}>
            <i className={`fas fa-star ${styles.pointIcon}`} aria-hidden="true" />
          </div>
          <div>
            <p className={styles.pointLabel}>Point System</p>
            <p className={styles.pointValue}>
              Earn <strong>1 STU Point</strong> for every <strong>10,000 VND</strong> spent.
            </p>
          </div>
        </div>

        <div className={styles.tiersGrid}>
          {TIERS.map((tier) => (
            <div key={tier.title} className={styles.tierCard}>
              <div className={styles.tierHeader}>
                <div className={styles.tierBadge}>{tier.title}</div>
                <p className={styles.tierRequirement}>{tier.requirement}</p>
              </div>
              <ul className={styles.benefitList}>
                {tier.benefits.map((benefit) => (
                  <li key={benefit} className={styles.benefitItem}>
                    <i className="fas fa-check" aria-hidden="true" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className={styles.faqSection}>
          <h2 className={styles.sectionHeading}>Frequently Asked Questions</h2>

          <div className={styles.faqList}>
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={faq.question} className={`${styles.faqItem} ${isOpen ? styles.faqOpen : ""}`}>
                  <button
                    type="button"
                    className={styles.faqTrigger}
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                  >
                    <span>{faq.question}</span>
                    <i className={`fas fa-chevron-down ${styles.faqChevron}`} aria-hidden="true" />
                  </button>
                  <div className={styles.faqPanel}>
                    <p className={styles.faqAnswer}>{faq.answer}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
