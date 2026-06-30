"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { StusportLogo } from "@/components/brand/StusportLogo";
import styles from "@/styles/components/motto/MottoLoader.module.css";

const HOLD_MS = 1100;
const EXIT_MS = 900;
/** Desktop paint fast — ensures loader always shows long enough */
const MIN_VISIBLE_MS = 1900;
const REDUCED_MIN_MS = 550;

type MottoLoaderProps = {
  onComplete: () => void;
};

export function MottoLoader({ onComplete }: MottoLoaderProps) {
  const [phase, setPhase] = useState<"in" | "out" | "done">("in");
  const completedRef = useRef(false);

  const finish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    setPhase("done");
    onComplete();
  }, [onComplete]);

  useLayoutEffect(() => {
    completedRef.current = false;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const startedAt = performance.now();

    const scheduleFinish = () => {
      const minTotal = reduced ? REDUCED_MIN_MS : MIN_VISIBLE_MS;
      const wait = Math.max(0, minTotal - (performance.now() - startedAt));
      const id = window.setTimeout(() => finish(), wait);
      return id;
    };

    if (reduced) {
      setPhase("in");
      const outId = window.setTimeout(() => setPhase("out"), 220);
      const doneId = scheduleFinish();
      return () => {
        window.clearTimeout(outId);
        window.clearTimeout(doneId);
      };
    }

    setPhase("in");
    const outId = window.setTimeout(() => setPhase("out"), HOLD_MS);
    const doneId = window.setTimeout(
      () => scheduleFinish(),
      HOLD_MS + EXIT_MS,
    );

    return () => {
      window.clearTimeout(outId);
      window.clearTimeout(doneId);
    };
  }, [finish]);

  if (phase === "done") return null;

  return (
    <div
      className={`${styles.loader} ${styles.isIn} ${phase === "out" ? styles.isOut : ""}`}
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
