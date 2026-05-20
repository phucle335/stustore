"use client";

import { useEffect, useState } from "react";
import { HERO_ROTATING_WORDS } from "@/lib/store/home-content";

const INTERVAL_MS = 3200;

export function HomeRotatingWord() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % HERO_ROTATING_WORDS.length);
    }, INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <p className="home-hero-eyebrow" aria-live="polite">
      <span key={HERO_ROTATING_WORDS[index]} className="home-hero-word-cycle">
        {HERO_ROTATING_WORDS[index]}
      </span>
    </p>
  );
}
