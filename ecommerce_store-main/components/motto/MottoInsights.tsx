import Link from "next/link";
import { MottoReveal } from "./MottoReveal";

export function MottoInsights({
  introText,
  cards,
}: {
  introText: string;
  cards: { title: string; href: string }[];
}) {
  return (
    <section className="motto-insights">
      <div className="motto-container">
        <MottoReveal as="p" className="motto-insights-intro" splitLines={false}>
          {introText}
        </MottoReveal>

        <ul className="motto-insights-list">
          {cards.map((item) => (
            <li key={item.title}>
              <Link href={item.href} className="motto-insights-card">
                <h3>{item.title}</h3>
                <span className="motto-insights-arrow" aria-hidden>
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
