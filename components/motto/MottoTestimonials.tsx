"use client";

import { useCallback, useEffect, useState } from "react";
import { MOTTO_TESTIMONIALS } from "@/lib/motto/content";
import styles from "@/styles/components/motto/MottoTestimonials.module.css";
import { MottoReveal } from "./MottoReveal";

export function MottoTestimonials() {
  const [index, setIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const total = MOTTO_TESTIMONIALS.length;
  const current = MOTTO_TESTIMONIALS[index];

  const go = useCallback(
    (next: number) => {
      if (animating) return;
      setAnimating(true);
      setIndex((next + total) % total);
      window.setTimeout(() => setAnimating(false), 600);
    },
    [animating, total],
  );

  useEffect(() => {
    const id = window.setInterval(() => go(index + 1), 7000);
    return () => clearInterval(id);
  }, [go, index]);

  return (
    <section className={styles.testimonials}>
      <div className={styles.container}>
        <MottoReveal
          as="h2"
          className={styles.testimonialsTitle}
          splitLines={false}
        >
          Khách hàng nói gì
        </MottoReveal>
        <MottoReveal
          as="p"
          className={styles.testimonialsSub}
          splitLines={false}
        >
          Trải nghiệm thực tế khi mua sắm tại Stusport
        </MottoReveal>

        <div className={styles.testimonialsSlider}>
          <div className={styles.testimonialsCounter}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <span>—</span>
            <span>{String(total).padStart(2, "0")}</span>
          </div>

          <blockquote
            className={`${styles.testimonialQuote} ${animating ? styles.isChanging : ""}`}
          >
            <p>&ldquo;{current.quote}&rdquo;</p>
            <footer>
              <cite>{current.name}</cite>
              <span>{current.company}</span>
            </footer>
          </blockquote>

          <div className={styles.testimonialsNav}>
            <button
              type="button"
              className={styles.testimonialsBtn}
              aria-label="Previous testimonial"
              onClick={() => go(index - 1)}
            >
              ←
            </button>
            <button
              type="button"
              className={styles.testimonialsBtn}
              aria-label="Next testimonial"
              onClick={() => go(index + 1)}
            >
              →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
