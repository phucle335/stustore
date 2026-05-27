"use client";

import { useEffect, useState } from "react";
import { StusportLogo } from "@/components/brand/StusportLogo";

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

    const t1 = window.setTimeout(() => setPhase("in"), 50);
    const t2 = window.setTimeout(() => setPhase("out"), 1400);
    const t3 = window.setTimeout(() => {
      setPhase("done");
      onComplete();
    }, 2600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  if (phase === "done") return null;

  return (
    <div
      className={`motto-loader ${phase === "in" ? "is-in" : ""} ${phase === "out" ? "is-out" : ""}`}
      aria-hidden
    >
      <div className="motto-loader-inner">
        <div className="motto-loader-logo">
          <StusportLogo variant="mark" />
        </div>
      </div>
    </div>
  );
}
