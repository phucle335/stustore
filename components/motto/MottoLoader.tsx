"use client";

import { useEffect, useState } from "react";
import { StusportLogo } from "@/components/brand/StusportLogo";
import styles from "@/styles/components/motto/MottoLoader.module.css";

const REVEAL_MS = 60;
const HOLD_MS = 1050;
const EXIT_MS = 950;

type MottoLoaderProps = {
  onComplete: () => void;
};

export function MottoLoader({ onComplete }: MottoLoaderProps) {
  const [phase, setPhase] = useState<"idle" | "in" | "out" | "done">("idle");

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReduced) {
      onComplete();
      setPhase("done");
      return;
    }

    const t1 = window.setTimeout(() => setPhase("in"), REVEAL_MS);
    const t2 = window.setTimeout(() => setPhase("out"), REVEAL_MS + HOLD_MS);
    const t3 = window.setTimeout(() => {
      setPhase("done");
      onComplete();
    }, REVEAL_MS + HOLD_MS + EXIT_MS);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  if (phase === "done") return null;

  return (
    <div
      className={`${styles.loader} ${phase === "in" || phase === "out" ? styles.isIn : ""} ${phase === "out" ? styles.isOut : ""}`}
      aria-hidden
    >
      <div className={styles.loaderInner}>
        <div className={styles.loaderLogo}>
          <StusportLogo variant="mark" tone="on-dark" priority />
        </div>
        <span className={styles.loaderAccent} />
      </div>
    </div>
  );
}
