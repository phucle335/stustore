"use client";

import { useCallback, useEffect, useState } from "react";
import { MOTTO_TESTIMONIALS } from "@/lib/motto/content";
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
    <section className="motto-testimonials">
      <div className="motto-container">
        <MottoReveal as="h2" className="motto-testimonials-title" splitLines={false}>
          Khách hàng nói gì
        </MottoReveal>
        <MottoReveal as="p" className="motto-testimonials-sub" splitLines={false}>
          Trải nghiệm thực tế khi mua sắm tại Stusport
        </MottoReveal>

        <div className="motto-testimonials-slider">
          <div className="motto-testimonials-counter">
            <span>{String(index + 1).padStart(2, "0")}</span>
            <span className="motto-testimonials-counter-sep">—</span>
            <span>{String(total).padStart(2, "0")}</span>
          </div>

          <blockquote
            className={`motto-testimonial-quote ${animating ? "is-changing" : ""}`}
          >
            <p>&ldquo;{current.quote}&rdquo;</p>
            <footer>
              <cite>{current.name}</cite>
              <span>{current.company}</span>
            </footer>
          </blockquote>

          <div className="motto-testimonials-nav">
            <button
              type="button"
              className="motto-testimonials-btn"
              aria-label="Previous testimonial"
              onClick={() => go(index - 1)}
            >
              ←
            </button>
            <button
              type="button"
              className="motto-testimonials-btn"
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
