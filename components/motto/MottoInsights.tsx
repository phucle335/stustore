import Link from "next/link";
import styles from "@/styles/components/motto/MottoInsights.module.css";
import { MottoReveal } from "./MottoReveal";

export function MottoInsights({
  introText,
  cards,
}: {
  introText: string;
  cards: { title: string; href: string }[];
}) {
  return (
    <section className={styles.insights}>
      <div className={styles.container}>
        <MottoReveal as="p" className={styles.insightsIntro} splitLines={false}>
          {introText}
        </MottoReveal>

        <ul className={styles.insightsList}>
          {cards.map((item) => (
            <li key={item.title}>
              <Link href={item.href} className={styles.insightsCard}>
                <h3>{item.title}</h3>
                <span className={styles.insightsArrow} aria-hidden>
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
