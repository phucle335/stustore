"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "@/styles/components/motto/MottoReveal.module.css";

gsap.registerPlugin(ScrollTrigger);

type MottoRevealProps = {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "h2" | "h3" | "p";
  delay?: number;
  splitLines?: boolean;
};

export function MottoReveal({
  children,
  className = "",
  as: Tag = "div",
  delay = 0,
  splitLines = true,
}: MottoRevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) {
      el.classList.add(styles.isVisible);
      return;
    }

    const lines = splitLines
      ? Array.from(el.querySelectorAll<HTMLElement>(`.${styles.line}`))
      : [el];

    gsap.set(lines, { yPercent: 110, opacity: 0 });

    const tween = gsap.to(lines, {
      yPercent: 0,
      opacity: 1,
      duration: 1.1,
      stagger: 0.08,
      delay,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        toggleActions: "play none none none",
      },
    });

    return () => {
      tween.kill();
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === el) st.kill();
      });
    };
  }, [delay, splitLines]);

  return (
    <Tag ref={ref as never} className={`${styles.reveal} ${className}`.trim()}>
      {children}
    </Tag>
  );
}

export function MottoLine({ children }: { children: React.ReactNode }) {
  return (
    <span className={styles.lineWrap}>
      <span className={styles.line}>{children}</span>
    </span>
  );
}
